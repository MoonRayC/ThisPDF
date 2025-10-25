const clickHouseClient = require('../database/clickHouse');
const queries = require('../database/queries/analytics.queries');
const { EVENT_TYPES, TARGET_TYPES } = require('../constants/kafkaTopics');

class AnalyticsService {
  constructor() {
    this.clickhouse = clickHouseClient;
  }

  // PDF Analytics
  async getPdfStats(pdfId) {
    try {
      const stats = await this.clickhouse.query(queries.getPdfStats, { pdfId });
      
      // Transform array to object for easier consumption
      const result = {
        views: 0,
        likes: 0,
        favorites: 0,
        reading_sessions: 0,
        avg_reading_duration: 0,
        total_ratings: 0,
        avg_rating: 0
      };

      stats.forEach(stat => {
        switch (stat.event_type) {
          case EVENT_TYPES.VIEW:
            result.views = stat.count;
            break;
          case EVENT_TYPES.LIKE:
            result.likes = stat.count;
            break;
          case EVENT_TYPES.FAVORITE:
            result.favorites = stat.count;
            break;
          case EVENT_TYPES.READING_END:
            result.reading_sessions = stat.count;
            result.avg_reading_duration = stat.avg_duration;
            break;
          case EVENT_TYPES.RATE:
            result.total_ratings = stat.count;
            result.avg_rating = stat.avg_rating;
            break;
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting PDF stats:', error);
      throw new Error('Failed to retrieve PDF statistics');
    }
  }

  async getPdfRating(pdfId) {
    try {
      const result = await this.clickhouse.query(queries.getPdfRating, { pdfId });
      return result[0] || { average_rating: 0, total_ratings: 0 };
    } catch (error) {
      console.error('Error getting PDF rating:', error);
      throw new Error('Failed to retrieve PDF rating');
    }
  }

  async getPdfCommentStats(pdfId) {
    try {
      const result = await this.clickhouse.query(queries.getPdfCommentStats, { pdfId });
      return result[0] || { total_comments: 0, total_likes: 0 };
    } catch (error) {
      console.error('Error getting PDF comment stats:', error);
      throw new Error('Failed to retrieve PDF comment statistics');
    }
  }

  // User Analytics
  async getUserPopularity(userId) {
    try {
      const result = await this.clickhouse.query(queries.getUserPopularity, { userId });
      return result[0] || { total_views: 0, unique_viewers: 0 };
    } catch (error) {
      console.error('Error getting user popularity:', error);
      throw new Error('Failed to retrieve user popularity');
    }
  }

  async getUserUploads(userId) {
    try {
      const result = await this.clickhouse.query(queries.getUserUploads, { userId });
      return result[0] || { total_uploads: 0, avg_views_per_upload: 0 };
    } catch (error) {
      console.error('Error getting user uploads:', error);
      throw new Error('Failed to retrieve user upload statistics');
    }
  }

  async getUserPersonalStats(userId) {
    try {
      const stats = await this.clickhouse.query(queries.getUserPersonalStats, { userId });
      
      const result = {
        total_views: 0,
        total_likes: 0,
        total_favorites: 0,
        total_uploads: 0,
        total_reading_time: 0,
        reading_sessions: 0
      };

      stats.forEach(stat => {
        switch (stat.event_type) {
          case EVENT_TYPES.VIEW:
            result.total_views = stat.count;
            break;
          case EVENT_TYPES.LIKE:
            result.total_likes = stat.count;
            break;
          case EVENT_TYPES.FAVORITE:
            result.total_favorites = stat.count;
            break;
          case EVENT_TYPES.UPLOAD:
            result.total_uploads = stat.count;
            break;
          case EVENT_TYPES.READING_END:
            result.reading_sessions = stat.count;
            result.total_reading_time = stat.total_duration;
            break;
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting user personal stats:', error);
      throw new Error('Failed to retrieve user personal statistics');
    }
  }

  // Trending & Leaderboards
  async getTopUsers(limit = 10, period = '7d') {
    try {
      const result = await this.clickhouse.query(queries.getTopUsers, { limit, period });
      return result;
    } catch (error) {
      console.error('Error getting top users:', error);
      throw new Error('Failed to retrieve top users');
    }
  }

  async getTopPdfs(limit = 10, period = '7d') {
    try {
      const result = await this.clickhouse.query(queries.getTopPdfs, { limit, period });
      return result;
    } catch (error) {
      console.error('Error getting top PDFs:', error);
      throw new Error('Failed to retrieve top PDFs');
    }
  }

  async getTrendingPdfs(limit = 10) {
    try {
      const result = await this.clickhouse.query(queries.getTrendingPdfs, { limit });
      return result;
    } catch (error) {
      console.error('Error getting trending PDFs:', error);
      throw new Error('Failed to retrieve trending PDFs');
    }
  }

  async getTopCategories(limit = 10, period = '7d') {
    try {
      const result = await this.clickhouse.query(queries.getTopCategories, { limit, period });
      return result;
    } catch (error) {
      console.error('Error getting top categories:', error);
      throw new Error('Failed to retrieve top categories');
    }
  }

  // General Stats
  async getEventTypeCount(eventType, period = '24h') {
    try {
      const result = await this.clickhouse.query(queries.getEventTypeCount, { eventType, period });
      return result[0] || { count: 0 };
    } catch (error) {
      console.error('Error getting event type count:', error);
      throw new Error('Failed to retrieve event count');
    }
  }

  async getPlatformSummary() {
    try {
      const result = await this.clickhouse.query(queries.getPlatformSummary);
      return result[0] || {
        daily_active_users: 0,
        total_events: 0,
        total_views: 0,
        total_likes: 0,
        total_uploads: 0,
        reading_sessions: 0
      };
    } catch (error) {
      console.error('Error getting platform summary:', error);
      throw new Error('Failed to retrieve platform summary');
    }
  }

  // Time-based analytics
  async getEngagementOverTime(period = '24h') {
    try {
      const result = await this.clickhouse.query(queries.getEngagementOverTime, { period });
      return result;
    } catch (error) {
      console.error('Error getting engagement over time:', error);
      throw new Error('Failed to retrieve engagement timeline');
    }
  }

  async getReadingPatterns(period = '7d') {
    try {
      const result = await this.clickhouse.query(queries.getReadingPatterns, { period });
      return result;
    } catch (error) {
      console.error('Error getting reading patterns:', error);
      throw new Error('Failed to retrieve reading patterns');
    }
  }

  // Event Processing
  async processEvent(eventData) {
    try {
      const processedEvent = this.normalizeEvent(eventData);
      await this.clickhouse.insertEvent(processedEvent);
      console.log(`✅ Event processed: ${processedEvent.event_type}`);
    } catch (error) {
      console.error('Error processing event:', error);
      throw error;
    }
  }

  normalizeEvent(eventData) {
    const timestamp = new Date(eventData.timestamp || Date.now());
    
    return {
      event_type: eventData.event_type,
      user_id: eventData.user_id,
      target_id: eventData.target_id || eventData.pdf_id || eventData.comment_id || eventData.profile_user_id,
      target_type: eventData.target_type || this.inferTargetType(eventData),
      timestamp: timestamp.toISOString().replace('T', ' ').replace('Z', ''),
      duration: eventData.duration || 0,
      rating: eventData.rating || 0,
      metadata: JSON.stringify(eventData.metadata || {})
    };
  }

  inferTargetType(eventData) {
    if (eventData.pdf_id) return TARGET_TYPES.PDF;
    if (eventData.comment_id) return TARGET_TYPES.COMMENT;
    if (eventData.profile_user_id) return TARGET_TYPES.USER;
    return TARGET_TYPES.PDF; // default
  }
}

module.exports = new AnalyticsService();