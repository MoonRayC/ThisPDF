# User Profile Microservice

A complete Node.js microservice for managing user profile data with PostgreSQL, JWT authentication, and admin-controlled Swagger docs.

---

## Features

- ✅ CRUD operations for user profiles
- ✅ JWT Authentication (via Auth Microservice)
- ✅ Admin/Moderator access control for Swagger docs
- ✅ Real-time tracking of last active timestamp
- ✅ PostgreSQL database with migrations & seeding
- ✅ Pagination support for profile listing
- ✅ Swagger/OpenAPI documentation
- ✅ Centralized error handling
- ✅ Role-based middleware
- ✅ Secure headers with Helmet
- ✅ Input validation using Joi
- ✅ CORS with dynamic origin configuration

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Auth Microservice (for verifying JWTs)

---

### 2. Installation

```bash
# Clone the repo
git clone https://github.com/your-org/user-profile-microservice.git
cd user-profile-microservice

# Install dependencies
npm install

# Copy environment config
cp .env.example .env
```

### 3. Environment Setup

Edit the `.env` file to match your setup:

```env
PORT=3002
DATABASE_URL=postgresql://user:password@localhost:5432/profile_service
JWT_SECRET=your_jwt_secret_key
AUTH_SERVICE_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3000,http://yourdomain.com
NODE_ENV=development
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb profile_service

# Run migrations
npm run migrate

# (Optional) Seed initial data
npm run seed
```

### 5. Start Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

- Swagger docs: http://localhost:3002/api-docs
- Health check: http://localhost:3002/health

---

## Authentication & Authorization

All routes require a valid JWT from the Auth Microservice.

Swagger UI is protected — only users with admin or moderator roles can access it.

### Example Authorization Header

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## API Endpoints

### Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/profiles | Create new profile |
| GET | /api/profiles/:user_id | Get profile by user ID |
| GET | /api/profiles/username/:username | Get profile by username |
| PATCH | /api/profiles/:user_id | Update profile |
| PATCH | /api/profiles/:user_id/active | Update last active timestamp |
| DELETE | /api/profiles/:user_id | Delete profile |
| GET | /api/profiles | List all profiles (paginated) |

---

## Sample Usage

#### Create Profile

```bash
curl -X POST http://localhost:3002/api/profiles \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "raymondedd",
    "bio": "I am the man",
    "avatar_url": "https://example.com/avatar.jpg"
  }'
```

---

## Error Handling

This service includes centralized error handling for:

- ✅ Unique constraint violations
- ✅ JWT errors (expired, invalid)
- ✅ Authorization errors
- ✅ Validation errors
- ✅ Database issues

Errors are returned in the following format:

```json
{
  "error": "Profile already exists for this user"
}
```

---

## Development

```bash
# Install dev tools
npm install --include=dev

# Lint code
npm run lint

# Run in dev mode
npm run dev

# Run tests (if implemented)
npm test
```

---

## Security

- Helmet for HTTP header protection
- CORS with whitelisted domains
- JWT authentication (validated via Auth Microservice)
- Rate limiting (optional, via middleware)
- Role-based Swagger access (admin/moderator only)

---

## Deployment Notes

- Set NODE_ENV=production
- Use secure secrets
- Configure CORS origins
- Use SSL in production
- Set up reverse proxy (e.g. nginx)
- Use connection pooling for DB

---

## Project Structure

```
user-profile-micoservice/
├──scripts/
│   ├── check-database.js
│   ├── migrate.js
│   ├── run-migrations.js
│   └── seed.js
├──src/
│   ├── config/
│   │     ├── database.js
│   │     └── swagger.js
│   ├── controller
│   │     └── profile.controller.js
│   ├── middleware
│   │     ├── errorHandler.middleware.js
│   │     ├── profile.middleware.js
│   │     └── validation.middleware.js
│   ├── migrations
│   │     └── 001_user_profiles.migration.js
│   ├── models
│   │     └── profile.model.js
│   ├── routes
│   │     └── profile.routes.js
│   ├── services
│   │     └── jwt.service.js
│   ├── utils
│   │     └── migration.util.js
│   ├── app.js
│   └── server.js
├──.env
├──package.json
└──README.md          
```

---

## License

MIT License © RDCbits & Raymond D. Chavez Jr.

---

## Related Services

- Auth Microservice
