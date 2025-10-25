const Joi = require('joi');

const createMetadataSchema = Joi.object({
  file_id: Joi.string().required(),
  file_url: Joi.string().uri().allow(''),
  image_url: Joi.string().uri().required(),
  title: Joi.string().max(255).required(),
  description: Joi.string().allow(''),
  tags: Joi.array().items(Joi.string()).default([]),
  category: Joi.string().max(100).allow(''),
  subcategory: Joi.string().max(100).allow(''),
  pages: Joi.number().integer().min(1).allow(null),
  size_kb: Joi.number().integer().min(1).allow(null),
  visibility: Joi.string().valid('public', 'private', 'friends').default('private')
});

const updateMetadataSchema = Joi.object({
  title: Joi.string().max(255),
  description: Joi.string().allow(''),
  tags: Joi.array().items(Joi.string()),
  category: Joi.string().max(100).allow(''),
  subcategory: Joi.string().max(100).allow(''),
  visibility: Joi.string().valid('public', 'private', 'friends')
}).min(1);

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('created_at', 'title', 'pages').default('created_at'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

const bulkDeleteSchema = Joi.object({
  file_ids: Joi.array().items(Joi.string()).min(1).required()
});

const fileIdsSchema = Joi.object({
  file_ids: Joi.array().items(Joi.string()).min(1).required()
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }
    
    req.body = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }
    
    req.query = value;
    next();
  };
};

module.exports = {
  createMetadataSchema,
  updateMetadataSchema,
  fileIdsSchema,
  paginationSchema,
  bulkDeleteSchema,
  validateRequest,
  validateQuery
};