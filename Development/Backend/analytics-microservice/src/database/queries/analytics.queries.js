const config = require('../../config');
const db = config.clickhouse.database;

const queries = {
  // PDF Analytics
  getPdfStats: `
    SELECT 
      event_type,
      count() as count,
      avg(rating) as avg_rating,
      avg(duration) as avg_duration
    FROM ${db}.events 
    WHERE target_id = {pdfId:UUID} 
      AND target_type = 'pdf'
    GROUP BY event_type
  `,

  getPdfRating: `
    SELECT 
      avg(rating) as average_rating,
      count() as total_ratings
    FROM ${db}.events 
    WHERE target_id = {pdfId:UUID} 
      AND target_type = 'pdf' 
      AND event_type = 'rate'
      AND rating > 0
  `,

  getPdfCommentStats: `
    SELECT 
      count() as total_comments,
      countIf(event_type = 'like') as total_likes
    FROM ${db}.events 
    WHERE target_id = {pdfId:UUID} 
      AND target_type IN ('pdf', 'comment')
      AND event_type IN ('comment', 'like')
  `,

  // User Analytics
  getUserPopularity: `
    SELECT 
      count() as total_views,
      uniq(user_id) as unique_viewers
    FROM ${db}.events 
    WHERE target_id = {userId:UUID} 
      AND target_type = 'user' 
      AND event_type = 'profile_view'
  `,

  getUserUploads: `
    SELECT 
      count() as total_uploads,
      avg(views.view_count) as avg_views_per_upload
    FROM (
      SELECT target_id
      FROM ${db}.events 
      WHERE user_id = {userId:UUID} 
        AND event_type = 'upload'
    ) uploads
    LEFT JOIN (
      SELECT 
        target_id,
        count() as view_count
      FROM ${db}.events 
      WHERE event_type = 'view'
      GROUP BY target_id
    ) views ON uploads.target_id = views.target_id
  `,

  getUserPersonalStats: `
    SELECT 
      event_type,
      count() as count,
      sum(duration) as total_duration
    FROM ${db}.events 
    WHERE user_id = {userId:UUID}
    GROUP BY event_type
  `,

  // Trending & Leaderboards
  getTopUsers: `
    SELECT 
      user_id,
      count() as total_engagement,
      countIf(event_type = 'view') as views,
      countIf(event_type = 'like') as likes,
      countIf(event_type = 'favorite') as favorites
    FROM ${db}.events 
    WHERE event_type IN ('view', 'like', 'favorite')
      AND timestamp >= now() - INTERVAL {period:String}
    GROUP BY user_id
    ORDER BY total_engagement DESC
    LIMIT {limit:Int32}
  `,

  getTopPdfs: `
    SELECT 
      target_id as pdf_id,
      count() as total_engagement,
      countIf(event_type = 'view') as views,
      countIf(event_type = 'like') as likes,
      countIf(event_type = 'favorite') as favorites,
      avg(rating) as avg_rating
    FROM ${db}.events 
    WHERE target_type = 'pdf'
      AND event_type IN ('view', 'like', 'favorite', 'rate')
      AND timestamp >= now() - INTERVAL {period:String}
    GROUP BY target_id
    ORDER BY total_engagement DESC
    LIMIT {limit:Int32}
  `,

  getTrendingPdfs: `
    SELECT 
      target_id as pdf_id,
      count() as engagement_score,
      countIf(event_type = 'view') as views,
      countIf(event_type = 'like') as likes
    FROM ${db}.events 
    WHERE target_type = 'pdf'
      AND event_type IN ('view', 'like')
      AND timestamp >= now() - INTERVAL 24 HOUR
    GROUP BY target_id
    HAVING engagement_score > 5
    ORDER BY engagement_score DESC
    LIMIT {limit:Int32}
  `,

  getTopCategories: `
    SELECT 
      JSONExtractString(metadata, 'category') as category,
      count() as engagement_count
    FROM ${db}.events 
    WHERE event_type IN ('view', 'like', 'reading_start')
      AND timestamp >= now() - INTERVAL {period:String}
      AND JSONExtractString(metadata, 'category') != ''
    GROUP BY category
    ORDER BY engagement_count DESC
    LIMIT {limit:Int32}
  `,

  // General Stats
  getEventTypeCount: `
    SELECT count() as count
    FROM ${db}.events 
    WHERE event_type = {eventType:String}
      AND timestamp >= now() - INTERVAL {period:String}
  `,

  getPlatformSummary: `
    SELECT 
      uniq(user_id) as daily_active_users,
      count() as total_events,
      countIf(event_type = 'view') as total_views,
      countIf(event_type = 'like') as total_likes,
      countIf(event_type = 'upload') as total_uploads,
      countIf(event_type = 'reading_start') as reading_sessions
    FROM ${db}.events 
    WHERE timestamp >= now() - INTERVAL 24 HOUR
  `,

  // Time-based analytics
  getEngagementOverTime: `
    SELECT 
      toStartOfHour(timestamp) as hour,
      count() as events
    FROM ${db}.events 
    WHERE timestamp >= now() - INTERVAL {period:String}
    GROUP BY hour
    ORDER BY hour
  `,

  getReadingPatterns: `
    SELECT 
      toHour(timestamp) as hour_of_day,
      avg(duration) as avg_reading_duration,
      count() as reading_sessions
    FROM ${db}.events 
    WHERE event_type = 'reading_end'
      AND timestamp >= now() - INTERVAL {period:String}
    GROUP BY hour_of_day
    ORDER BY hour_of_day
  `
};

module.exports = queries;