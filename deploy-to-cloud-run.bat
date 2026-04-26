@echo off
REM Simple Google Cloud Run Deployment Script for Windows
REM This script deploys both backend and frontend to Google Cloud Run

echo.
echo ========================================
echo   Google Cloud Run Deployment
echo ========================================
echo.

REM Check if gcloud is installed
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Google Cloud SDK not found!
    echo Please install it from: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Get project ID
set /p PROJECT_ID="Enter your Google Cloud Project ID: "
gcloud config set project %PROJECT_ID%

REM Get region
set /p REGION="Enter region (press Enter for us-central1): "
if "%REGION%"=="" set REGION=us-central1

REM Get MongoDB URI
set /p MONGODB_URI="Enter your MongoDB URI: "

REM Get Gemini API Key
set /p GEMINI_API_KEY="Enter your Gemini API Key: "

REM Get JWT Secret
set /p JWT_SECRET="Enter JWT Secret (or press Enter to auto-generate): "
if "%JWT_SECRET%"=="" set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

REM Get Firebase Config
set /p FIREBASE_API_KEY="Enter Firebase API Key: "
set /p FIREBASE_AUTH_DOMAIN="Enter Firebase Auth Domain: "
set /p FIREBASE_PROJECT_ID="Enter Firebase Project ID: "
set /p FIREBASE_STORAGE_BUCKET="Enter Firebase Storage Bucket: "
set /p FIREBASE_MESSAGING_SENDER_ID="Enter Firebase Messaging Sender ID: "
set /p FIREBASE_APP_ID="Enter Firebase App ID: "
set /p FIREBASE_MEASUREMENT_ID="Enter Firebase Measurement ID: "

echo.
echo Enabling required Google Cloud APIs...
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com

echo.
echo ========================================
echo   Deploying Backend to Cloud Run
echo ========================================
echo.

cd backend

gcloud run deploy election-backend --source . --platform managed --region %REGION% --allow-unauthenticated --memory 512Mi --cpu 1 --min-instances 0 --max-instances 10 --timeout 300 --set-env-vars "MONGODB_URI=%MONGODB_URI%,GEMINI_API_KEY=%GEMINI_API_KEY%,JWT_SECRET=%JWT_SECRET%,PORT=8080,NODE_ENV=production"

REM Get backend URL
for /f "tokens=*" %%i in ('gcloud run services describe election-backend --region %REGION% --format "value(status.url)"') do set BACKEND_URL=%%i

echo.
echo Backend deployed at: %BACKEND_URL%

echo.
echo Seeding database...
set MONGODB_URI=%MONGODB_URI%
node scripts/seed-india.js

cd ..

echo.
echo ========================================
echo   Deploying Frontend to Cloud Run
echo ========================================
echo.

cd frontend

gcloud run deploy election-frontend --source . --platform managed --region %REGION% --allow-unauthenticated --memory 256Mi --cpu 1 --min-instances 0 --max-instances 10 --set-env-vars "REACT_APP_API_URL=%BACKEND_URL%,REACT_APP_FIREBASE_API_KEY=%FIREBASE_API_KEY%,REACT_APP_FIREBASE_AUTH_DOMAIN=%FIREBASE_AUTH_DOMAIN%,REACT_APP_FIREBASE_PROJECT_ID=%FIREBASE_PROJECT_ID%,REACT_APP_FIREBASE_STORAGE_BUCKET=%FIREBASE_STORAGE_BUCKET%,REACT_APP_FIREBASE_MESSAGING_SENDER_ID=%FIREBASE_MESSAGING_SENDER_ID%,REACT_APP_FIREBASE_APP_ID=%FIREBASE_APP_ID%,REACT_APP_FIREBASE_MEASUREMENT_ID=%FIREBASE_MEASUREMENT_ID%"

REM Get frontend URL
for /f "tokens=*" %%i in ('gcloud run services describe election-frontend --region %REGION% --format "value(status.url)"') do set FRONTEND_URL=%%i

cd ..

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Frontend URL: %FRONTEND_URL%
echo Backend URL: %BACKEND_URL%
echo.
echo Your Election Education AI app is now live on Google Cloud Run!
echo.
pause
