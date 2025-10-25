const { createClient } = require('@clickhouse/client');
const config = require('../config');

class ClickHouseClient {
  constructor() {
    this.client = createClient({
      host: `http://${config.clickhouse.host}:${config.clickhouse.port}`,
      username: config.clickhouse.username,
      password: config.clickhouse.password,
      database: config.clickhouse.database,
      clickhouse_settings: {
        async_insert: 1,
        wait_for_async_insert: 1,
      },
    });
  }

  async connect() {
    try {
      await this.client.ping();
      console.log('✅ Connected to ClickHouse');
      await this.initializeDatabase();
    } catch (error) {
      console.error('❌ ClickHouse connection error:', error);
      throw error;
    }
  }

  async initializeDatabase() {
    try {
      // Create database if not exists
      await this.client.exec({
        query: `CREATE DATABASE IF NOT EXISTS ${config.clickhouse.database}`
      });

      // Create events table
      await this.client.exec({
        query: `
          CREATE TABLE IF NOT EXISTS ${config.clickhouse.database}.events (
            event_type String,
            user_id UUID,
            target_id UUID,
            target_type String,
            timestamp DateTime,
            duration Float32 DEFAULT 0,
            rating Int32 DEFAULT 0,
            metadata JSON DEFAULT '{}'
          ) ENGINE = MergeTree()
          ORDER BY (event_type, timestamp)
        `
      });

      // Create materialized views for common queries
      await this.client.exec({
        query: `
          CREATE MATERIALIZED VIEW IF NOT EXISTS ${config.clickhouse.database}.pdf_stats_mv
          ENGINE = SummingMergeTree()
          ORDER BY (target_id, event_type)
          AS SELECT
            target_id,
            event_type,
            count() as count,
            avg(rating) as avg_rating,
            avg(duration) as avg_duration
          FROM ${config.clickhouse.database}.events
          WHERE target_type = 'pdf'
          GROUP BY target_id, event_type
        `
      });

      console.log('✅ ClickHouse database initialized');
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw error;
    }
  }

  async insertEvent(eventData) {
    try {
      await this.client.insert({
        table: 'events',
        values: [eventData],
        format: 'JSONEachRow'
      });
    } catch (error) {
      console.error('❌ Insert event error:', error);
      throw error;
    }
  }

  async query(sql, params = {}) {
    try {
      const result = await this.client.query({
        query: sql,
        query_params: params,
        format: 'JSONEachRow'
      });
      return await result.json();
    } catch (error) {
      console.error('❌ Query error:', error);
      throw error;
    }
  }

  async close() {
    await this.client.close();
  }
}

const clickHouseClient = new ClickHouseClient();
module.exports = clickHouseClient;