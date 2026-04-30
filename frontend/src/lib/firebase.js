import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getPerformance, trace } from 'firebase/performance';

const firebaseConfig = {
  apiKey: "AIzaSyB0-pGjIEZQM1p-rT-np3pBJeRajKYJxP4",
  authDomain: "electioneducation-c8ea3.firebaseapp.com",
  projectId: "electioneducation-c8ea3",
  storageBucket: "electioneducation-c8ea3.firebasestorage.app",
  messagingSenderId: "173580043913",
  appId: "1:173580043913:web:48508d94c0ef6b5ba92858",
  measurementId: "G-38G1QNP6H7",
};

let app = null;
let auth = null;
let analytics = null;
let performance = null;
let googleProvider = null;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);

  // Initialize Google Auth Provider
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.setCustomParameters({
    prompt: 'select_account',
    hd: undefined // Allow any domain
  });

  // Set language
  if (typeof window !== 'undefined') {
    auth.useDeviceLanguage();
    
    if (firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
      performance = getPerformance(app);
      
      // Log app initialization
      logEvent(analytics, 'app_initialized');
    }
  }
  
  if (typeof window !== 'undefined') {
    import('./logger').then(({ logger }) => {
      logger.info('Firebase initialized successfully with Analytics and Performance Monitoring');
    });
  }
} catch (error) {
  if (typeof window !== 'undefined') {
    import('./logger').then(({ logger }) => {
      logger.error('Firebase initialization error', error);
    });
  }
  auth = null;
  googleProvider = null;
}

// Performance monitoring helper
export const measurePerformance = async (name, fn) => {
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
export const trackEvent = (eventName, params) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};

export { app, auth, analytics, performance, googleProvider };
export default app;