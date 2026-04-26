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
import { optimizedAPI } from './optimized-api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
}

class FirebaseAuthService {
  // Google Sign In
  async signInWithGoogle(): Promise<{ user: AuthUser; token: string }> {
    try {
      console.log('🔄 Starting Google sign-in...');
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('✅ Google sign-in successful:', user.email);
      
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
      console.error('❌ Google sign-in error:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Email/Password Sign In
  async signInWithEmail(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    try {
      console.log('🔄 Starting email sign-in for:', email);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      console.log('✅ Email sign-in successful:', user.email);
      
      const token = await user.getIdToken();
      const backendUser = await this.syncWithBackend(user, token);
      
      localStorage.setItem('token', backendUser.token);
      
      return {
        user: backendUser.user,
        token: backendUser.token
      };
    } catch (error) {
      console.error('❌ Email sign-in error:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Email/Password Sign Up
  async signUpWithEmail(email: string, password: string, name: string): Promise<{ user: AuthUser; token: string }> {
    try {
      console.log('🔄 Starting email sign-up for:', email);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update profile with name
      await updateProfile(user, { displayName: name });
      
      console.log('✅ Email sign-up successful:', user.email);
      
      const token = await user.getIdToken();
      const backendUser = await this.syncWithBackend(user, token);
      
      localStorage.setItem('token', backendUser.token);
      
      return {
        user: backendUser.user,
        token: backendUser.token
      };
    } catch (error) {
      console.error('❌ Email sign-up error:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Password Reset
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent to:', email);
    } catch (error) {
      console.error('❌ Password reset error:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Sync Firebase user with backend
  private async syncWithBackend(firebaseUser: User, token: string): Promise<{ user: AuthUser; token: string }> {
    try {
      const response = await optimizedAPI.post('/auth/firebase-sync', {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        image: firebaseUser.photoURL,
        token
      }) as any;
      
      return response;
    } catch (error) {
      console.error('❌ Backend sync failed:', error);
      throw new Error('Failed to sync user data with server');
    }
  }

  // Handle Firebase auth errors
  private handleAuthError(error: AuthError): Error {
    console.error('Firebase Auth Error:', error.code, error.message);
    
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