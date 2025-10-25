# 🗨️ Comments Microservice

A Node.js microservice for handling comments, replies, and reactions (likes/dislikes) on PDFs. Built with Express.js and MongoDB.

## 🚀 Features

- ✅ Create top-level comments on PDFs
- ✅ Reply to existing comments (nested threading)
- ✅ Like/dislike comments with toggle functionality
- ✅ Soft delete comments to preserve thread integrity
- ✅ Pagination support for comments and replies
- ✅ Comment statistics for files
- ✅ JWT-based authentication
- ✅ Input validation and error handling
- ✅ MongoDB indexing for performance

## 📁 Project Structure

```
comments-microservice/
├── src/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── controller/
│   │   └── comments.controller.js # Business logic
│   ├── middleware/
│   │   ├── auth.middleware.js     # Authentication
│   │   ├── errorHandler.middleware.js
│   │   └── validation.middleware.js
│   ├── models/
│   │   └── comment.model.js       # MongoDB schema
│   ├── routes/
│   │   └── comment.routes.js      # API endpoints
│   ├── services/
│   │   └── auth.service.js        # Auth service integration
│   └── app.js                     # Express app setup
├── server.js                      # Server entry point
├── .env                          # Environment variables
└── README.md
```

## 🛠️ Installation & Setup

1. **Clone and Install Dependencies**
```bash
npm install express mongoose dotenv cors morgan axios
```

2. **Environment Configuration**
Copy the `.env` template and configure your environment variables:
```bash
cp .env.example .env
```

3. **Start MongoDB**
Make sure MongoDB is running on your system or use MongoDB Atlas.

4. **Run the Service**
```bash
# Development
npm run dev

# Production
npm start
```

## 🌐 API Endpoints

### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/comments` | Create a top-level comment | ✅ |
| POST | `/api/comments/:parent_id/reply` | Reply to a comment | ✅ |
| GET | `/api/comments/file/:file_id` | Get comments for a file | ❌ |
| GET | `/api/comments/:parent_id/replies` | Get replies to a comment | ❌ |
| GET | `/api/comments/:comment_id` | Get specific comment | ❌ |
| PUT | `/api/comments/:comment_id` | Update comment (owner only) | ✅ |
| DELETE | `/api/comments/:comment_id` | Delete comment (owner only) | ✅ |

### Reactions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/comments/:comment_id/like` | Toggle like on comment | ✅ |
| POST | `/api/comments/:comment_id/dislike` | Toggle dislike on comment | ✅ |
| DELETE | `/api/comments/:comment_id/reaction` | Remove user's reaction | ✅ |

### Statistics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/comments/file/:file_id/stats` | Get file comment stats | ❌ |

## 📝 API Usage Examples

### Create a Comment
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "file_id": "pdf-uuid-123",
    "text": "This is a great PDF!"
  }'
```

### Reply to a Comment
```bash
curl -X POST http://localhost:3000/api/comments/COMMENT_ID/reply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "file_id": "pdf-uuid-123",
    "text": "I agree with your comment!"
  }'
```

### Get Comments for a File
```bash
curl "http://localhost:3000/api/comments/file/pdf-uuid-123?page=1&limit=10"
```

### Like a Comment
```bash
curl -X POST http://localhost:3000/api/comments/COMMENT_ID/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get File Statistics
```bash
curl http://localhost:3000/api/comments/file/pdf-uuid-123/stats
```

## 🔐 Authentication

This service integrates with an external authentication service. Configure the `AUTH_SERVICE_URL` in your `.env` file to point to your auth service.

The auth service should provide:
- `GET /api/auth/user` endpoint that returns user data when provided with a valid Bearer token

## 📊 Database Schema

### Comment Model
```javascript
{
  _id: ObjectId,
  file_id: String,        
  user_id: String,        
  text: String,           
  parent_id: ObjectId,    
  likes: [String],        
  dislikes: [String],     
  is_deleted: Boolean,   
  created_at: Date,
  updated_at: Date
}
```

## 🚦 Response Examples

### Successful Comment Creation
```json
{
  "message": "Comment created successfully",
  "comment": {
    "_id": "64f1234567890123456789ab",
    "file_id": "pdf-uuid-123",
    "user_id": "user-uuid-456",
    "text": "This is a great PDF!",
    "parent_id": null,
    "likes": [],
    "dislikes": [],
    "like_count": 0,
    "dislike_count": 0,
    "reply_count": 0,
    "is_deleted": false,
    "created_at": "2023-09-01T10:00:00.000Z",
    "updated_at": "2023-09-01T10:00:00.000Z"
  }
}
```

### File Statistics
```json
{
  "total_comments": 15,
  "total_likes": 38,
  "total_dislikes": 4
}
```

### Comments List with Pagination
```json
{
  "comments": [
    {
      "_id": "64f1234567890123456789ab",
      "file_id": "pdf-uuid-123",
      "user_id": "user-uuid-456",
      "text": "This is a great PDF!",
      "parent_id": null,
      "like_count": 5,
      "dislike_count": 1,
      "reply_count": 3,
      "is_deleted": false,
      "created_at": "2023-09-01T10:00:00.000Z",
      "updated_at": "2023-09-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

## 🔧 Configuration Options

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `MONGODB_URI`: MongoDB connection string
- `AUTH_SERVICE_URL`: External authentication service URL

### Pagination Limits

- Default page size: 10 items
- Maximum page size: 100 items
- Minimum page: 1

### Validation Rules

- Comment text: 1-2000 characters
- File ID: Required, non-empty string
- Authentication: Bearer token required for protected endpoints

## 🎯 Features & Business Logic

### Comment Threading
- Top-level comments have `parent_id: null`
- Replies reference their parent comment via `parent_id`
- Soft deletion preserves thread integrity

### Reaction System
- Users can like OR dislike a comment (mutually exclusive)
- Toggle functionality: clicking like twice removes the like
- Reaction counts are calculated using virtual fields

### Soft Deletion
- Comments are marked as deleted rather than removed
- Maintains referential integrity for replies
- Deleted comments are excluded from queries

### Performance Optimizations
- MongoDB indexes on frequently queried fields
- Pagination to limit data transfer
- Virtual fields for calculated values
- Efficient aggregation pipelines for statistics

## 🛡️ Security Features

- JWT token validation via external auth service
- Input sanitization and validation
- SQL injection protection (NoSQL)
- Rate limiting ready (add middleware as needed)
- CORS configuration
- Error handling without sensitive data exposure

## 🚀 Deployment Considerations

### Production Setup
1. Use environment-specific MongoDB URIs
2. Configure proper CORS origins
3. Add rate limiting middleware
4. Set up monitoring and logging
5. Use PM2 or similar process manager
6. Configure reverse proxy (nginx)

### Scaling Options
- Horizontal scaling with load balancer
- MongoDB replica sets for high availability
- Redis for caching frequently accessed data
- CDN for static assets

## 🧪 Testing

The service includes comprehensive error handling and validation. Consider adding:
- Unit tests for controllers and services
- Integration tests for API endpoints
- Load testing for performance validation

## 📚 Additional Notes

- All timestamps are in UTC
- Comment text is trimmed of leading/trailing whitespace
- User ownership is validated for update/delete operations
- Authentication service timeout is set to 5 seconds