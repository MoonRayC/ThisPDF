# User Profile Microservice API

---

## TP-0012: Create User Profile

**POST** `/api/profiles`

Creates a profile for a registered user.

### Request

```json
{
  "user_id": "uuid",
  "username": "raymondedd",
  "bio": "I am the man",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### Response
- ✅ `201 Created`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "username": "johndoe",
  "bio": "I am the man",
  "avatar_url": "https://example.com/avatar.jpg",
  "last_active_at": null,
  "created_at": "2025-06-25T12:00:00.000Z"
}
```
- ❌ `400 Bad Request`

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "username", "message": "Username is required" }
  ]
}
```

---

## TP-0013: Get User Profile (By ID)

**GET** `/api/profiles/:user_id`

### Response
- ✅ `200 OK`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "username": "raymondedd",
  "bio": "I am the man",
  "avatar_url": "https://example.com/avatar.jpg",
  "last_active_at": "2025-06-25T12:30:00.000Z"
}
```
- ❌ `404 Not Found`

```json
{ 
  "error": "Profile not found" 
}
```

---

## TP-0014: Get User Profile (By Username)

**GET** `/api/profiles/username/:username`

### Response
- ✅ `200 OK`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "username": "raymondedd",
  "bio": "I am the man",
  "avatar_url": "https://example.com/avatar.jpg",
  "last_active_at": "2025-06-25T12:30:00.000Z"
}
```
- ❌ `404 Not Found`

```json
{ 
  "error": "Profile not found" 
}
```

---

## TP-0015: Update Profile Info

**PATCH** `/api/profiles/:user_id`

Partially updates user profile fields.

### Request

```json
{
  "username": "updated_name",
  "bio": "Updated bio",
  "avatar_url": "https://example.com/updated_avatar.jpg"
}
```

### Response
- ✅ `200 OK`

```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "username": "updated_name",
    "bio": "Updated bio",
    "avatar_url": "https://example.com/updated_avatar.jpg",
    "updated_at": "2025-06-25T13:00:00.000Z"
  }
}
```
- ❌ `400 Bad Request`

```json
{
  "error": "Invalid update parameters"
}
```

---

## TP-0016: Update Last Active Timestamp

**PATCH** `/api/profiles/:user_id/active`

Updates the last_active_at field.

### Response
- ✅ `200 OK`

```json
{
  "message": "Last active timestamp updated",
  "last_active_at": "2025-06-25T13:30:00.000Z"
}
```
- ❌ `404 Not Found`

```json
{
  "error": "Profile not found"
}
```

---

## TP-0017: Delete Profile

**DELETE** `/api/profiles/:user_id`

Requires confirmation text to proceed.

### Request

```json
{
  "confirmation_text": "DELETE: JohnDoe"
}
```

### Response
- ✅ `204 No Content`

- ❌ `400 Bad Request`

```json
{
  "error": "Invalid confirmation format"
}
```

- ❌ `404 Not Found`

```json
{
  "error": "Profile not found"
}
```

---

## TP-0018: List Profiles (Paginated)

**GET ** `/api/profiles?page=1&limit=10`

### Response
- ✅ `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "username": "raymondedd",
      "bio": "Developer",
      "avatar_url": "https://example.com/avatar.jpg"
    },
  ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 25
  }
}
```