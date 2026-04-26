#!/bin/bash

# Frontend Deployment Script for Google Cloud Run
# This script deploys the frontend service to Google Cloud Run

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Election Frontend - Cloud Run Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-""}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="election-frontend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
BACKEND_URL=${BACKEND_URL:-""}

# Prompt for project ID if not set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}Enter your Google Cloud Project ID:${NC}"
    read PROJECT_ID
fi

# Prompt for backend URL if not set
if [ -z "$BACKEND_URL" ]; then
    echo -e "${YELLOW}Enter your Backend URL (e.g., https://election-backend-xxx.run.app/api):${NC}"
    read BACKEND_URL
fi

# Set the project
echo -e "${YELLOW}Setting project to: ${PROJECT_ID}${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the Docker image with backend URL
echo -e "${YELLOW}Building Docker image with REACT_APP_API_URL=${BACKEND_URL}...${NC}"
cd frontend
docker build \
  --build-arg REACT_APP_API_URL=$BACKEND_URL \
  -t $IMAGE_NAME:latest .
cd ..

# Push to Container Registry
echo -e "${YELLOW}Pushing image to Container Registry...${NC}"
docker push $IMAGE_NAME:latest

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Frontend URL: ${SERVICE_URL}${NC}"
echo -e "${GREEN}Backend URL: ${BACKEND_URL}${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update backend CORS_ORIGIN to allow: ${SERVICE_URL}"
echo "2. Test the application at: ${SERVICE_URL}"
echo "3. Configure custom domain (optional)"
echo -e "${GREEN}========================================${NC}"
