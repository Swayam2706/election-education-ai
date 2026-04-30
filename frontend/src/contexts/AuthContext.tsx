import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useAuth as useAuthStore } from '../store/useAppStore';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

// ── Firebase imports ──────────────────────────────────────────────────────────
import { auth, googleProvider } from '../lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

// ── Context type ──────────────────────────────────────────────────────────────
interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  clearError: () => void;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  checkEmailAvailability: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authStore = useAuthStore();
  // Use a ref so the onAuthStateChanged closure always sees the latest value
  const isAuthenticatedRef = useRef(authStore.isAuthenticated);
  useEffect(() => { isAuthenticatedRef.current = authStore.isAuthenticated; }, [authStore.isAuthenticated]);

  // ── Firebase auth state listener ──────────────────────────────────────────
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !isAuthenticatedRef.current) {
        // User just signed in via Firebase — sync with backend
        try {
          authStore.setAuthLoading(true);
          const token = await firebaseUser.getIdToken();
          await authService.firebaseSync({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || 'User',
            image: firebaseUser.photoURL || undefined,
            token,
          });
        } catch (err: any) {
          if (typeof window !== 'undefined') {
            import('../utils/logger').then(({ logger }) => {
              logger.error('Firebase auth sync failed', err);
            });
          }
          authStore.setAuthError(err.message || 'Authentication sync failed');
          toast.error('Sign-in failed. Please try again.');
        } finally {
          authStore.setAuthLoading(false);
        }
      } else if (!firebaseUser && isAuthenticatedRef.current) {
        authStore.logout();
      }
    });

    return () => unsubscribe();
  }, []); // eslint-disable-line

  // ── Google sign-in ────────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      toast.error('Google sign-in is not available');
      throw new Error('Google sign-in not configured');
    }

    authStore.setAuthLoading(true);
    authStore.setAuthError(null);

    try {
      // Track analytics
      if (typeof window !== 'undefined') {
        const { trackEvent } = await import('../lib/firebase');
        trackEvent('login_attempt', { method: 'google' });
      }

      // signInWithPopup triggers onAuthStateChanged which does the backend sync
      await signInWithPopup(auth, googleProvider);
      
      // Track successful login
      if (typeof window !== 'undefined') {
        const { trackEvent } = await import('../lib/firebase');
        trackEvent('login_success', { method: 'google' });
      }
    } catch (err: any) {
      authStore.setAuthLoading(false);
      
      // Track failed login
      if (typeof window !== 'undefined') {
        const { trackEvent } = await import('../lib/firebase');
        trackEvent('login_failed', { method: 'google', error: err.code });
      }
      
      const msg =
        err.code === 'auth/popup-closed-by-user' ? 'Sign-in cancelled' :
        err.code === 'auth/popup-blocked'         ? 'Popup blocked — please allow popups' :
        err.code === 'auth/network-request-failed'? 'Network error. Check your connection' :
        err.code === 'auth/cancelled-popup-request'? 'Sign-in cancelled' :
        'Failed to sign in with Google';
      authStore.setAuthError(msg);
      toast.error(msg);
      throw err;
    }
  };

  // ── Email sign-in ─────────────────────────────────────────────────────────
  const signInWithEmail = async (email: string, password: string) => {
    authStore.setAuthError(null);
    try {
      if (auth) {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged handles backend sync
        return;
      }
      await authService.login({ email, password });
    } catch (err: any) {
      const msg =
        err.code === 'auth/user-not-found'    ? 'No account found with this email' :
        err.code === 'auth/wrong-password'    ? 'Incorrect password' :
        err.code === 'auth/invalid-credential'? 'Invalid email or password' :
        err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later' :
        err.code === 'auth/user-disabled'     ? 'This account has been disabled' :
        err.response?.data?.error?.message    || 'Invalid email or password';
      authStore.setAuthError(msg);
      throw err;
    }
  };

  // ── Email sign-up ─────────────────────────────────────────────────────────
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    authStore.setAuthError(null);
    try {
      if (auth) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (result.user) {
          await updateProfile(result.user, { displayName: name });
        }
        return;
      }
      await authService.register({ email, password, confirmPassword: password, name });
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use' ? 'An account with this email already exists' :
        err.code === 'auth/weak-password'         ? 'Password must be at least 6 characters' :
        err.code === 'auth/invalid-email'         ? 'Invalid email address' :
        err.response?.data?.error?.message        || 'Failed to create account';
      authStore.setAuthError(msg);
      throw err;
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      if (auth) await signOut(auth);
      await authService.logout();
    } catch (err) {
      if (typeof window !== 'undefined') {
        import('../utils/logger').then(({ logger }) => {
          logger.error('Logout error', err);
        });
      }
      authStore.logout();
    }
  };

  const handleUpdateProfile = async (data: any) => {
    try { 
      await authService.updateProfile(data); 
    } catch (err) { 
      if (typeof window !== 'undefined') {
        import('../utils/logger').then(({ logger }) => {
          logger.error('Profile update error', err);
        });
      }
      throw err; 
    }
  };

  const changePassword = async (data: any) => {
    try { 
      await authService.changePassword(data); 
    } catch (err) { 
      if (typeof window !== 'undefined') {
        import('../utils/logger').then(({ logger }) => {
          logger.error('Password change error', err);
        });
      }
      throw err; 
    }
  };

  const clearError = () => authStore.setAuthError(null);
  const hasRole = (role: string) => authStore.user?.role === role;
  const isAdmin = () => hasRole('ADMIN');
  const checkEmailAvailability = async (email: string) => {
    try { return await authService.checkEmailAvailability(email); }
    catch { return false; }
  };

  return (
    <AuthContext.Provider value={{
      user: authStore.user,
      isAuthenticated: authStore.isAuthenticated,
      isLoading: authStore.isLoading,
      error: authStore.error,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      updateProfile: handleUpdateProfile,
      changePassword,
      clearError,
      hasRole,
      isAdmin,
      checkEmailAvailability,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { useAuthStore };
