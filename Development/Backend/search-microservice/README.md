# 🔍 Search Microservice

A high-performance search microservice for PDF metadata using MeiliSearch. This service provides full-text search capabilities with advanced filtering, fuzzy matching, and real-time indexing.

## 🚀 Features

- **Full-text search** with fuzzy matching and typo tolerance
- **Advanced filtering** by category, tags, and visibility
- **Real-time indexing** with automatic document updates
- **Bulk operations** for efficient data management
- **RESTful API** with comprehensive validation
- **Docker support** for easy deployment
- **Comprehensive logging** and error handling
- **Health checks** and monitoring endpoints

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+ with Express.js
- **Search Engine**: MeiliSearch
- **Validation**: Joi schema validation
- **Logging**: Winston logger
- **Containerization**: Docker & Docker Compose

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- MeiliSearch instance

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd search-microservice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MeiliSearch**
   ```bash
   docker run -p 7700:7700 \
     -e MEILI_MASTER_KEY=raynix_search_key \
     getmeili/meilisearch:latest
   ```

5. **Start the service**
   ```bash
   npm run dev
   ```

### Docker Deployment

1. **Using Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Build and run manually**
   ```bash
   docker build -t search-microservice .
   docker run -p 3006:3006 --env-file .env search-microservice
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3006` |
| `NODE_ENV` | Environment mode | `development` |
| `MEILI_HOST` | MeiliSearch host URL | `http://localhost:7700` |
| `MEILI_API_KEY` | MeiliSearch API key | `raynix_search_key` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

### MeiliSearch Configuration

The service automatically configures MeiliSearch with:
- **Searchable attributes**: title, description, tags, category, subcategory
- **Filterable attributes**: category, subcategory, visibility, tags
- **Sortable attributes**: title, category, created_at
- **Typo tolerance**: Enabled with smart word size detection
- **Ranking rules**: Optimized for relevance

## 📚 API Documentation

### Base URL
```
http://localhost:3006/api/search
```

### Endpoints

#### Search Documents
```http
GET /api/search?q=query&category=Math&tags=algebra,calculus&visibility=public&limit=20&offset=0
```

**Query Parameters:**
- `q` (string): Search query
- `category` (string): Filter by category
- `tags` (string): Comma-separated tags
- `visibility` (string): public/private
- `limit` (number): Results per page (max 100)
- `offset` (number): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "file_id": "uuid-123",
      "title": "Advanced Calculus",
      "description": "Comprehensive calculus guide",
      "tags": ["math", "calculus"],
      "category": "Math",
      "subcategory": "Advanced",
      "visibility": "public",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  },
  "processingTime": 5
}
```

#### Index Document
```http
POST /api/search/index
```

**Request Body:**
```json
{
  "file_id": "uuid-123",
  "title": "Document Title",
  "description": "Document description",
  "tags": ["tag1", "tag2"],
  "category": "Category",
  "subcategory": "Subcategory",
  "visibility": "public"
}
```

#### Update Document
```http
PUT /api/search/index/:file_id
```

#### Delete Document
```http
DELETE /api/search/index/:file_id
```

#### Bulk Index
```http
POST /api/search/bulk-index
```

**Request Body:**
```json
{
  "documents": [
    {
      "file_id": "uuid-1",
      "title": "Doc 1",
      "category": "Math",
      "visibility": "public"
    },
    {
      "file_id": "uuid-2",
      "title": "Doc 2",
      "category": "Science",
      "visibility": "public"
    }
  ]
}
```

#### Get Statistics
```http
GET /api/search/stats
```

#### Health Check
```http
GET /health
```

## 🔍 Search Features

### Full-Text Search
- Search across title, description, tags, category, and subcategory
- Fuzzy matching with typo tolerance
- Phrase matching and boolean operators
- Relevance scoring and ranking

### Filtering
- **Category**: Filter by document category
- **Tags**: Filter by one or more tags
- **Visibility**: Filter by public/private visibility
- **Combinable**: All filters can be combined

### Pagination
- Configurable page size (1-100 results)
- Offset-based pagination
- Total count and "has more" indicators

### Highlighting
- Search term highlighting in results
- Configurable highlight tags
- Snippet generation for long descriptions

## 🛡️ Security Features

- **Input validation** with Joi schemas
- **XSS protection** with query sanitization
- **CORS configuration** for frontend access
- **Rate limiting** (configurable)
- **Error handling** without sensitive data exposure

## 📊 Monitoring

### Health Checks
- Application health: `GET /health`
- MeiliSearch connectivity check
- Docker health check configuration

### Logging
- Structured logging with Winston
- Different log levels (error, warn, info, debug)
- Request/response logging
- Error tracking with stack traces

### Metrics
- Search performance metrics
- Index statistics
- Document counts an