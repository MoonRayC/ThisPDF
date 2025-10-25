const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  // PDF Analytics (Public)
  async getPdfStats(req, res, next) {
    try {
      const { pdfId } = req.params;
      const stats = await analyticsService.getPdfStats(pdfId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getPdfRating(req, res, next) {
    try {
      const { pdfId } = req.params;
      const rating = await analyticsService.getPdfRating(pdfId);
      res.json(rating);
    } catch (error) {
      next(error);
    }
  }

  async getPdfComments(req, res, next) {
    try {
      const { pdfId } = req.params;
      const comments = await analyticsService.getPdfCommentStats(pdfId);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  // User Analytics (Public)
  async getUserPopularity(req, res, next) {
    try {
      const { userId } = req.params;
      const popularity = await analyticsService.getUserPopularity(userId);
      res.json(popularity);
    } catch (error) {
      next(error);
    }
  }

  async getUserUploads(req, res, next) {
    try {
      const { userId } = req.params;
      const uploads = await analyticsService.getUserUploads(userId);
      res.json(uploads);
    } catch (error) {
      next(error);
    }
  }

  // Personal User Analytics (Private)
  async getUserPersonalStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await analyticsService.getUserPersonalStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // Trending & Leaderboards (Public)
  async getTopUsers(req, res, next) {
    try {
      const { limit = 10, period = '7d' } = req.query;
      const topUsers = await analyticsService.getTopUsers(parseInt(limit), period);
      res.json(topUsers);
    } catch (error) {
      next(error);
    }
  }

  async getTopPdfs(req, res, next) {
    try {
      const { limit = 10, period = '7d', sortBy = 'engagement' } = req.query;
      const topPdfs = await analyticsService.getTopPdfs(parseInt(limit), period);
      res.json(topPdfs);
    } catch (error) {
      next(error);
    }
  }

  async getTrendingPdfs(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const trending = await analyticsService.getTrendingPdfs(parseInt(limit));
      res.json(trending);
    } catch (error) {
      next(error);
    }
  }

  async getTopCategories(req, res, next) {
    try {
      const { limit = 10, period = '7d' } = req.query;
      const categories = await analyticsService.getTopCategories(parseInt(limit), period);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  // General Platform Stats (Public)
  async getEventTypeCount(req, res, next) {
    try {
      const { eventType } = req.params;
      const { period = '24h' } = req.query;
      const count = await analyticsService.getEventTypeCount(eventType, period);
      res.json(count);
    } catch (error) {
      next(error);
    }
  }

  async getPlatformSummary(req, res, next) {
    try {
      const summary = await analyticsService.getPlatformSummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  // Time-based analytics
  async getEngagementOverTime(req, res, next) {
    try {
      const { period = '24h' } = req.query;
      const engagement = await analyticsService.getEngagementOverTime(period);
      res.json(engagement);
    } catch (error) {
      next(error);
    }
  }

  async getReadingPatterns(req, res, next) {
    try {
      const { period = '7d' } = req.query;
      const patterns = await analyticsService.getReadingPatterns(period);
      res.json(patterns);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();