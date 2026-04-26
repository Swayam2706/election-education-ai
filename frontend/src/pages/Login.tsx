import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

import { useReducedMotion } from '../animations/hooks/useReducedMotion';

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, signInWithGoogle, isLoading, error, clearError, isAuthenticated } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const from = location.state?.from?.pathname || '/dashboard';

  // Navigate once auth state is confirmed (handles async Google sign-in)
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const isGoogleAuthAvailable = true; // Firebase is always configured

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    clearError();
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await signInWithEmail(formData.email, formData.password);
      // navigation handled by useEffect above
    } catch (error) {
      // Error handled in context
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // navigation handled by useEffect above when isAuthenticated becomes true
    } catch (error) {
      // Error handled in context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                <span className="text-primary">Elect</span>
                <span className="text-foreground">Edu</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to continue your learning journey</p>
          </div>

          {/* Google Sign In Button */}
          {isGoogleAuthAvailable && (
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 mb-6 border border-border hover:border-primary/40 hover:bg-accent transition-all duration-200 bg-background text-foreground rounded-lg flex items-center justify-center gap-3 font-medium"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          )}

          {/* Toggle Email Form or Show Email Form Directly */}
          {!showEmailForm && isGoogleAuthAvailable ? (
            <>
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full text-primary hover:text-primary/80 hover:bg-primary/5 py-2 rounded-lg transition-colors"
              >
                Sign in with email instead
              </button>
            </>
          ) : (
            <>
              {/* Divider (only show if Google auth is available) */}
              {isGoogleAuthAvailable && (
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>
              )}

              {/* Show message if Google auth is not available */}
              {!isGoogleAuthAvailable && (
                <div className="mb-6 text-center">
                  <p className="text-sm text-muted-foreground">Sign in with your email and password</p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-foreground block mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`input pl-10 h-12 w-full ${
                        formErrors.email ? 'border-destructive focus:border-destructive' : ''
                      }`}
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-destructive">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="text-sm font-medium text-foreground block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`input pl-10 pr-10 h-12 w-full ${
                        formErrors.password ? 'border-destructive focus:border-destructive' : ''
                      }`}
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-xs text-destructive">{formErrors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  {isGoogleAuthAvailable && (
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Back to Google
                    </button>
                  )}
                  <Link to="/forgot-password" className="text-primary hover:text-primary/80 transition-colors ml-auto">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full h-12 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1">
              Sign up free <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="hover:text-primary">Terms</Link> and{' '}
          <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}