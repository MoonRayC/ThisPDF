# User Profile Microservice – Use Case Documentation

This document outlines the key operations supported by the **User Profile Microservice**, including inputs, outputs, and expected behaviors.

### Tech-Stack: NodeJS + PostgreSQL

---

## TP-0012: Create User Profile

- **Description**: Initializes a new user profile after successful registration via the Auth Service.

### 🔹 Request

**Method**: `POST`  
**Endpoint**: `/api/profiles`  
**Body Parameters**:
| Field      | Type   | Required | Description              |
|------------|--------|----------|--------------------------|
| `user_id`  | UUID   | ✅ Yes   | Unique user identifier   |
| `username` | string | ✅ Yes   | Public display name      |
| `bio`      | string | ❌ No    | Short user bio           |
| `avatar_url` | string | ❌ No | URL to profile avatar    |

### 🔸 Response

- ✅ **201 Created** – Returns the created profile object  
- ❌ **400 Bad Request** – Validation errors

---

## TP-0013: Get User Profile

- **Description**: Fetches profile information by either user ID or username.

### 🔹 Request

**Method**: `GET`  
**Endpoints**:  
- `/api/profiles/:user_id`  
- `/api/profiles/username/:username`

### 🔸 Response

- ✅ **200 OK** – Returns profile data  
- ❌ **404 Not Found** – Profile does not exist

---

## TP-0014: Update Profile Info

- **Description**: Partially updates a user’s profile, including their bio, avatar, or username.

### 🔹 Request

**Method**: `PATCH`  
**Endpoint**: `/api/profiles/:user_id`  
**Body Parameters**:
| Field        | Type   | Required | Description                  |
|--------------|--------|----------|------------------------------|
| `bio`        | string | ❌ No    | Updated user bio             |
| `avatar_url` | string | ❌ No    | New avatar image URL         |
| `username`   | string | ❌ No    | Updated username             |

### 🔸 Response

- ✅ **200 OK** – Profile updated  
- ❌ **400 Bad Request** – Invalid inputs  
- ❌ **404 Not Found** – Profile not found

---

## TP-0015: Update Last Active Timestamp

- **Description**: Updates the `last_active_at` field to the current server timestamp.

### 🔹 Request

**Method**: `PATCH`  
**Endpoint**: `/api/profiles/:user_id/active`

### 🔸 Response

- ✅ **200 OK** – Timestamp updated  
- ❌ **404 Not Found** – Profile does not exist

---

## TP-0016: Delete Profile

- **Description**: Permanently deletes a profile. Requires a confirmation string like `DELETE: USERNAME`.

### 🔹 Request

**Method**: `DELETE`  
**Endpoint**: `/api/profiles/:user_id`  
**Body Parameters**:
| Field             | Type   | Required | Description                                  |
|-------------------|--------|----------|----------------------------------------------|
| `confirmation_text` | string | ✅ Yes   | Must be in the format `DELETE: <username>`    |

### 🔸 Response

- ✅ **204 No Content** – Successfully deleted  
- ❌ **400 Bad Request** – Invalid confirmation format  
- ❌ **404 Not Found** – Profile not found

---

## Notes

- All endpoints require a **valid JWT token** in the `Authorization: Bearer <token>` header.
- Swagger documentation is available at `/api-docs` (admin-only access).
- Pagination is supported on `GET /api/profiles`.

---

© [RDCbits @ Raymond D. Chavez Jr.], 2025 – All rights reserved.
