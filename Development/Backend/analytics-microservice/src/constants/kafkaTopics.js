const KAFKA_TOPICS = {
  PDF_VIEWED: 'pdf_viewed',
  READING_STARTED: 'reading_started',
  READING_ENDED: 'reading_ended',
  PDF_LIKED: 'pdf_liked',
  COMMENT_LIKED: 'comment_liked',
  PDF_FAVORITED: 'pdf_favorited',
  PDF_RATED: 'pdf_rated',
  PDF_UPLOADED: 'pdf_uploaded',
  PROFILE_VIEWED: 'profile_viewed',
  COMMENT_POSTED: 'comment_posted'
};

const EVENT_TYPES = {
  VIEW: 'view',
  LIKE: 'like',
  FAVORITE: 'favorite',
  RATE: 'rate',
  COMMENT: 'comment',
  UPLOAD: 'upload',
  READING_START: 'reading_start',
  READING_END: 'reading_end',
  PROFILE_VIEW: 'profile_view'
};

const TARGET_TYPES = {
  PDF: 'pdf',
  COMMENT: 'comment',
  USER: 'user'
};

module.exports = {
  KAFKA_TOPICS,
  EVENT_TYPES,
  TARGET_TYPES
};