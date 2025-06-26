# Auth Microservice

A complete Node.js authentication microservice with JWT tokens, email verification, password reset, social login, and device management.

## Features

- ✅ User registration with email verification
- ✅ Login/logout with JWT and refresh tokens  
- ✅ Password reset via email
- ✅ Social login (Google, Facebook)
- ✅ Device/session management
- ✅ Rate limiting and security middleware
- ✅ Input validation and sanitization
- ✅ PostgreSQL database with migrations
- ✅ Comprehensive error handling

## Quick Start

### 1. Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- SMTP email service (Gmail, SendGrid, etc.)

### 2. Installation

```bash
# Clone or create project directory
mkdir auth-microservice && cd auth-microservice

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 3. Environment Setup

Edit `.env` file with your configuration:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/auth_service

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-jwt-secret-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com 
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=Your App

# Social Login (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb auth_service

# Run migrations
npm run migrate
```

### 5. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3001`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (revoke token) |

### Password Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/request-password-reset` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Social Login

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/social/google` | Google OAuth login |

### Device Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/devices` | List user devices |

## API Usage Examples

### Register User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

### Access Protected Route

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/auth/devices
```

## Database Schema

The service uses the following tables:

- **users** - User accounts
- **social_accounts** - Social login connections  
- **password_resets** - Password reset tokens
- **email_verification_tokens** - Email verification tokens
- **refresh_tokens** - JWT refresh tokens
- **devices** - User device/session tracking

## Security Features

- **Rate Limiting**: 100 requests/15min general, 5 requests/15min for auth
- **Password Requirements**: Min 8 chars, mixed case, numbers, symbols
- **JWT Expiration**: 15min access tokens, 7day refresh tokens
- **CORS Protection**: Configurable origins
- **Helmet Security**: Security headers
- **Input Validation**: Joi schema validation
- **SQL Injection Prevention**: Parameterized queries

## Email Templates

Professional HTML email templates included for:
- Email verification
- Password reset

## Social Login Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project and enable Google+ API
3. Create OAuth 2.0 credentials
4. Add your domain to authorized origins
5. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Facebook Login  

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create app and get App ID/Secret
3. Configure valid OAuth redirect URIs
4. Set `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`

## Development

```bash
# Install dev dependencies
npm install --include=dev

# Run with auto-reload
npm run dev

# Run tests (when implemented)
npm test
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use connection pooling for database
6. Configure reverse proxy (nginx)
7. Set up monitoring and logging

## Error Handling

The service includes comprehensive error handling:

- **Validation Errors**: 422 with field details
- **Authentication Errors**: 401 with clear messages  
- **Authorization Errors**: 403 for insufficient permissions
- **Database Errors**: Mapped to appropriate HTTP codes
- **Rate Limiting**: 429 when limits exceeded

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## License

MIT License © RDCbits & Raymond D. Chavez Jr.