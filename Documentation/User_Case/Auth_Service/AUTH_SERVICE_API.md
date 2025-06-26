# Auth Microservice API

---

## TP-0001: User Registration

**POST** `/api/register`

Registers a new user and sends a 6-digit email verification code.

### Request

```json
{
  "email": "john@example.com",
  "password": "SecureP@ss123",
  "password_confirmation": "SecureP@ss123"
}
```

### Response
- ✅ `201 Created`

```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "is_email_verified": false,
    "created_at": "2025-06-24T12:00:00.000Z"
  }
}
```
- ❌ `422 Unprocessable Entity`

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "password", "message": "Password must contain..." }
  ]
}
```

---

## TP-0002: Email Verification

**POST** `/api/verify-email`

Verifies a user's email address with a 6-digit code.

### Request

```json
{
  "user_id": "uuid",
  "verification_token": "123456"
}
```

### Response
- ✅ `200 OK`

```json
{ 
  "message": "Email verified successfully" 
}
```
- ❌ `400 Bad Request`

```json
{ 
  "error": "Invalid or expired verification token" 
}
```

---

## TP-0003: Resend Verification Code

**POST** `/api/resend-code`

### Request

```json
{
  "message": "Verification code resent successfully"
}
```

### Response
- ✅ `200 OK`

```json
{ 
  "message": "Verification code resent successfully" 
}
```
- ❌ `429 Too Many Requests`

```json
{ 
  "error": "Please wait 20 seconds before resending" 
}
```
- ❌ `429 Too Many Requests`

```json
{ 
  "error": "Maximum resend attempts reached. Please try again later." 
}
```

---

## TP-0004: Login

**POST** `/api/login`

### Request

```json
{
  "email": "john@example.com",
  "password": "SecureP@ss123",
  "user_agent": "PostmanRuntime/7.30.0",
  "ip_address": "192.168.1.1"
}
```

### Response
- ✅ `200 OK`

```json
{
  "message": "Login successful",
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "is_email_verified": true
  }
}
```
- ❌ `401 Unauthorized`

```json
{ 
  "error": "Invalid credentials" 
}
```

---

## TP-0005: Refresh Token

**POST** `/api/refresh-token`

### Request

```json
{
  "refresh_token": "refresh_token"
}
```

### Response
- ✅ `200 OK`

```json
{ 
  "access_token": "new_jwt_token" 
}
```
- ❌ `403 Forbidden`

```json
{ 
  "error": "Invalid or expired refresh token" 
}
```

---

## TP-0006: Request Password Reset

**POST** `/api/request-password-reset`

Sends a 6-digit password reset code to the user's email.

### Request

```json
{
  "email": "john@example.com"
}
```

### Response
- ✅ `200 OK`

```json
{ 
  "message": "Password reset code sent to your email" 
}
```
- ❌ `429 Too Many Requests`

```json
{ 
  "error": "Please wait 15 seconds before resending" 
}
```

---

## TP-0007: Reset Password

**POST** `/api/reset-password`

Sends a 6-digit password reset code to the user's email.

### Request

```json
{
  "reset_token": "123456",
  "new_password": "NewP@ssw0rd!",
  "new_password_confirmation": "NewP@ssw0rd!"
}
```

### Response
- ✅ `200 OK`

```json
{ 
  "message": "Password updated successfully" 
}
```
- ❌ `400 Bad Request`

```json
{ 
  "error": "Invalid or expired reset code" 
}
```

---

## TP-0008: Logout

**POST** `/api/logout`

### Request

```json
{
  "refresh_token": "refresh_token"
}
```

### Response
- ✅ `200 OK`

```json
{
   "message": "Logged out successfully"
}
```
- ❌ `400 Bad Request`

```json
{
  "error": "Refresh token is required" 
}
```

---

## TP-0009: Social Login (Google)

**POST** `/api/social-login`

### Request

```json
{
  "access_token": "google_id_token"
}
```

### Response
- ✅ `200 OK`

```json
{
  "message": "Social login successful",
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "is_email_verified": true
  }
}
```
- ❌ `400 Bad Request`

```json
{ 
  "error": "Invalid Google token" 
}
```

---

## TP-0010: List Devices

**GET** `/api/devices`

Requires Authorization: Bearer <access_token> header

### Response
- ✅ `200 OK`

```json
{
  "devices": [
    {
      "device_id": "string",
      "user_agent": "PostmanRuntime/7.30.0",
      "last_seen_at": "2025-06-24T13:45:00Z",
      "created_at": "2025-06-10T10:00:00Z",
      "active_sessions": 1
    }
  ]
}
```
- ❌ `401 Unauthorized`

```json
{ 
  "error": "Unauthorized" 
}
```

---

## TP-0011: Sensitive User Data

**GET** `/api/user`

Requires Authorization: Bearer <access_token> header

### Response
- ✅ `200 OK`

```json
{
    "id": "user_uuid"
}
```
- ❌ `401 Unauthorized`

```json
{
    "error": "Invalid token"
}
```