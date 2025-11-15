FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY *.py ./

# Create store directory
RUN mkdir -p /app/store

# Create non-root user for security
RUN groupadd -r whatsapp && useradd -r -g whatsapp -d /app -s /bin/bash whatsapp
RUN chown -R whatsapp:whatsapp /app
USER whatsapp

# Set environment variables for Cloud Run
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health', timeout=5)"

# Run the HTTP server
CMD ["python", "http_server.py"]
