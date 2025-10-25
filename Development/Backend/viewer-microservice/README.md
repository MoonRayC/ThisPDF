# 📄 Viewer Microservice

A secure PDF viewer microservice that handles public/private access control and integrates with multiple services for authentication, metadata, file storage, and friend management.

## 🚀 Features

- **Secure PDF Viewing**: View-only PDF rendering with access control
- **Public/Private Files**: Supports both public and private file access
- **Friend-based Access**: Private files accessible to uploader's friends
- **JWT Authentication**: Secure token-based authentication
- **Service Integration**: Integrates with Auth, Metadata, Upload, and Friend services
- **Rate Limiting**: Built-in request rate limiting
- **Error Handling**: Comprehensive error handling and logging
- **Health Checks**: Service health monitoring

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- Access to Auth, Metadata, Upload, and Friend microservices
- JWT secret for token verification

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration

## 🚀 Running the Service

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The service will be available at `http://localhost:3008` (or your configured port).

## 📡 API Endpoints

### Main Endpoint

#### `GET /api/viewer/:file_id`

Returns secure file URL and metadata for PDF viewing.

**Parameters:**
- `file_id` (UUID): The unique identifier of the file

**Headers:**
- `Authorization: Bearer <JWT>` (optional for public files)

**Success Response (200):**
```json
{
  "file_url": "https://minio.example.com/secure-url",
  "image_url": "https://minio.example.com/previews/preview.jpg",
  "metadata": {
    "title": "Document Title",
    "tags": ["tag1", "tag2"],
    "category": "Technology",
    "subcategory": "Software Development",
    "size_kb": 85,
    "pages": 2,
    "visibility": "private",
    "uploader_id": "uuid-here"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file ID format
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: No permission to access private file
- `404 Not Found`: File not found
- `500 Internal Server Error`: Service error

### Health Check

#### `GET /api/health`

Returns service health status.

**Response (200):**
```json
{
  "status": "healthy",
  "service": "viewer-service",
  "timestamp": "2025-07-02T10:30:00.000Z"
}
```

## 🔐 Access Control Logic

The service implements the following access control rules:

1. **Public Files**: Accessible to anyone without authentication
2. **Private Files**: Require authentication and one of:
   - User is the file uploader
   - User is in the uploader's friend list

## 🏗️ Architecture

The service follows a clean architecture pattern:

```
src/
├── config/           # Configuration management
├── controller/       # Request handlers
├── middleware/       # Express middleware
├── routes/          # Route definitions
├── services/        # External service integrations
├── utils/           # Utility functions
├── app.js           # Express app setup
└── server.js        # Server startup
```

## 🔧 Configuration

The service is configured via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3008 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT verification secret | Required |
| `AUTH_SERVICE_URL` | Auth service URL | http://auth:3001 |
| `UPLOAD_SERVICE_URL` | Upload service URL | http://upload:3003 |
| `METADATA_SERVICE_URL` | Metadata service URL | http://metadata:3004 |
| `FRIEND_SERVICE_URL` | Friend service URL | http://friend:3011 |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |

## 🔗 Service Dependencies

The viewer service integrates with these microservices:

- **Auth Service**: User authentication and JWT verification
- **Metadata Service**: File metadata and access information
- **Upload Service**: File URL generation when not in metadata
- **Friend Service**: Friend relationship verification

## 🚦 Error Handling

The service includes comprehensive error handling:

- **Validation Errors**: Invalid input parameters
- **Authentication Errors**: Invalid or missing tokens
- **Authorization Errors**: Insufficient permissions
- **Service Errors**: External service failures
- **Network Errors**: Timeouts and connectivity issues

## 🔒 Security Features

- **Helmet**: Security headers protection
- **CORS**: Cross-origin request handling
- **Rate Limiting**: Request rate limiting
- **JWT Verification**: Token-based authentication
- **Input Validation**: Request parameter validation
- **Access Control**: File-level permission checking

## 📝 Logging

The service logs:
- Request information in development mode
- Error details with stack traces
- Service health status
- Startup configuration

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 🐳 Docker Support

The service is designed to run in containerized environments. Make sure to:

1. Set appropriate service URLs for container networking
2. Configure JWT secrets securely
3. Set up proper health checks
4. Configure logging for container environments

## 📈 Monitoring

Monitor the service using:
- Health check endpoint: `GET /api/health`
- Application logs
- Error rates and response times
- Service dependency health

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Follow security best practices
5. Handle errors gracefully

## 📄 License

MIT License - see LICENSE file for details.