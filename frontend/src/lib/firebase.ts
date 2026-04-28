import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, Analytics, logEvent } from 'firebase/analytics';
import { getPerformance, trace, Performance } from 'firebase/performance';
import { logger } from '../utils/logger';

const firebaseConfig = {
  apiKey: "AIzaSyB0-pGjIEZQM1p-rT-np3pBJeRajKYJxP4",
  authDomain: "electioneducation-c8ea3.firebaseapp.com",
  projectId: "electioneducation-c8ea3",
  storageBucket: "electioneducation-c8ea3.firebasestorage.app",
  messagingSenderId: "173580043913",
  appId: "1:173580043913:web:48508d94c0ef6b5ba92858",
  measurementId: "G-38G1QNP6H7",
};

let app: FirebaseApp;
let auth: Auth;
let analytics: Analytics | null = null;
let performance: Performance | null = null;
let googleProvider: GoogleAuthProvider;

// Initialize Firebase
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Configure Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Set language and initialize analytics & performance
    if (typeof window !== 'undefined') {
      auth.useDeviceLanguage();
      
      if (firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
        performance = getPerformance(app);
        
        // Log app initialization
        logEvent(analytics, 'app_initialized');
      }
    }
    
    logger.info('✅ Firebase initialized successfully with Analytics and Performance Monitoring');
  } catch (error) {
    logger.error('❌ Firebase initialization error:', error);
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
}

// Performance monitoring helper
export const measurePerformance = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  if (!performance) return fn();
  
  const t = trace(performance, name);
  t.start();
  try {
    const result = await fn();
    t.stop();
    return result;
  } catch (error) {
    t.stop();
    throw error;
  }
};

// Analytics helper
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};

export { app, auth, analytics, performance, googleProvider };
