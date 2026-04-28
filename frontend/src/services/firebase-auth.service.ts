import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { apiService } from './api.service';
import { logger } from '../utils/logger';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
}

class FirebaseAuthService {
  /**
   * Sign in with Google OAuth provider
   * @returns Promise with authenticated user and token
   * @throws Error if sign-in fails
   */
  async signInWithGoogle(): Promise<{ user: AuthUser; token: string }> {
    try {
      logger.info('Starting Google sign-in...');
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      logger.info('Google sign-in successful', { email: user.email });
      
      // Get Firebase token
      const token = await user.getIdToken();
      
      // Sync with backend
      const backendUser = await this.syncWithBackend(user, token);
      
      // Store token
      localStorage.setItem('token', backendUser.token);
      
      return {
        user: backendUser.user,
        token: backendUser.token
      };
    } catch (error) {
      logger.error('Google sign-in error', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign in with email and password
   * @param email - User email address
   * @param password - User password
   * @returns Promise with authenticated user and token
   * @throws Error if sign-in fails
   */
  async signInWithEmail(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    try {
      logger.info('Starting email sign-in', { email });
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      logger.info('Email sign-in successful', { email: user.email });
      
      const token = await user.getIdToken();
      const backendUser = await this.syncWithBackend(user, token);
      
      localStorage.setItem('token', backendUser.token);
      
      return {
        user: backendUser.user,
        token: backendUser.token
      };
    } catch (error) {
      logger.error('Email sign-in error', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign up with email and password
   * @param email - User email address
   * @param password - User password
   * @param name - User display name
   * @returns Promise with authenticated user and token
   * @throws Error if sign-up fails
   */
  async signUpWithEmail(email: string, password: string, name: string): Promise<{ user: AuthUser; token: string }> {
    try {
      logger.info('Starting email sign-up', { email });
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update profile with name
      await updateProfile(user, { displayName: name });
      
      logger.info('Email sign-up successful', { email: user.email });
      
      const token = await user.getIdToken();
      const backendUser = await this.syncWithBackend(user, token);
      
      localStorage.setItem('token', backendUser.token);
      
      return {
        user: backendUser.user,
        token: backendUser.token
      };
    } catch (error) {
      logger.error('Email sign-up error', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign out the current user
   * @throws Error if sign-out fails
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      logger.info('Sign out successful');
    } catch (error) {
      logger.error('Sign out error', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Send password reset email
   * @param email - User email address
   * @throws Error if password reset fails
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      logger.info('Password reset email sent', { email });
    } catch (error) {
      logger.error('Password reset error', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sync Firebase user with backend database
   * @param firebaseUser - Firebase user object
   * @param token - Firebase ID token
   * @returns Promise with user data and backend token
   * @throws Error if sync fails
   */
  private async syncWithBackend(firebaseUser: User, token: string): Promise<{ user: AuthUser; token: string }> {
    try {
      const response = await apiService.post('/auth/firebase-sync', {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        image: firebaseUser.photoURL,
        token
      }) as any;
      
      return response;
    } catch (error) {
      logger.error('Backend sync failed', error);
      throw new Error('Failed to sync user data with server');
    }
  }

  /**
   * Handle Firebase authentication errors and convert to user-friendly messages
   * @param error - Firebase auth error
   * @returns User-friendly error
   */
  private handleAuthError(error: AuthError): Error {
    logger.error('Firebase Auth Error', { code: error.code, message: error.message });
    
    switch (error.code) {
      case 'auth/user-not-found':
        return new Error('No account found with this email address');
      case 'auth/wrong-password':
        return new Error('Incorrect password');
      case 'auth/email-already-in-use':
        return new Error('An account with this email already exists');
      case 'auth/weak-password':
        return new Error('Password should be at least 6 characters');
      case 'auth/invalid-email':
        return new Error('Invalid email address');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later');
      case 'auth/popup-closed-by-user':
        return new Error('Sign-in cancelled by user');
      case 'auth/popup-blocked':
        return new Error('Popup blocked. Please allow popups and try again');
      case 'auth/cancelled-popup-request':
        return new Error('Sign-in cancelled');
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your connection');
      case 'auth/internal-error':
        return new Error('Internal error. Please try again');
      case 'auth/invalid-api-key':
        return new Error('Firebase configuration error');
      case 'auth/app-not-authorized':
        return new Error('App not authorized for Firebase');
      default:
        return new Error(error.message || 'Authentication failed. Please try again');
    }
  }

  // Get current user token
  async getCurrentUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
}

export const firebaseAuthService = new FirebaseAuthService();