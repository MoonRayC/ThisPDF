const { 
  MAX_QUERY_LENGTH, 
  MAX_SEARCH_RESULTS, 
  VISIBILITY_OPTIONS,
  VALID_SORT_FIELDS,
  VALID_SORT_ORDERS
} = require('./constants');

// Sanitize search query
const sanitizeQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  // Remove potentially harmful characters
  const sanitized = query
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[{}]/g, '') // Remove curly braces
    .replace(/[\[\]]/g, '') // Remove square brackets
    .replace(/[\\]/g, '') // Remove backslashes
    .trim();
  
  // Limit length
  return sanitized.length > MAX_QUERY_LENGTH 
    ? sanitized.substring(0, MAX_QUERY_LENGTH) 
    : sanitized;
};

// Validate search parameters
const validateSearchParams = (params) => {
  const errors = [];
  const validated = {};
  
  // Validate query
  if (params.q !== undefined) {
    validated.q = sanitizeQuery(params.q);
  }
  
  // Validate limit
  if (params.limit !== undefined) {
    const limit = parseInt(params.limit);
    if (isNaN(limit) || limit < 1) {
      errors.push('Limit must be a positive number');
    } else if (limit > MAX_SEARCH_RESULTS) {
      errors.push(`Limit cannot exceed ${MAX_SEARCH_RESULTS}`);
    } else {
      validated.limit = limit;
    }
  }
  
  // Validate offset
  if (params.offset !== undefined) {
    const offset = parseInt(params.offset);
    if (isNaN(offset) || offset < 0) {
      errors.push('Offset must be a non-negative number');
    } else {
      validated.offset = offset;
    }
  }
  
  // Validate visibility
  if (params.visibility !== undefined) {
    if (!VISIBILITY_OPTIONS.includes(params.visibility)) {
      errors.push(`Visibility must be one of: ${VISIBILITY_OPTIONS.join(', ')}`);
    } else {
      validated.visibility = params.visibility;
    }
  }
  
  // Validate category
  if (params.category !== undefined) {
    if (typeof params.category !== 'string' || params.category.trim() === '') {
      errors.push('Category must be a non-empty string');
    } else {
      validated.category = params.category.trim();
    }
  }
  
  // Validate tags
  if (params.tags !== undefined) {
    if (typeof params.tags !== 'string') {
      errors.push('Tags must be a comma-separated string');
    } else {
      const tagArray = params.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagArray.length > 0) {
        validated.tags = tagArray.join(',');
      }
    }
  }
  
  // Validate sort field
  if (params.sort !== undefined) {
    if (!VALID_SORT_FIELDS.includes(params.sort)) {
      errors.push(`Sort field must be one of: ${VALID_SORT_FIELDS.join(', ')}`);
    } else {
      validated.sort = params.sort;
    }
  }
  
  // Validate sort order
  if (params.order !== undefined) {
    if (!VALID_SORT_ORDERS.includes(params.order)) {
      errors.push(`Sort order must be one of: ${VALID_SORT_ORDERS.join(', ')}`);
    } else {
      validated.order = params.order;
    }
  }
  
  return { errors, validated };
};

// Validate file ID
const validateFileId = (fileId) => {
  if (!fileId || typeof fileId !== 'string') {
    return { valid: false, error: 'File ID is required and must be a string' };
  }
  
  const trimmed = fileId.trim();
  if (trimmed === '') {
    return { valid: false, error: 'File ID cannot be empty' };
  }
  
  if (trimmed.length > 255) {
    return { valid: false, error: 'File ID is too long (max 255 characters)' };
  }
  
  // Check for invalid characters
  const invalidChars = /[<>:"\\|?*\x00-\x1f]/;
  if (invalidChars.test(trimmed)) {
    return { valid: false, error: 'File ID contains invalid characters' };
  }
  
  return { valid: true, fileId: trimmed };
};

// Validate document data
const validateDocumentData = (data) => {
  const errors = [];
  const validated = {};
  
  // Required fields
  if (!data.file_id || typeof data.file_id !== 'string') {
    errors.push('file_id is required and must be a string');
  } else {
    const fileIdValidation = validateFileId(data.file_id);
    if (!fileIdValidation.valid) {
      errors.push(fileIdValidation.error);
    } else {
      validated.file_id = fileIdValidation.fileId;
    }
  }
  
  if (!data.title || typeof data.title !== 'string') {
    errors.push('title is required and must be a string');
  } else {
    validated.title = data.title.trim();
  }
  
  if (!data.category || typeof data.category !== 'string') {
    errors.push('category is required and must be a string');
  } else {
    validated.category = data.category.trim();
  }
  
  // Optional fields
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('description must be a string');
    } else {
      validated.description = data.description.trim();
    }
  }
  
  if (data.subcategory !== undefined) {
    if (typeof data.subcategory !== 'string') {
      errors.push('subcategory must be a string');
    } else {
      validated.subcategory = data.subcategory.trim();
    }
  }
  
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push('tags must be an array');
    } else {
      validated.tags = data.tags.filter(tag => 
        typeof tag === 'string' && tag.trim() !== ''
      ).map(tag => tag.trim());
    }
  }
  
  if (data.visibility !== undefined) {
    if (!VISIBILITY_OPTIONS.includes(data.visibility)) {
      errors.push(`visibility must be one of: ${VISIBILITY_OPTIONS.join(', ')}`);
    } else {
      validated.visibility = data.visibility;
    }
  }
  
  // Timestamps
  if (data.created_at !== undefined) {
    const date = new Date(data.created_at);
    if (isNaN(date.getTime())) {
      errors.push('created_at must be a valid date');
    } else {
      validated.created_at = date.toISOString();
    }
  }
  
  if (data.updated_at !== undefined) {
    const date = new Date(data.updated_at);
    if (isNaN(date.getTime())) {
      errors.push('updated_at must be a valid date');
    } else {
      validated.updated_at = date.toISOString();
    }
  }
  
  return { errors, validated };
};

// Build MeiliSearch filter string
const buildMeiliSearchFilter = (params) => {
  const filters = [];
  
  // Always filter by visibility (default to public)
  if (params.visibility) {
    filters.push(`visibility = "${params.visibility}"`);
  } else {
    filters.push('visibility = "public"');
  }
  
  // Category filter
  if (params.category) {
    filters.push(`category = "${params.category}"`);
  }
  
  // Tags filter
  if (params.tags) {
    const tagArray = params.tags.split(',').map(tag => tag.trim());
    const tagFilters = tagArray.map(tag => `tags = "${tag}"`);
    if (tagFilters.length > 0) {
      filters.push(`(${tagFilters.join(' OR ')})`);
    }
  }
  
  return filters.length > 0 ? filters.join(' AND ') : undefined;
};

module.exports = {
  sanitizeQuery,
  validateSearchParams,
  validateFileId,
  validateDocumentData,
  buildMeiliSearchFilter
};