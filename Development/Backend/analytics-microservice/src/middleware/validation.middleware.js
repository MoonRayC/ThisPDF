const Joi = require('joi');

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

// Common validation schemas
const schemas = {
  uuid: Joi.string().uuid().required(),
  pdfId: Joi.object({
    pdfId: Joi.string().uuid().required()
  }),
  userId: Joi.object({
    userId: Joi.string().uuid().required()
  }),
  eventType: Joi.object({
    eventType: Joi.string().valid(
      'view', 'like', 'favorite', 'rate', 'comment', 
      'upload', 'reading_start', 'reading_end', 'profile_view'
    ).required()
  }),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('timestamp', 'rating', 'views', 'likes').default('timestamp'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),
  timeRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')),
    period: Joi.string().valid('1h', '24h', '7d', '30d', '90d').default('24h')
  }).oxor('period', 'startDate')
};

const eventSchemas = {
  pdfId: Joi.object({
    pdfId: Joi.string().uuid().required()
  }),
  commentId: Joi.object({
    commentId: Joi.string().uuid().required()
  }),
  profileUserId: Joi.object({
    profileUserId: Joi.string().uuid().required()
  }),
  readingEnd: Joi.object({
    duration: Joi.number().min(0).required()
  }),
  rating: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required()
  }),
  commentPost: Joi.object({
    pdfId: Joi.string().uuid().required()
  }),
  commentLike: Joi.object({
    pdfId: Joi.string().uuid().required()
  }),
  pdfUpload: Joi.object({
    category: Joi.string().max(50).optional()
  }),
  customEvent: Joi.object({
    eventType: Joi.string().valid(
      'view', 'like', 'favorite', 'rate', 'comment', 
      'upload', 'reading_start', 'reading_end', 'profile_view'
    ).required(),
    targetId: Joi.string().uuid().required(),
    targetType: Joi.string().valid('pdf', 'comment', 'user').required(),
    duration: Joi.number().min(0).optional(),
    rating: Joi.number().integer().min(1).max(5).optional(),
    metadata: Joi.object().optional()
  }),
  batchEvents: Joi.object({
    events: Joi.array().items(
      Joi.object({
        eventType: Joi.string().required(),
        targetId: Joi.string().uuid().required(),
        targetType: Joi.string().valid('pdf', 'comment', 'user').required(),
        timestamp: Joi.date().iso().optional(),
        duration: Joi.number().min(0).optional(),
        rating: Joi.number().integer().min(1).max(5).optional(),
        metadata: Joi.object().optional()
      })
    ).min(1).max(100).required()
  })
};

module.exports = {
  validateParams,
  validateBody,
  validateQuery,
  schemas,
  eventSchemas
};