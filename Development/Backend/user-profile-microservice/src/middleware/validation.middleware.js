const Joi = require('joi');

const validationSchemas = {
  createProfile: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required(),
    bio: Joi.string().max(500).allow('', null),
    avatar_url: Joi.string().uri().max(500).allow('', null)
  }),

  updateProfile: Joi.object({
    username: Joi.string().alphanum().min(3).max(50),
    bio: Joi.string().max(500).allow('', null),
    avatar_url: Joi.string().uri().max(500).allow('', null)
  }).min(1),

  deleteProfile: Joi.object({
    confirmation_text: Joi.string().required()
  }),

  uuidParam: Joi.object({
    user_id: Joi.string().uuid().required()
  }),

  usernameParam: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required()
  }),

  bulkUserIdArray: Joi.object({
    user_ids: Joi.array().items(Joi.string().uuid()).min(1).required()
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

module.exports = {
  validationSchemas,
  validate,
  validateParams,
  validateQuery
};