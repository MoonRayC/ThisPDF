# Upload Microservice API

---

## UP-0001: Get Categories

**GET** `/api/upload/categories`

Retrieves all available categories and their subcategories for file uploads.

### Response
- ✅ `200 OK`

```json
{
  "Education": ["Mathematics", "Science", "History"],
  "Technology": ["AI", "Cloud", "Programming"],
  "Business": ["Marketing", "Finance", "Management"]
}
```
- ❌ `500 Internal Server Error`

```json
{
  "error": "Failed to retrieve categories",
  "details": "Internal server error message"
}
```

---

## UP-0002: Upload PDF

**POST** `/api/upload`

Uploads a PDF file with metadata and categorization.

**Requires Authorization:** Bearer <access_token> header

### Request
**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | binary | ✅ | PDF file to upload |
| `category` | string | ✅ | Main category |
| `subcategory` | string | ✅ | Subcategory within main category |
| `visibility` | string | ✅ | `public` or `private` |
| `tags` | string | ❌ | Comma-separated tags |

### Response
- ✅ `201 Created`

```json
{
  "message": "Upload successful",
  "pdf_id": "file_uuid",
  "file_url": "https://example.com/bucket/public/file_uuid.pdf",
  "image_url": "https://example.com/bucket/preview/file_uuid.jpg",
  "metadata": {
    "title": "Document Title",
    "pages": 25,
    "size_kb": 1024,
    "visibility": "public",
    "category": "Education",
    "subcategory": "Mathematics",
    "tags": ["algebra", "geometry"],
    "uploader_id": "user_uuid",
    "author": "John Doe",
    "subject": "Mathematics Textbook",
    "creator": "Adobe Acrobat"
  }
}
```
- ❌ `400 Bad Request`

```json
{
  "error": "Validation failed",
  "details": "No file provided"
}
```

```json
{
  "error": "Invalid file type",
  "details": "Only PDF files are allowed"
}
```

```json
{
  "error": "File rejected - virus detected",
  "details": "Malware detected in uploaded file"
}
```
- ❌ `401 Unauthorized`

```json
{
  "error": "Unauthorized"
}
```
- ❌ `413 Payload Too Large`

```json
{
  "error": "File too large",
  "details": "Maximum file size exceeded"
}
```

---

## UP-0003: Delete PDF

**DELETE** `/api/upload/files/{file_id}`

Deletes a PDF file by its ID.

**Requires Authorization:** Bearer <access_token> header

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | ✅ | The ID of the file to delete |

### Response
- ✅ `200 OK`

```json
{
  "message": "File deleted successfully"
}
```
- ❌ `404 Not Found`

```json
{
  "error": "File not found"
}
```
- ❌ `401 Unauthorized`

```json
{
  "error": "Unauthorized"
}
```
- ❌ `500 Internal Server Error`

```json
{
  "error": "Failed to delete file",
  "details": "Internal server error message"
}
```

---

## UP-0004: Get File URL

**GET** `/api/upload/files/{file_id}/url`

Generates a URL to access a PDF file (public or private with expiration).

**Requires Authorization:** Bearer <access_token> header

### Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `file_id` | string | ✅ | - | The ID of the PDF file |
| `visibility` | string | ❌ | `private` | `public` or `private` |
| `expires` | integer | ❌ | `3600` | Expiration time in seconds (1-86400) |

### Response
- ✅ `200 OK` (Public URL)

```json
{
  "file_url": "https://example.com/bucket/public/file_uuid.pdf",
  "expires_in": null,
  "visibility": "public"
}
```
- ✅ `200 OK` (Private URL)

```json
{
  "file_url": "https://example.com/bucket/private/file_uuid.pdf?X-Amz-Algorithm=...",
  "expires_in": 3600,
  "visibility": "private"
}
```
- ❌ `400 Bad Request`

```json
{
  "error": "Invalid expires parameter. Must be a number."
}
```

```json
{
  "error": "Visibility must be \"public\" or \"private\""
}
```

```json
{
  "error": "Expires must be between 1 and 86400 seconds"
}
```
- ❌ `404 Not Found`

```json
{
  "error": "File URL not found"
}
```
- ❌ `401 Unauthorized`

```json
{
  "error": "Unauthorized"
}
```

---

## UP-0005: Get Preview Image

**GET** `/api/upload/preview/image/{file_id}`

Retrieves the preview image URL for the first page of a PDF.

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | ✅ | The ID of the PDF file |

### Response
- ✅ `200 OK`

```json
{
  "preview_url": "https://example.com/bucket/preview/file_uuid.jpg"
}
```
- ❌ `404 Not Found`

```json
{
  "error": "Preview image not found"
}
```
- ❌ `500 Internal Server Error`

```json
{
  "error": "Error retrieving preview"
}
```

---

## Error Codes Reference

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| `400` | Validation Error | Invalid request parameters or file format |
| `401` | Unauthorized | Missing or invalid authentication token |
| `404` | Not Found | File or resource not found |
| `413` | Payload Too Large | File size exceeds maximum limit |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side processing error |

---

## File Upload Specifications

### Supported File Types
- PDF files only (`.pdf`)

### File Size Limits
- Maximum file size: Configured by server (typically 10MB-100MB)

### Security Features
- Virus scanning on all uploaded files
- File type validation
- Secure filename handling
- Authentication required for uploads

### Visibility Options
- **Public**: Files accessible via direct URL without authentication
- **Private**: Files require presigned URLs with expiration times

### Preview Generation
- Automatic generation of JPG preview from first page
- Preview images stored in public bucket for easy access