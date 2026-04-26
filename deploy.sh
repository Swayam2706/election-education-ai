#!/bin/bash

# Complete Deployment Script for Google Cloud Run
# Deploys both backend and frontend services

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Election App - Full Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Check gcloud
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI not installed${NC}"
    exit 1
fi

# Get configuration
read -p "Enter GCP Project ID: " PROJECT_ID
read -p "Enter Region [us-central1]: " REGION
REGION=${REGION:-us-central1}

gcloud config set project $PROJECT_ID

# Enable APIs
echo -e "${YELLOW}Enabling APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# Deploy Backend
echo -e "${YELLOW}Deploying Backend...${NC}"
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/election-backend
gcloud run deploy election-backend \
  --image gcr.io/$PROJECT_ID/election-backend \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 10
cd ..

BACKEND_URL=$(gcloud run services describe election-backend --region $REGION --format 'value(status.url)')
echo -e "${GREEN}Backend deployed: ${BACKEND_URL}${NC}"

# Deploy Frontend
echo -e "${YELLOW}Deploying Frontend...${NC}"
cd frontend
gcloud builds submit --tag gcr.io/$PROJECT_ID/election-frontend \
  --substitutions=_BACKEND_URL=${BACKEND_URL}/api
gcloud run deploy election-frontend \
  --image gcr.io/$PROJECT_ID/election-frontend \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi \
  --min-instances 0 \
  --max-instances 10
cd ..

FRONTEND_URL=$(gcloud run services describe election-frontend --region $REGION --format 'value(status.url)')

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Frontend: ${FRONTEND_URL}${NC}"
echo -e "${GREEN}Backend: ${BACKEND_URL}${NC}"
echo -e "${YELLOW}Update backend CORS_ORIGIN to: ${FRONTEND_URL}${NC}"
