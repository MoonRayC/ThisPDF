const analyticsService = require('../services/analytics.service');
const { EVENT_TYPES, TARGET_TYPES } = require('../constants/kafkaTopics');

class EventsController {
  // Track PDF view
  async trackPdfView(req, res, next) {
    try {
      const { pdfId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const eventData = {
        event_type: EVENT_TYPES.VIEW,
        user_id: userId,
        target_id: pdfId,
        target_type: TARGET_TYPES.PDF,
        timestamp: new Date().toISOString()
      };

      await analyticsService.processEvent(eventData);
      res.status(201).json({ success: true, message: 'PDF view tracked' });
    } catch (error) {
      next(error);
    }
  }

  // Track reading session start
  async trackReadingStart(req, res, next) {
    try {
      const { pdfId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const eventData = {
        event_type: EVENT_TYPES.READING_START,
        user_id: userId,
        target_id: pdfId,
        target_type: TARGET_TYPES.PDF,
        timestamp: new Date().toISOString()
      };

      await analyticsService.processEvent(eventData);
      res.status(201).json({ success: true, message: 'Reading session started' });
    } catch (error) {
      next(error);
    }
  }

  // Track reading session end
  async trackReadingEnd(req, res, next) {
    try {
      const { pdfId } = req.params;
      const { duration } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const eventData = {
        event_type: EVENT_TYPES.READING_END,
        user_id: userId,
        target_id: pdfId,
        target_type: TARGET_TYPES.PDF,
        duration: duration || 0,
        timestamp: new Date().toISOString()
      };

      await analyticsService.processEvent(eventData);
      res.status(201).json({ success: true, message: 'Reading session ended' });
    } catch (error) {
      next(error);
    }
  }

  // Track PDF like
  async trackPdfLike(req, res, next) {
    try {
      const { pdfId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const eventData = {
        event_type: EVENT_TYPES.LIKE,
        user_id: userId,
        target_id: pdfId,
        target_type: TARGET_TYPES.PDF,
        timestamp: new Date().toISOString()
      };

      await analyticsService.processEvent(eventData);
      res.status(201).json({ success: true, message: 'PDF like tracked' });
    } catch (error) {
      next(error);
    }
  }

  // Track PDF favorite
  async trackPdfFavorite(req, res, next) {
    try {
      const { pdfId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const eventData = {
        event_type: EVENT_TYPES.FAVORITE,
        user_id: userId,
        target_id: pdfId,
        target_type: TARGET_TYPES.PDF,
        timestamp: new Date().toISOString()
      };

      await analyticsService.processEvent(eventData);
      res.status(201).json({ success: true, message: 'PDF favorite tracked' });
    } catch (error) {
      next(error);
    }
  }

  // Track PDF rating
  async trackPdfRating(req, res, next) {
    try {
      const { pdfId } = req.params;
      const { rating } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const eventData = {
        event_type: EVENT_TYPES.RATE,
        user_id: userId,
        target_id: pdfId,
        target_type: TARGET_TYPES.PDF,
        rating: parseInt(rating),
        timestamp: new Date().toISOString()
      };

      await analyticsService.processEvent(eventData);
      res.status(201).json({ success: true, message: 'PDF rating tracked' });
    } catch (error) {
      next(error);
    }
  }

  // Track comment posted
  async trackCommentPosted(req, res, next) {
    try {
      const { commentId } = req.params;
      const { pdfId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const eventData = {
        event_type: EVENT_TYPES.COMMENT,
        user_id: userId,
        target_id: commentId,
        target_type: TARGET_TYPES.COMMENT,
        timestamp: new Date().toISOString(),
        metadata: {
          pdf_id: pdfId
        }
      };

      await analyticsService.processEvent(eventData);
      res.status(201).json({ success: true, message: 'Comment posted tracked' });
    } catch (error) {
      next(error);
    }
  }

  // Track comment like
  async trackCommentLike(req, res, next) {
    try {
      const { commentId } = req.params;
      const { pdfId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const eventData = {
        event_type: EVENT_TYPES.LIKE,
        user_id: userId,
        target_id: commentId,
        target_type: TARGET_TYPES.COMMENT,
        timestamp: new Date().toISOString(),
        metadata: {
          pdf_id: pdfId
        }
      };

      await analyticsService.processEvent(eventData);
      res.status(201).json({ success: true, message: 'Comment like tracked' });
    } catch (error) {
      next(error);
    }
  }

  // Track PDF upload
  async trackPdfUpload(req, res, next) {
    try {
      const { pdfId } = req.params;
      const { category } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const eventData = {
        event_type: EVENT_TYPES.UPLOAD,
        user_id: userId,
        target_id: pdfId,
        target_type: TARGET_TYPES.PDF,
        timestamp: new Date().toISOString(),
        metadata: {
          category: category || 'uncategorized'
        }
      };

      await analyticsService.processEvent(eventData);
      res.status(201).json({ success: true, message: 'PDF upload tracked' });
    } catch (error) {
      next(error);
    }
  }

  // Track profile view
  async trackProfileView(req, res, next) {
    try {
      const { profileUserId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Don't track self-views
      if (userId === profileUserId) {
        return res.status(200).json({ success: true, message: 'Self-view ignored' });
      }

      const eventData = {
        event_type: EVENT_TYPES.PROFILE_VIEW,
        user_id: userId,
        target_id: profileUserId,
        target_type: TARGET_TYPES.USER,
        timestamp: new Date().toISOString(),
        metadata: {
          viewer_id: userId
        }
      };

      await analyticsService.processEvent(eventData);
      res.status(201).json({ success: true, message: 'Profile view tracked' });
    } catch (error) {
      next(error);
    }
  }

  // Generic event tracker for custom events
  async trackCustomEvent(req, res, next) {
    try {
      const { eventType, targetId, targetType, metadata, duration, rating } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!eventType || !targetId || !targetType) {
        return res.status(400).json({ 
          error: 'eventType, targetId, and targetType are required' 
        });
      }

      const eventData = {
        event_type: eventType,
        user_id: userId,
        target_id: targetId,
        target_type: targetType,
        timestamp: new Date().toISOString(),
        duration: duration || 0,
        rating: rating || 0,
        metadata: metadata || {}
      };

      await analyticsService.processEvent(eventData);
      res.status(201).json({ success: true, message: 'Custom event tracked' });
    } catch (error) {
      next(error);
    }
  }

  // Batch event tracking
  async trackBatchEvents(req, res, next) {
    try {
      const { events } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ error: 'Events array is required' });
      }

      if (events.length > 100) {
        return res.status(400).json({ error: 'Maximum 100 events per batch' });
      }

      const processedEvents = [];
      const errors = [];

      for (let i = 0; i < events.length; i++) {
        try {
          const event = events[i];
          const eventData = {
            event_type: event.eventType,
            user_id: userId,
            target_id: event.targetId,
            target_type: event.targetType,
            timestamp: event.timestamp || new Date().toISOString(),
            duration: event.duration || 0,
            rating: event.rating || 0,
            metadata: event.metadata || {}
          };

          await analyticsService.processEvent(eventData);
          processedEvents.push({ index: i, status: 'success' });
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.status(207).json({ 
        success: true, 
        processed: processedEvents.length,
        errors: errors.length,
        details: { processedEvents, errors }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventsController();