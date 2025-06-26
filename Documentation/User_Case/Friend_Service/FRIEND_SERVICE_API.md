# Friends Microservice API

---

## FR-0001: Send Friend Request

**POST** `/api/friends/request`

Sends a new friend request to another user.

### Request

```json
{
  "recipient_id": "uuid",
  "message": "Let's connect!"
}
```

### Response

* ✅ `201 Created`

```json
{
  "message": "Friend request sent",
  "request": {
    "id": "uuid",
    "requester_id": "uuid",
    "recipient_id": "uuid",
    "status": "pending",
    "created_at": "2025-06-26T12:00:00.000Z"
  }
}
```

* ❌ `409 Conflict`

```json
{
  "error": "Already friends or request exists"
}
```

---

## FR-0002: Accept Friend Request

**PUT** `/api/friends/request/accept`

Accepts an incoming friend request.

### Request

```json
{
  "request_id": "uuid"
}
```

### Response

* ✅ `200 OK`

```json
{
  "message": "Friend request accepted"
}
```

---

## FR-0003: Reject Friend Request

**PUT** `/api/friends/request/reject`

Rejects an incoming friend request.

### Request

```json
{
  "request_id": "uuid"
}
```

### Response

* ✅ `200 OK`

```json
{
  "message": "Friend request rejected"
}
```

---

## FR-0004: Cancel Sent Friend Request

**PUT** `/api/friends/request/cancel`

Cancels a sent friend request.

### Request

```json
{
  "request_id": "uuid"
}
```

### Response

* ✅ `200 OK`

```json
{
  "message": "Friend request cancelled"
}
```

---

## FR-0005: Get Pending Friend Requests

**GET** `/api/friends/requests/pending`

Returns a list of incoming pending friend requests.

### Response

* ✅ `200 OK`

```json
[
  {
    "id": "uuid",
    "requester_id": "uuid",
    "recipient_id": "uuid",
    "status": "pending"
  }
]
```

---

## FR-0006: Get Sent Friend Requests

**GET** `/api/friends/requests/sent`

Returns a list of sent friend requests.

### Response

* ✅ `200 OK`

```json
[
  {
    "id": "uuid",
    "recipient_id": "uuid",
    "status": "pending"
  }
]
```

---

## FR-0007: Get User's Friends List

**GET** `/api/friends/:user_id`

Returns a list of accepted friends for a specific user.

### Response

* ✅ `200 OK`

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "friend_id": "uuid",
    "status": "accepted",
    "created_at": "2025-06-26T12:00:00.000Z"
  }
]
```

---

## FR-0008: Block a User

**POST** `/api/friends/block`

Blocks another user from interacting.

### Request

```json
{
  "user_id": "uuid",
  "reason": "Spamming"
}
```

### Response

* ✅ `200 OK`

```json
{
  "message": "User blocked"
}
```

---

## FR-0009: Unblock a User

**POST** `/api/friends/unblock`

Unblocks a previously blocked user.

### Request

```json
{
  "user_id": "uuid"
}
```

### Response

* ✅ `200 OK`

```json
{
  "message": "User unblocked"
}
```

---

## FR-0010: Get Blocked Users

**GET** `/api/friends/blocked`

Returns a list of users blocked by the authenticated user.

### Response

* ✅ `200 OK`

```json
[
  {
    "blocked_id": "uuid",
    "blocker_id": "uuid",
    "reason": "Toxic behavior"
  }
]
```

---

## FR-0011: Get Friend Recommendations

**GET** `/api/friends/recommendations`

Returns a list of recommended users to connect with.

### Response

* ✅ `200 OK`

```json
[
  {
    "user_id": "uuid",
    "mutual_friends": 4
  }
]
```

---

## FR-0012: Get Relationship Status with Another User

**GET** `/api/friends/status/:user_id`

Returns the relationship status with the target user.

### Response

* ✅ `200 OK`

```json
{
  "status": "friends",
  "relationship": {
    "id": "uuid",
    "user1_id": "uuid",
    "user2_id": "uuid",
    "created_at": "2025-06-26T12:00:00.000Z"
  }
}
```

* ❌ `200 OK`

```json
{
  "status": "blocked_by_them",
  "relationship": null
}
```
