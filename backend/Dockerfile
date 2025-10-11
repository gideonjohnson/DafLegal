FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies (without the heavy unstructured package first)
RUN pip install --no-cache-dir -r requirements.txt --use-pep517

# Copy application
COPY ./app ./app

# Expose port
EXPOSE 8000

# Run application with Railway's PORT variable
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
