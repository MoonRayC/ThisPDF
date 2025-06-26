# Friends Microservice

A Node.js microservice for managing friendships, friend requests, blocks, and recommendations using **MongoDB**. Integrates with Auth and User Profile microservices.

---

## Features

* ✅ Add, accept, reject, cancel, and block/unblock friendships
* ✅ Send friend requests with optional message
* ✅ Query public & private friends list
* ✅ Manage blocked users
* ✅ Track friendship activity (request sent, accepted, etc.)
* ✅ Friend recommendations with scoring
* ✅ MongoDB for flexible social graph modeling
* ✅ JWT authentication (via Auth Microservice)
* ✅ Input validation with Joi
* ✅ Swagger/OpenAPI documentation
* ✅ Role-based Swagger access control
* ✅ Centralized error handling

---

## Quick Start

### 1. Prerequisites

* Node.js 18+
* MongoDB 6+
* Auth & User Profile Microservices running

---

### 2. Installation

```bash
# Clone the repo
git clone https://github.com/your-org/friends-microservice.git
cd friends-microservice

# Install dependencies
npm install

# Copy environment config
cp .env.example .env
```

### 3. Environment Setup

Edit the `.env` file:

```env
PORT=3011
MONGODB_URI=mongodb://localhost:27017/friends_service
JWT_SECRET=your_jwt_secret_key
AUTH_SERVICE_URL=http://localhost:3001
PROFILE_SERVICE_URL=http://localhost:3002
CORS_ORIGINS=http://localhost:3000
NODE_ENV=development
```

---

### 4. Start Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

* Swagger docs: [http://localhost:3011/api-docs](http://localhost:3011/api-docs)
* Health check: [http://localhost:3011/health](http://localhost:3011/health)

---

## Authentication & Authorization

All mutating routes require a valid JWT from the Auth Microservice.

Public data (public uploads, public friends) is accessible without auth.

### Example Authorization Header

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## API Endpoints

### Friendships

| Method | Endpoint                     | Description                       |
| ------ | ---------------------------- | --------------------------------- |
| POST   | /api/friends/request         | Send friend request               |
| POST   | /api/friends/accept          | Accept a friend request           |
| POST   | /api/friends/reject          | Reject a friend request           |
| POST   | /api/friends/cancel          | Cancel a sent request             |
| GET    | /api/friends/list/\:user\_id | List all friends (public/private) |

### Blocking

| Method | Endpoint             | Description    |
| ------ | -------------------- | -------------- |
| POST   | /api/friends/block   | Block a user   |
| POST   | /api/friends/unblock | Unblock a user |

### Recommendations

| Method | Endpoint                     | Description                |
| ------ | ---------------------------- | -------------------------- |
| GET    | /api/friends/recommendations | Get friend recommendations |

---

## Sample Usage

#### Send Friend Request

```bash
curl -X POST http://localhost:3011/api/friends/request \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "3d594650-3436-4f56-b3c2-c86fef6d26b2",
    "message": "Let's connect!"
  }'
```

---

## Error Handling

All errors follow a standard format:

```json
{
  "error": "User already sent a request to this user."
}
```

Handled cases include:

* ❌ Duplicate requests
* ❌ Invalid UUIDs
* ❌ Unauthorized access
* ❌ Database connection issues

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

* JWT authentication (via Auth Microservice)
* Helmet for secure headers
* CORS protection with domain allowlist
* Input validation with Joi
* Optional rate limiting middleware

---

## Deployment Notes

* Set NODE\_ENV=production
* Secure secrets in `.env`
* Enable HTTPS in production
* Configure allowed CORS origins
* Use reverse proxy (e.g. nginx)
* Enable MongoDB connection pooling

---

## Project Structure

```
friends-microservice/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection config
│   │   └── swagger.js
│   ├── controller/
│   │   └── friend.controller.js
│   ├── middleware/
│   │   ├── errorHandler.middleware.js
│   │   ├── friend.middleware.js
│   │   └── validation.middleware.js
│   ├── models/
│   │   ├── friend.model.js
│   │   └── recommendation.model.js
│   ├── routes/
│   │   └── friend.routes.js
│   ├── services/
│   │   └── jwt.service.js
│   ├── utils/
│   │   └── constants.js     # Store enums like friend statuses
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## License

MIT License © RDCbits & Raymond D. Chavez Jr.

---

## Related Services

* Auth Microservice
* User Profile Microservice
* PDF Sharing Microservice (read-only)
