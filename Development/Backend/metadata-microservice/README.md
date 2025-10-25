# 📄 Metadata Microservice - Complete Implementation

A complete Node.js microservice for storing and retrieving PDF metadata linked to uploaded files, with PostgreSQL for relational data and JWT authentication via the Auth Microservice.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Auth Microservice running (for JWT verification)

### 2. Installation

```bash
# Clone the repo
git clone https://github.com/your-org/metadata-microservice.git
cd metadata-microservice

# Install dependencies
npm install

# Copy environment config
cp .env.example .env
```

### 3. Environment Setup

Edit the `.env` file:

```env
PORT=3004
DATABASE_URL=postgresql://user:password@localhost:5432/metadata_service
JWT_SECRET=your_jwt_secret_key
AUTH_SERVICE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3000,http://yourdomain.com
NODE_ENV=development
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb metadata_db

# Run migrations
npm run migrate
```

### 5. Start Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

- Health Check: http://localhost:3004/health

## 🔐 Authentication

- **GET routes**: No authentication required
- **POST, PUT, DELETE routes**: Require JWT token
- **Authorization Header**: `Bearer <JWT_TOKEN>`
- **User verification**: Uses Auth Microservice `/api/auth/user` endpoint

## 📍 API Endpoints

### Metadata Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | `/api/metadata` | ✅ | Create new PDF metadata entry |
| GET    | `/api/metadata/my/documents` | ✅ | Get user's uploaded documents |
| GET    | `/api/metadata/:file_id` | ❌ | Get metadata by file ID |
| GET    | `/api/metadata/user/:uploader_id` | ❌ | List all PDFs by uploader |
| GET    | `/api/metadata/search` | ❌ | Search/filter metadata |
| GET    | `/api/metadata/public` | ❌ | Get all public metadata |
| GET    | `/api/metadata/private` | ❌ | Get all private metadata |
| GET    | `/api/metadata/:uploader_id/stat` | ❌ | Get uploader statistics |
| GET    | `/api/metadata/:uploader_id/:visibility` | ❌ | Get metadata by visibility |
| PUT    | `/api/metadata/:file_id` | ✅ | Update metadata |
| DELETE | `/api/metadata/:file_id` | ✅ | Delete metadata |
| POST   | `/api/metadata/bulk-delete` | ✅ | Bulk delete metadata |

## 📋 Usage Examples

### Create Metadata (POST /api/metadata)

```bash
curl -X POST http://localhost:3004/api/metadata \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "abc-123",
    "file_url": "http://localhost:9000/public/abc-123.pdf",
    "image_url": "http://localhost:9000/public/abc-123.jpg",
    "title": "AI Research Paper",
    "description": "Advanced research on transformers",
    "tags": ["AI", "transformers", "research"],
    "category": "Education",
    "subcategory": "Machine Learning",
    "pages": 12,
    "size_kb": 512,
    "visibility": "public"
  }'
```

### Search Metadata (GET /api/metadata/search)

```bash
# Search by title/description
curl "http://localhost:3004/api/metadata/search?q=AI&page=1&limit=10"

# Filter by category and tag
curl "http://localhost:3004/api/metadata/search?category=Education&tag=AI&visibility=public"

# Sort by creation date
curl "http://localhost:3004/api/metadata/search?sort=created_at&order=desc"
```

### Get User Statistics (GET /api/metadata/:uploader_id/stat)

```bash
curl "http://localhost:3004/api/metadata/user-123/stat"
```

Response:
```json
{
  "uploader_id": "user-123",
  "total_uploads": "15",
  "public_uploads": "10",
  "private_uploads": "5"
}
```

### Update Metadata (PUT /api/metadata/:file_id)

```bash
curl -X PUT http://localhost:3004/api/metadata/abc-123 \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated AI Research Paper",
    "visibility": "private",
    "tags": ["AI", "transformers", "updated"]
  }'
```

### Bulk Delete (POST /api/metadata/bulk-delete)

```bash
curl -X POST http://localhost:3004/api/metadata/bulk-delete \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "file_ids": ["abc-123", "def-456", "ghi-789"]
  }'
```

## 🗂️ Database Schema

### Metadata Table Structure

```sql
CREATE TABLE metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id VARCHAR(255) UNIQUE NOT NULL,
  file_url TEXT,
  image_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  tags TEXT[],
  category VARCHAR(100),
  subcategory VARCHAR(100),
  pages INTEGER CHECK (pages > 0),
  size_kb INTEGER CHECK (size_kb > 0),
  visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'friends')),
  uploader_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance

- `idx_metadata_uploader_id` - Fast queries by uploader
- `idx_metadata_file_id` - Fast file lookups
- `idx_metadata_category` - Category filtering
- `idx_metadata_visibility` - Visibility filtering
- `idx_metadata_tags` - GIN index for tag searching
- `idx_metadata_created_at` - Date sorting

## 🛠️ Development Commands

```bash
# Development mode with hot reload
npm run dev

# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Refresh database (rollback all + migrate)
npm run migrate:refresh

# Lint code
npm run lint

# Run tests
npm test
```

## 🔒 Security Features

- **Helmet**: Secure HTTP headers
- **CORS**: Configurable origin whitelist
- **JWT Verification**: Via Auth Microservice
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Parameterized queries
- **Authorization**: User-based resource access

## 📊 Error Handling

All errors return consistent JSON format:

```json
{
  "error": "Error message description"
}
```

**Common Error Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## 📁 Project Structure

```
metadata-microservice/
├── scripts/
│   ├── migrate.js                    # Migration management
│   └── run-migrations.js             # Migration runner
├── src/
│   ├── config/
│   │   └── database.js               # Database configuration
│   ├── controller/
│   │   └── metadata.controller.js    # Request handlers
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT authentication
│   │   ├── errorHandler.middleware.js # Error handling
│   │   └── validation.middleware.js   # Input validation
│   ├── migrations/
│   │   └── 001_create_metadata_table.js # Database migrations
│   ├── models/
│   │   └── metadata.model.js         # Database operations
│   ├── routes/
│   │   └── metadata.routes.js        # API routes
│   ├── services/
│   │   └── auth.service.js           # Auth service integration
│   ├── utils/
│   │   └── jwt.util.js               # JWT utilities
│   ├── app.js                        # Express app setup
│   └── server.js                     # Server startup
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies & scripts
└── README.md                         # Documentation
```

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://prod_user:secure_password@db_host:5432/metadata_prod
   JWT_SECRET=your_super_secure_jwt_secret
   AUTH_SERVICE_URL=https://auth.yourdomain.com
   CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
   ```

2. **Database**
   - Use connection pooling
   - Set up database backups
   - Configure SSL connections

3. **Security**
   - Use HTTPS in production
   - Configure reverse proxy (NGINX)
   - Set secure JWT secrets
   - Enable database SSL

4. **Monitoring**
   - Health check endpoint: `/health`
   - Log aggregation
   - Error monitoring
   - Performance monitoring

## 📄 License

MIT License © RDCbits & Raymond D. Chavez Jr.

## 🔗 Related Services

- 📂 [Upload Microservice](https://github.com/your-org/upload-microservice)
- 🔐 [Auth Microservice](https://github.com/your-org/auth-microservice)
- 👥 [User Profile Microservice](https://github.com/your-org/user-profile-microservice)
- 👫 [Friend Microservice](https://github.com/your-org/friend-microservice)