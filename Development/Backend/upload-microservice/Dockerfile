# Use official lightweight Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install OS-level dependencies including poppler-utils and ClamAV
RUN apt-get update && apt-get install -y \
    poppler-utils \
    gcc \
    clamav \
    libffi-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the application code
COPY . .

# Expose the Flask port
EXPOSE 3003

# Run the app with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:3003", "run:app"]
