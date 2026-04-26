#!/bin/bash

# Script to set environment variables for Cloud Run services

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

read -p "Enter GCP Project ID: " PROJECT_ID
read -p "Enter Region [us-central1]: " REGION
REGION=${REGION:-us-central1}

gcloud config set project $PROJECT_ID

echo -e "${YELLOW}Setting Backend Environment Variables...${NC}"
gcloud run services update election-backend \
  --region $REGION \
  --update-env-vars \
NODE_ENV=production,\
MONGODB_URI="$MONGODB_URI",\
JWT_SECRET="$JWT_SECRET",\
FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID",\
FIREBASE_PRIVATE_KEY="$FIREBASE_PRIVATE_KEY",\
FIREBASE_CLIENT_EMAIL="$FIREBASE_CLIENT_EMAIL",\
GEMINI_API_KEY="$GEMINI_API_KEY",\
CORS_ORIGIN="$CORS_ORIGIN"

echo -e "${GREEN}Environment variables updated!${NC}"
