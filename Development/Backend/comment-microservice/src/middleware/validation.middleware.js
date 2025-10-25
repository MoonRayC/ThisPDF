const mongoose = require('mongoose');

const validateCommentCreate = (req, res, next) => {
  const { file_id, text } = req.body;

  if (!file_id) {
    return res.status(400).json({ error: 'file_id is required' });
  }

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'text is required' });
  }

  if (text.length > 2000) {
    return res.status(400).json({ error: 'Comment text cannot exceed 2000 characters' });
  }

  // Sanitize text
  req.body.text = text.trim();

  next();
};

const validateCommentUpdate = (req, res, next) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'text is required' });
  }

  if (text.length > 2000) {
    return res.status(400).json({ error: 'Comment text cannot exceed 2000 characters' });
  }

  // Sanitize text
  req.body.text = text.trim();

  next();
};

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid ${paramName}` });
    }
    
    next();
  };
};

const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Validate ranges
  if (page < 1) {
    return res.status(400).json({ error: 'Page must be greater than 0' });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({ error: 'Limit must be between 1 and 100' });
  }

  req.pagination = { page, limit };
  next();
};

const validateFileId = (req, res, next) => {
  const { file_id } = req.params;

  if (!file_id || file_id.trim().length === 0) {
    return res.status(400).json({ error: 'file_id is required' });
  }

  next();
};

module.exports = {
  validateCommentCreate,
  validateCommentUpdate,
  validateObjectId,
  validatePagination,
  validateFileId
};