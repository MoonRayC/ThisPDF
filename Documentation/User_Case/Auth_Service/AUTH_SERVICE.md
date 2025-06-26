# Auth Microservice – Use Case Documentation

This document outlines the key operations supported by the **Auth Microservice**, including inputs, outputs, and expected behaviors for authentication, registration, and account management.

### Tech-Stack: NodeJS + PostgreSQL

---

## TP-0001: Register a New User

* **Description**: Registers a new user with email and password.

### 🔹 Request

**Method**: `POST`
**Endpoint**: `/register`
**Body Parameters**:

| Field                   | Type   | Required | Description           |
| ----------------------- | ------ | -------- | --------------------- |
| `email`                 | string | ✅ Yes    | User's email          |
| `password`              | string | ✅ Yes    | User's password       |
| `password_confirmation` | string | ✅ Yes    | Must match `password` |

### 🔸 Response

* ✅ **201 Created** – User registered
* ❌ **400 Bad Request** – Validation error

---

## TP-0002: Verify Email Address

* **Description**: Confirms a user's email using a verification code.

### 🔹 Request

**Method**: `POST`
**Endpoint**: `/verify-email`
**Body Parameters**:

| Field                | Type   | Required | Description             |
| -------------------- | ------ | -------- | ----------------------- |
| `user_id`            | UUID   | ✅ Yes    | User's UUID             |
| `verification_token` | string | ✅ Yes    | Email verification code |

### 🔸 Response

* ✅ **200 OK** – Email verified
* ❌ **400/404** – Invalid or expired token

---

## TP-0003: Resend Verification Code

* **Description**: Sends a new email verification code.

### 🔹 Request

**Method**: `POST`
**Endpoint**: `/resend-code`
**Body Parameters**:

| Field   | Type   | Required | Description      |
| ------- | ------ | -------- | ---------------- |
| `email` | string | ✅ Yes    | Registered email |

### 🔸 Response

* ✅ **200 OK** – Code resent
* ❌ **404 Not Found** – Email not registered

---

## TP-0004: Log In

* **Description**: Authenticates a user and returns a JWT and refresh token.

### 🔹 Request

**Method**: `POST`
**Endpoint**: `/login`
**Body Parameters**:

| Field        | Type   | Required | Description       |
| ------------ | ------ | -------- | ----------------- |
| `email`      | string | ✅ Yes    | Email address     |
| `password`   | string | ✅ Yes    | User password     |
| `user_agent` | string | ❌ No     | Device info       |
| `ip_address` | string | ❌ No     | Client IP address |

### 🔸 Response

* ✅ **200 OK** – Access & refresh token
* ❌ **401 Unauthorized** – Invalid credentials

---

## TP-0005: Refresh Token

* **Description**: Generates a new JWT using a valid refresh token.

### 🔹 Request

**Method**: `POST`
**Endpoint**: `/refresh`
**Body Parameters**:

| Field           | Type   | Required | Description   |
| --------------- | ------ | -------- | ------------- |
| `refresh_token` | string | ✅ Yes    | Refresh token |

### 🔸 Response

* ✅ **200 OK** – New JWT token
* ❌ **403 Forbidden** – Invalid/expired token

---

## TP-0006: Request Password Reset

* **Description**: Sends a password reset token to the user's email.

### 🔹 Request

**Method**: `POST`
**Endpoint**: `/request-password-reset`
**Body Parameters**:

| Field   | Type   | Required | Description      |
| ------- | ------ | -------- | ---------------- |
| `email` | string | ✅ Yes    | Registered email |

### 🔸 Response

* ✅ **200 OK** – Reset token sent

---

## TP-0007: Reset Password

* **Description**: Resets user password using a token.

### 🔹 Request

**Method**: `POST`
**Endpoint**: `/reset-password`
**Body Parameters**:

| Field                       | Type   | Required | Description             |
| --------------------------- | ------ | -------- | ----------------------- |
| `reset_token`               | string | ✅ Yes    | Provided reset token    |
| `new_password`              | string | ✅ Yes    | New password            |
| `new_password_confirmation` | string | ✅ Yes    | Must match new password |

### 🔸 Response

* ✅ **200 OK** – Password updated
* ❌ **400/403** – Invalid or expired token

---

## TP-0008: Logout

* **Description**: Logs out user by invalidating the refresh token.

### 🔹 Request

**Method**: `POST`
**Endpoint**: `/logout`
**Body Parameters**:

| Field           | Type   | Required | Description         |
| --------------- | ------ | -------- | ------------------- |
| `refresh_token` | string | ✅ Yes    | Token to invalidate |

### 🔸 Response

* ✅ **200 OK** – Logged out successfully

---

## TP-0009: Google Social Login

* **Description**: Authenticates user using Google OAuth access token.

### 🔹 Request

**Method**: `POST`
**Endpoint**: `/social/google`
**Body Parameters**:

| Field          | Type   | Required | Description        |
| -------------- | ------ | -------- | ------------------ |
| `access_token` | string | ✅ Yes    | Google OAuth token |

### 🔸 Response

* ✅ **200 OK** – Logged in using Google
* ❌ **401 Unauthorized** – Invalid token

---

## TP-0010: List Active Devices

* **Description**: Returns a list of active sessions/devices used by the user.

### 🔹 Request

**Method**: `GET`
**Endpoint**: `/devices`
**Header**: `Authorization: Bearer <token>`

### 🔸 Response

* ✅ **200 OK** – List of devices
* ❌ **401 Unauthorized** – Invalid or missing token

---

## TP-0011: Get Authenticated User Info

* **Description**: Returns details of the currently logged-in user.

### 🔹 Request

**Method**: `GET`
**Endpoint**: `/user`
**Header**: `Authorization: Bearer <token>`

### 🔸 Response

* ✅ **200 OK** – User details returned

---

## Notes

* All JWT-protected endpoints require `Authorization: Bearer <token>` in the request header.
* Social login integration uses Google's access token and does not require prior registration.

---

© \[RDCbits @ Raymond D. Chavez Jr.], 2025 – All rights reserved.
