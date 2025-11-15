#!/bin/bash

# Deploy WhatsApp MCP Server to Google Cloud Run
# This script builds and deploys the WhatsApp MCP service to Cloud Run

set -e

# Configuration
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="whatsapp-mcp-server"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying WhatsApp MCP Server to Cloud Run"
echo "Project: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "Image: ${IMAGE_NAME}"

# Build and push the container image
echo "📦 Building container image..."
gcloud builds submit --tag ${IMAGE_NAME} -f Dockerfile.cloudrun .

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 3600 \
  --set-env-vars "PORT=8080" \
  --set-env-vars "PYTHONUNBUFFERED=1" \
  --set-env-vars "WHATSAPP_PHONE_NUMBER=${WHATSAPP_PHONE_NUMBER}"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --format 'value(status.url)')

echo "✅ Deployment complete!"
echo "🌐 Service URL: ${SERVICE_URL}"
echo "💚 Health check: ${SERVICE_URL}/health"
echo "📝 API docs: ${SERVICE_URL}/docs"

# Test the health endpoint
echo "🔍 Testing health endpoint..."
curl -f "${SERVICE_URL}/health" && echo "✅ Health check passed!" || echo "❌ Health check failed!"

echo ""
echo "🔧 Next steps:"
echo "1. Update your .env.cloudrun file with:"
echo "   WHATSAPP_BRIDGE_URL=${SERVICE_URL}"
echo "2. Test the API endpoints at ${SERVICE_URL}/docs"
echo "3. Configure your WhatsApp webhook if needed"