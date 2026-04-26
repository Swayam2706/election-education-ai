#!/bin/bash

# Simple Google Cloud Run Deployment Script
# This script deploys both backend and frontend to Google Cloud Run

echo "🚀 Starting Google Cloud Run Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK not found. Please install it first:${NC}"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
echo -e "${BLUE}📋 Enter your Google Cloud Project ID:${NC}"
read PROJECT_ID

# Set project
gcloud config set project $PROJECT_ID

# Get region (default: us-central1)
echo -e "${BLUE}📍 Enter region (press Enter for us-central1):${NC}"
read REGION
REGION=${REGION:-us-central1}

# Get MongoDB URI
echo -e "${BLUE}🗄️  Enter your MongoDB URI:${NC}"
read MONGODB_URI

# Get Gemini API Key
echo -e "${BLUE}🤖 Enter your Gemini API Key:${NC}"
read GEMINI_API_KEY

# Get JWT Secret
echo -e "${BLUE}🔐 Enter JWT Secret (or press Enter to generate):${NC}"
read JWT_SECRET
JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}

# Get Firebase Config
echo -e "${BLUE}🔥 Enter Firebase API Key:${NC}"
read FIREBASE_API_KEY

echo -e "${BLUE}🔥 Enter Firebase Auth Domain:${NC}"
read FIREBASE_AUTH_DOMAIN

echo -e "${BLUE}🔥 Enter Firebase Project ID:${NC}"
read FIREBASE_PROJECT_ID

echo -e "${BLUE}🔥 Enter Firebase Storage Bucket:${NC}"
read FIREBASE_STORAGE_BUCKET

echo -e "${BLUE}🔥 Enter Firebase Messaging Sender ID:${NC}"
read FIREBASE_MESSAGING_SENDER_ID

echo -e "${BLUE}🔥 Enter Firebase App ID:${NC}"
read FIREBASE_APP_ID

echo -e "${BLUE}🔥 Enter Firebase Measurement ID:${NC}"
read FIREBASE_MEASUREMENT_ID

# Enable required APIs
echo -e "${GREEN}✅ Enabling required Google Cloud APIs...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Deploy Backend
echo -e "${GREEN}🔧 Deploying Backend to Cloud Run...${NC}"
cd backend

gcloud run deploy election-backend \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars "MONGODB_URI=$MONGODB_URI,GEMINI_API_KEY=$GEMINI_API_KEY,JWT_SECRET=$JWT_SECRET,PORT=8080,NODE_ENV=production"

# Get backend URL
BACKEND_URL=$(gcloud run services describe election-backend --region $REGION --format 'value(status.url)')
echo -e "${GREEN}✅ Backend deployed at: $BACKEND_URL${NC}"

# Seed database
echo -e "${GREEN}🌱 Seeding database...${NC}"
export MONGODB_URI=$MONGODB_URI
node scripts/seed-india.js

cd ..

# Deploy Frontend
echo -e "${GREEN}🎨 Deploying Frontend to Cloud Run...${NC}"
cd frontend

gcloud run deploy election-frontend \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "REACT_APP_API_URL=$BACKEND_URL,REACT_APP_FIREBASE_API_KEY=$FIREBASE_API_KEY,REACT_APP_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN,REACT_APP_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID,REACT_APP_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET,REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID,REACT_APP_FIREBASE_APP_ID=$FIREBASE_APP_ID,REACT_APP_FIREBASE_MEASUREMENT_ID=$FIREBASE_MEASUREMENT_ID"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe election-frontend --region $REGION --format 'value(status.url)')

cd ..

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📱 Frontend URL: $FRONTEND_URL${NC}"
echo -e "${BLUE}🔧 Backend URL: $BACKEND_URL${NC}"
echo ""
echo -e "${GREEN}✅ Your Election Education AI app is now live on Google Cloud Run!${NC}"
