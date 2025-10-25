const Joi = require('joi');

const validateFileId = (req, res, next) => {
  const schema = Joi.object({
    file_id: Joi.string().uuid().required()
  });

  const { error } = schema.validate(req.params);
  
  if (error) {
    return res.status(400).json({
      error: 'Invalid file ID format',
      details: error.details[0].message
    });
  }

  next();
};

module.exports = {
  validateFileId
};