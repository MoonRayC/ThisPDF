📄 Upload Microservice Documentation
🧠 Overview
Upload Service is a microservice responsible for:

Uploading PDF files (public or private)

Scanning files for viruses using ClamAV

Extracting metadata (title, size, pages)

Storing files in MinIO

Saving metadata (category, subcategory, tags)

Verifying uploader via Auth microservice

🚀 Technologies Used
Flask (API framework)

ClamAV (virus scanning)

MinIO (S3-compatible file storage)

Python 3.10+

🗂️ File Structure
graphql
Copy
Edit
upload_service/
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
⚙️ Environment Variables
Create a .env file in the root:

env
Copy
Edit
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
📦 Installation
bash
Copy
Edit
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
Ensure ClamAV and MinIO are running locally.

▶️ Running the Service
bash
Copy
Edit
# Run Flask server
python run.py
Flask app will start on http://localhost:3003

📁 Example MinIO Bucket Structure
Bucket: pdf-upload-service

pgsql
Copy
Edit
pdf-upload-service/
├── public/
│   └── <uuid>.pdf
├── private/
│   └── <uuid>.pdf
🔐 Auth Integration
This service queries /api/user from Auth microservice using the JWT in Authorization header:

http
Copy
Edit
GET /api/user
Authorization: Bearer <token>
Response:

json
Copy
Edit
{
  "id": "user-uuid"
}
🧾 API Endpoints
✅ Upload PDF
POST /api/upload

Form Data:

csharp
Copy
Edit
- file: PDF file
- category: string
- subcategory: string
- tags: list[string]
- visibility: 'public' | 'private'
Headers:

http
Copy
Edit
Authorization: Bearer <token>
Response:

json
Copy
Edit
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
📚 Get Categories & Subcategories
GET /api/upload/categories

Response:

json
Copy
Edit
{
  "Technology": ["AI", "Cybersecurity", "IoT"],
  "Education": ["History", "Math", "Science"]
}
🚫 Validation Errors
400 Bad Request

json
Copy
Edit
{
  "error": "Invalid category or subcategory"
}
401 Unauthorized

json
Copy
Edit
{
  "error": "Invalid token"
}
415 Unsupported Media Type

json
Copy
Edit
{
  "error": "Only PDF files are allowed"
}
🛡️ Notes
ClamAV must be installed and running as a daemon (clamd).

Make sure MinIO bucket pdf-upload-service exists before uploads.

Tags can be arbitrary user-input; categories/subcategories are validated.