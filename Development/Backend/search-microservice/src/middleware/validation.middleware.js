const Joi = require('joi');

// Document schema for indexing
const documentSchema = Joi.object({
  file_id: Joi.string().required(),
  title: Joi.string().required().min(1).max(255),
  description: Joi.string().allow('').max(1000),
  tags: Joi.array().items(Joi.string().max(50)).default([]),
  category: Joi.string().required().max(100),
  subcategory: Joi.string().allow('').max(100),
  visibility: Joi.string().valid('public', 'private').default('public'),
  created_at: Joi.date().iso().default(() => new Date()),
  updated_at: Joi.date().iso().default(() => new Date())
});

// Search query schema
const searchQuerySchema = Joi.object({
  q: Joi.string().allow('').max(200),
  category: Joi.string().max(100),
  tags: Joi.string().max(500), // Comma-separated tags
  visibility: Joi.string().valid('public', 'private'),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

const suggestionsQuerySchema = Joi.object({
  q: Joi.string().min(1).max(200).required(),
  limit: Joi.number().integer().min(1).max(20).default(5)
});

// Bulk index schema
const bulkIndexSchema = Joi.object({
  documents: Joi.array().items(documentSchema).min(1).max(100).required()
});

// Validation middleware factory
const validateSchema = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : req.body;
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Replace the original data with validated data
    if (source === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }
    
    next();
  };
};

// Specific validation middlewares
const validateDocument = validateSchema(documentSchema);
const validateSearchQuery = validateSchema(searchQuerySchema, 'query');
const validateSuggestionsQuery = validateSchema(suggestionsQuerySchema, 'query');
const validateBulkIndex = validateSchema(bulkIndexSchema);

// File ID parameter validation
const validateFileId = (req, res, next) => {
  const { file_id } = req.params;
  
  if (!file_id || file_id.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'file_id parameter is required'
    });
  }
  
  if (file_id.length > 255) {
    return res.status(400).json({
      success: false,
      message: 'file_id is too long (max 255 characters)'
    });
  }
  
  next();
};

module.exports = {
  validateDocument,
  validateSearchQuery,
  validateSuggestionsQuery,
  validateBulkIndex,
  validateFileId,
  validateSchema
};