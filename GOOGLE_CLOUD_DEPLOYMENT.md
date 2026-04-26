# 🚀 Google Cloud Run Deployment Guide

## Quick Start (5 Minutes)

### Prerequisites
1. **Google Cloud SDK** - Install from: https://cloud.google.com/sdk/docs/install
2. **Google Cloud Account** with billing enabled
3. **MongoDB Atlas** account (free tier works)
4. **Gemini API Key** from: https://makersuite.google.com/app/apikey
5. **Firebase Project** from: https://console.firebase.google.com

---

## Option 1: Automated Deployment (EASIEST)

### For Windows:
```bash
# Clone your repo
git clone https://github.com/Swayam2706/election-education-ai.git
cd election-education-ai

# Run the deployment script
deploy-to-cloud-run.bat
```

### For Mac/Linux:
```bash
# Clone your repo
git clone https://github.com/Swayam2706/election-education-ai.git
cd election-education-ai

# Make script executable
chmod +x deploy-to-cloud-run.sh

# Run the deployment script
./deploy-to-cloud-run.sh
```

The script will ask you for:
- Google Cloud Project ID
- Region (default: us-central1)
- MongoDB URI
- Gemini API Key
- JWT Secret (auto-generated if empty)
- Firebase configuration

**That's it!** Your app will be deployed in 5-10 minutes.

---

## Option 2: Manual Step-by-Step

### Step 1: Install Google Cloud SDK

**Windows:**
1. Download from: https://cloud.google.com/sdk/docs/install
2. Run installer
3. Open new terminal

**Mac:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Step 2: Initialize gcloud

```bash
# Initialize
gcloud init

# Login
gcloud auth login

# Set project (create one at console.cloud.google.com if needed)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 3: Clone Your Repository

```bash
git clone https://github.com/Swayam2706/election-education-ai.git
cd election-education-ai
```

### Step 4: Deploy Backend

```bash
cd backend

gcloud run deploy election-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars "MONGODB_URI=your_mongodb_uri,GEMINI_API_KEY=your_gemini_key,JWT_SECRET=your_jwt_secret,PORT=8080,NODE_ENV=production"
```

**Copy the backend URL from the output!** It will look like:
`https://election-backend-xxxxx-uc.a.run.app`

### Step 5: Seed Database

```bash
# Still in backend folder
export MONGODB_URI="your_mongodb_uri"
node scripts/seed-india.js
```

### Step 6: Deploy Frontend

```bash
cd ../frontend

gcloud run deploy election-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --set-env-vars "REACT_APP_API_URL=https://your-backend-url,REACT_APP_FIREBASE_API_KEY=your_key,REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain,REACT_APP_FIREBASE_PROJECT_ID=your_id,REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket,REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender,REACT_APP_FIREBASE_APP_ID=your_app_id,REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id"
```

**Your app is live!** The frontend URL is your main app URL.

---

## Getting Required Credentials

### 1. MongoDB URI (FREE)
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Build a Database" → "Free" tier
3. Create cluster (takes 3-5 minutes)
4. Click "Connect" → "Connect your application"
5. Copy connection string: `mongodb+srv://username:<password>@cluster.xxxxx.mongodb.net/election-db`
6. Replace `<password>` with your database password

### 2. Gemini API Key (FREE)
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Select your Google Cloud project
4. Copy the API key

### 3. Firebase Config (FREE)
1. Go to https://console.firebase.google.com
2. Click "Add project" or select existing
3. Click Settings (gear icon) → Project settings
4. Scroll to "Your apps" → Click Web icon (</>)
5. Register app, copy all config values:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID
   - Measurement ID

---

## Environment Variables Reference

### Backend Environment Variables:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/election-db
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
JWT_SECRET=your-super-secret-random-string-here
PORT=8080
NODE_ENV=production
```

### Frontend Environment Variables:
```
REACT_APP_API_URL=https://election-backend-xxxxx-uc.a.run.app
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## What You'll Get

After successful deployment:

1. **Backend URL**: `https://election-backend-xxxxx-uc.a.run.app`
   - API endpoints for quizzes, articles, chat, etc.
   
2. **Frontend URL**: `https://election-frontend-xxxxx-uc.a.run.app`
   - **This is your main app URL!** Share this with users.

---

## Troubleshooting

### Error: "gcloud: command not found"
**Solution:** Install Google Cloud SDK from https://cloud.google.com/sdk/docs/install

### Error: "Permission denied" or "Unauthenticated"
**Solution:**
```bash
gcloud auth login
gcloud auth application-default login
```

### Error: "API not enabled"
**Solution:**
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Error: "Billing account required"
**Solution:** Enable billing at https://console.cloud.google.com/billing

### Backend deployment fails
**Solution:** Check logs:
```bash
gcloud builds list
gcloud builds log [BUILD_ID]
```

### Frontend can't connect to backend
**Solution:**
1. Verify backend URL is correct
2. Check backend is deployed: `gcloud run services list`
3. Test backend: `curl https://your-backend-url/health`

### Database connection fails
**Solution:**
1. Check MongoDB URI is correct
2. In MongoDB Atlas, go to Network Access
3. Add IP: `0.0.0.0/0` (allow all) for Cloud Run

---

## Cost Estimate

### Google Cloud Run FREE TIER:
- 2 million requests/month
- 360,000 GB-seconds memory
- 180,000 vCPU-seconds
- 1 GB network egress

**Your app will stay FREE** unless you get massive traffic (thousands of users daily).

### MongoDB Atlas FREE TIER:
- 512 MB storage
- Shared RAM
- Good for development and small apps

### Firebase FREE TIER:
- 10K authentications/month
- 1 GB storage
- 10 GB/month transfer

**Total Cost: $0/month** for normal usage! 🎉

---

## Auto-Deploy on Git Push (Optional)

Set up automatic deployment when you push to GitHub:

```bash
gcloud builds triggers create github \
  --repo-name=election-education-ai \
  --repo-owner=Swayam2706 \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

Now every push to `main` branch auto-deploys! 🚀

---

## Useful Commands

### View logs:
```bash
# Backend logs
gcloud run services logs read election-backend --region us-central1

# Frontend logs
gcloud run services logs read election-frontend --region us-central1
```

### Update environment variables:
```bash
gcloud run services update election-backend \
  --region us-central1 \
  --update-env-vars "NEW_VAR=value"
```

### Delete services:
```bash
gcloud run services delete election-backend --region us-central1
gcloud run services delete election-frontend --region us-central1
```

### Check service status:
```bash
gcloud run services describe election-backend --region us-central1
```

---

## Next Steps After Deployment

1. ✅ Test your app at the frontend URL
2. ✅ Register a test user
3. ✅ Try all features (quizzes, chat, articles)
4. ✅ Check Firebase Analytics
5. ✅ Set up custom domain (optional)
6. ✅ Configure Cloud CDN (optional)
7. ✅ Set up monitoring alerts (optional)

---

## Support & Resources

- **Google Cloud Run Docs**: https://cloud.google.com/run/docs
- **Cloud Run Pricing**: https://cloud.google.com/run/pricing
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Firebase Docs**: https://firebase.google.com/docs

---

**Your Election Education AI app is now live on Google Cloud Run! 🎉**

Share your frontend URL with users and start educating people about Indian elections!
