# Friends Microservice – Use Case Documentation

This document outlines the key operations supported by the **Friends Microservice**, including inputs, outputs, and expected behaviors for friend management and access control in the PDF Sharing platform.

### Tech-Stack: NodeJS + MongoDB

---

## TP-0019: Send Friend Request

* **Description**: Allows an authenticated user to send a friend request to another user. Optional message can be included.

### 🔹 Request

**Method**: `POST`
**Endpoint**: `/api/friends/requests`
**Body Parameters**:

| Field          | Type   | Required | Description                   |
| -------------- | ------ | -------- | ----------------------------- |
| `recipient_id` | UUID   | ✅ Yes    | Target user ID                |
| `message`      | string | ❌ No     | Optional message with request |

### 🔸 Response

* ✅ **201 Created** – Request sent successfully
* ❌ **400 Bad Request** – Invalid input or already requested
* ❌ **404 Not Found** – Recipient does not exist

---

## TP-0020: Cancel Sent Friend Request

* **Description**: Allows a user to cancel a pending friend request they sent.

### 🔹 Request

**Method**: `DELETE`
**Endpoint**: `/api/friends/requests/:request_id`

### 🔸 Response

* ✅ **204 No Content** – Successfully canceled
* ❌ **404 Not Found** – Request not found or already accepted

---

## TP-0021: Accept or Reject Friend Request

* **Description**: Lets a user accept or reject a pending friend request.

### 🔹 Request

**Method**: `PATCH`
**Endpoint**: `/api/friends/requests/:request_id`
**Body Parameters**:

| Field    | Type   | Required | Description          |
| -------- | ------ | -------- | -------------------- |
| `action` | string | ✅ Yes    | `accept` or `reject` |

### 🔸 Response

* ✅ **200 OK** – Friend added or request rejected
* ❌ **400 Bad Request** – Invalid action
* ❌ **404 Not Found** – Request not found

---

## TP-0022: Unfriend User

* **Description**: Removes an existing friend connection.

### 🔹 Request

**Method**: `DELETE`
**Endpoint**: `/api/friends/:friend_id`

### 🔸 Response

* ✅ **204 No Content** – Successfully unfriended
* ❌ **404 Not Found** – Friend not found

---

## TP-0023: Block or Unblock User

* **Description**: Allows users to block or unblock another user.

### 🔹 Request

**Method**: `POST` or `DELETE`
**Endpoint**: `/api/friends/blocks/:user_id`
**Body Parameters** (for `POST` only):

| Field    | Type   | Required | Description      |
| -------- | ------ | -------- | ---------------- |
| `reason` | string | ❌ No     | Reason for block |

### 🔸 Response

* ✅ **200 OK** or **204 No Content**
* ❌ **404 Not Found** – User not found

---

## TP-0024: View Own Friend List

* **Description**: Lists all friends for the current user.

### 🔹 Request

**Method**: `GET`
**Endpoint**: `/api/friends`

### 🔸 Response

* ✅ **200 OK** – Returns list of friends

---

## TP-0025: View Public Profile and Public PDFs

* **Description**: View any user's public profile and their public PDF uploads.

### 🔹 Request

**Method**: `GET`
**Endpoint**: `/api/public/:user_id`

### 🔸 Response

* ✅ **200 OK** – Returns public profile and PDFs
* ❌ **404 Not Found** – User not found

---

## TP-0108: View Public Friend List

* **Description**: Displays a user's friends publicly (if allowed).

### 🔹 Request

**Method**: `GET`
**Endpoint**: `/api/public/:user_id/friends`

### 🔸 Response

* ✅ **200 OK** – Returns friend list
* ❌ **404 Not Found** – User not found

---

## TP-0026: View Private PDFs (If Friends)

* **Description**: Allows access to a user’s private PDFs **only if the viewer is a confirmed friend**.

### 🔹 Request

**Method**: `GET`
**Endpoint**: `/api/users/:user_id/private-pdfs`

### 🔸 Response

* ✅ **200 OK** – Returns private PDFs
* ❌ **403 Forbidden** – Not friends with user
* ❌ **404 Not Found** – User or PDFs not found

---

## TP-0027: Friend Suggestions

* **Description**: Suggests new users to befriend based on mutual friends or other criteria.

### 🔹 Request

**Method**: `GET`
**Endpoint**: `/api/friends/suggestions`

### 🔸 Response

* ✅ **200 OK** – Returns list of suggested users

---

## TP-0028: Friend Activity Feed

* **Description**: Shows recent friend-related events such as accepted requests, blocks, etc.

### 🔹 Request

**Method**: `GET`
**Endpoint**: `/api/friends/activity`

### 🔸 Response

* ✅ **200 OK** – Returns activity feed

---

## Notes

* All authenticated routes require a **valid JWT token** in the `Authorization: Bearer <token>` header.
* Unauthorized users can still browse public data via `/api/public/*` routes.
* Friendship-based access control is enforced at the PDF service layer using this microservice's logic.

---

© \[RDCbits @ Raymond D. Chavez Jr.], 2025 – All rights reserved.
