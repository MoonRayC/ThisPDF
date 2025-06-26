# 📄 Upload Microservice Documentation

## 🧠 Overview

Upload Service is a microservice responsible for:

- Uploading PDF files (public or private)
- Scanning files for viruses using ClamAV
- Extracting metadata (title, size, pages)
- Storing files in MinIO
- Saving metadata (category, subcategory, tags)
- Verifying uploader via Auth microservice

---

## 🚀 Technologies Used

- **Flask** (API framework)  
- **ClamAV** (virus scanning)  
- **MinIO** (S3-compatible file storage)  
- **Python 3.10+**

---

## 🗂️ File Structure

```
upload_microservice/
├── venv
├── app/
│   ├── __init__.py                # Flask app factory
│   ├── config.py                  # Configuration loader
│   ├── data/
│   │   └── categories.json        # Static category-subcategory map
│   ├── routes/
│   │   └── upload_routes.py       # PDF upload and metadata endpoints
│   ├── services/
│   │   ├── virus_scanner.py       # Scan PDFs using ClamAV
│   │   ├── metadata_extractor.py  # Extract page count, size, title, etc.
│   │   └── storage.py             # Upload PDFs to MinIO
│   ├── utils/
│   │   └── auth.py                # Validate JWT & get user UUID
│   └── minio_client.py           # MinIO client initialization
├── run.py                         # Entry point
├── requirements.txt               # Python dependencies
├── .env                           # Environment variables (not committed)
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
FLASK_ENV=development
PORT=3003

# Auth microservice
AUTH_SERVICE_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret

# ClamAV
CLAMAV_SOCKET=/var/run/clamav/clamd.ctl

# MinIO credentials
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=xinyar219
MINIO_SECRET_KEY=raynix219
MINIO_BUCKET=pdf-upload-service
```

---

## 📦 Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

> ✅ Ensure ClamAV and MinIO are running locally.

---

## ▶️ Running the Service

```bash
# Run Flask server
python run.py
```

Flask app will start on: [http://localhost:3003](http://localhost:3003)

---

## 📁 Example MinIO Bucket Structure

Bucket: `pdf-upload-service`

```
pdf-upload-service/
├── public/
│   └── <uuid>.pdf
├── private/
│   └── <uuid>.pdf
```

---

## 🔐 Auth Integration

This service queries `/api/user` from the Auth microservice using the JWT in the `Authorization` header:

### Request:

```http
GET /api/user
Authorization: Bearer <token>
```

### Response:

```json
{
  "id": "user-uuid"
}
```

---

## 🧾 API Endpoints

### ✅ Upload PDF

**POST** `/api/upload`

**Form Data:**

- `file`: PDF file
- `category`: string
- `subcategory`: string
- `tags`: list[string]
- `visibility`: `'public'` | `'private'`

**Headers:**

```http
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Upload successful",
  "pdf_id": "uuid",
  "file_url": "https://.../public/uuid.pdf",
  "metadata": {
    "title": "Extracted Title",
    "pages": 5,
    "size_kb": 400,
    "visibility": "public",
    "category": "Technology",
    "subcategory": "AI",
    "tags": ["deep learning", "neural networks"]
  }
}
```

---

### 📚 Get Categories & Subcategories

**GET** `/api/upload/categories`

**Response:**

```json
{
  "Technology": ["AI", "Cybersecurity", "IoT"],
  "Education": ["History", "Math", "Science"]
}
```

---

## 🚫 Validation Errors

### 400 Bad Request

```json
{
  "error": "Invalid category or subcategory"
}
```

### 401 Unauthorized

```json
{
  "error": "Invalid token"
}
```

### 415 Unsupported Media Type

```json
{
  "error": "Only PDF files are allowed"
}
```

---

## 🛡️ Notes

- ClamAV must be installed and running as a daemon (`clamd`).
- Ensure MinIO bucket `pdf-upload-service` exists before uploads.
- Tags can be arbitrary user input; categories/subcategories are validated.


docker run -d --name clamav -p 3310:3310 clamav/clamav:1.4
docker run -p 9000:9000 -p 9001:9001 --name minio1 -v D:\minio\data:/data -e "MINIO_ROOT_USER=xinyar219" -e "MINIO_ROOT_PASSWORD=raynix219" quay.io/minio/minio server /data --console-address ":9001"

docker start minio1
docker start clamav

