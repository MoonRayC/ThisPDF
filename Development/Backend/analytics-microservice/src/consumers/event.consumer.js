const { Kafka } = require('kafkajs');
const config = require('../config');
const analyticsService = require('../services/analytics.service');
const clickHouseClient = require('../database/clickHouse'); // analytics-microservice\src\database\clickhouse.js
const { KAFKA_TOPICS, EVENT_TYPES } = require('../constants/kafkaTopics');

class EventConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      retry: config.kafka.retry
    });

    this.consumer = this.kafka.consumer({ 
      groupId: config.kafka.groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });

    this.topicEventMapping = {
      [KAFKA_TOPICS.PDF_VIEWED]: EVENT_TYPES.VIEW,
      [KAFKA_TOPICS.READING_STARTED]: EVENT_TYPES.READING_START,
      [KAFKA_TOPICS.READING_ENDED]: EVENT_TYPES.READING_END,
      [KAFKA_TOPICS.PDF_LIKED]: EVENT_TYPES.LIKE,
      [KAFKA_TOPICS.COMMENT_LIKED]: EVENT_TYPES.LIKE,
      [KAFKA_TOPICS.PDF_FAVORITED]: EVENT_TYPES.FAVORITE,
      [KAFKA_TOPICS.PDF_RATED]: EVENT_TYPES.RATE,
      [KAFKA_TOPICS.PDF_UPLOADED]: EVENT_TYPES.UPLOAD,
      [KAFKA_TOPICS.PROFILE_VIEWED]: EVENT_TYPES.PROFILE_VIEW,
      [KAFKA_TOPICS.COMMENT_POSTED]: EVENT_TYPES.COMMENT
    };
  }

  async connect() {
    try {
      await this.consumer.connect();
      console.log('✅ Kafka consumer connected');

      // Subscribe to all analytics topics
      const topics = Object.values(KAFKA_TOPICS);
      await this.consumer.subscribe({ topics });
      console.log(`✅ Subscribed to topics: ${topics.join(', ')}`);

      await this.startConsuming();
    } catch (error) {
      console.error('❌ Kafka consumer connection error:', error);
      throw error;
    }
  }

  async startConsuming() {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = JSON.parse(message.value.toString());
          
          console.log(`📨 Received event from topic: ${topic}`, {
            partition,
            offset: message.offset,
            value
          });

          await this.processMessage(topic, value);
        } catch (error) {
          console.error('❌ Error processing message:', error);
          // Don't throw here to avoid stopping the consumer
        }
      },
    });
  }

  async processMessage(topic, messageValue) {
    try {
      const eventType = this.topicEventMapping[topic];
      if (!eventType) {
        console.warn(`⚠️  Unknown topic: ${topic}`);
        return;
      }

      // Transform message based on topic
      const eventData = this.transformMessage(topic, messageValue, eventType);
      
      // Process the event
      await analyticsService.processEvent(eventData);
      
      console.log(`✅ Successfully processed ${eventType} event`);
    } catch (error) {
      console.error(`❌ Error processing ${topic} message:`, error);
      throw error;
    }
  }

  transformMessage(topic, messageValue, eventType) {
    const baseEvent = {
      event_type: eventType,
      user_id: messageValue.user_id,
      timestamp: messageValue.timestamp,
      metadata: {}
    };

    switch (topic) {
      case KAFKA_TOPICS.PDF_VIEWED:
        return {
          ...baseEvent,
          target_id: messageValue.pdf_id,
          target_type: 'pdf'
        };

      case KAFKA_TOPICS.READING_STARTED:
        return {
          ...baseEvent,
          target_id: messageValue.pdf_id,
          target_type: 'pdf'
        };

      case KAFKA_TOPICS.READING_ENDED:
        return {
          ...baseEvent,
          target_id: messageValue.pdf_id,
          target_type: 'pdf',
          duration: messageValue.duration || 0
        };

      case KAFKA_TOPICS.PDF_LIKED:
        return {
          ...baseEvent,
          target_id: messageValue.pdf_id,
          target_type: 'pdf'
        };

      case KAFKA_TOPICS.COMMENT_LIKED:
        return {
          ...baseEvent,
          target_id: messageValue.comment_id,
          target_type: 'comment',
          metadata: {
            pdf_id: messageValue.pdf_id
          }
        };

      case KAFKA_TOPICS.PDF_FAVORITED:
        return {
          ...baseEvent,
          target_id: messageValue.pdf_id,
          target_type: 'pdf'
        };

      case KAFKA_TOPICS.PDF_RATED:
        return {
          ...baseEvent,
          target_id: messageValue.pdf_id,
          target_type: 'pdf',
          rating: messageValue.rating
        };

      case KAFKA_TOPICS.PDF_UPLOADED:
        return {
          ...baseEvent,
          target_id: messageValue.pdf_id,
          target_type: 'pdf',
          metadata: {
            category: messageValue.category
          }
        };

      case KAFKA_TOPICS.PROFILE_VIEWED:
        return {
          ...baseEvent,
          target_id: messageValue.profile_user_id,
          target_type: 'user',
          metadata: {
            viewer_id: messageValue.viewer_id
          }
        };

      case KAFKA_TOPICS.COMMENT_POSTED:
        return {
          ...baseEvent,
          target_id: messageValue.comment_id,
          target_type: 'comment',
          metadata: {
            pdf_id: messageValue.pdf_id
          }
        };

      default:
        return baseEvent;
    }
  }

  async disconnect() {
    try {
      await this.consumer.disconnect();
      console.log('✅ Kafka consumer disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting consumer:', error);
    }
  }
}

// Main function to run the consumer
async function main() {
  const consumer = new EventConsumer();
  
  // Connect to ClickHouse first
  await clickHouseClient.connect();
  
  // Then start consuming events
  await consumer.connect();

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🔄 Received SIGTERM, shutting down gracefully...');
    await consumer.disconnect();
    await clickHouseClient.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('🔄 Received SIGINT, shutting down gracefully...');
    await consumer.disconnect();
    await clickHouseClient.close();
    process.exit(0);
  });
}

// Run consumer if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = EventConsumer;