import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  BarChart3, 
  Check,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth, googleProvider } from '../lib/firebase';

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const perks = [
  'AI-powered election assistant',
  'Interactive quizzes & certificates',
  'Personalized learning dashboard',
  'Multi-language support',
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const isGoogleAuthAvailable = auth && googleProvider;

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
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
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    clearError();
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await signUpWithEmail(formData.email, formData.password, formData.name);
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in the context
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in the context
    }
  };

  const passwordRequirements = [
    { text: 'At least 6 characters', met: formData.password.length >= 6 },
    { text: 'Contains letters', met: /[a-zA-Z]/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen flex gradient-hero">
      {/* Left panel - desktop only */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-1/2">
        <Link to="/" className="flex items-center gap-2.5 mb-12">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">
            <span className="text-primary">Elect</span><span className="text-foreground">Edu</span>
          </span>
        </Link>
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Start your civic<br /><span className="text-primary">education journey</span>
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Join thousands of citizens learning about democracy, elections, and their voting rights.
        </p>
        <ul className="space-y-3">
          {perks.map((perk) => (
            <li key={perk} className="flex items-center gap-3 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="card p-8">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to home
            </Link>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
              <p className="text-muted-foreground text-sm">Free forever. No credit card required.</p>
            </div>

            {/* Google Sign Up Button */}
            {isGoogleAuthAvailable && (
              <button
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full h-12 rounded-xl border border-border bg-background hover:bg-accent text-foreground font-medium gap-3 mb-6 flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {isLoading ? 'Creating account...' : 'Sign up with Google'}
              </button>
            )}

            {/* Toggle Email Form */}
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
                  Sign up with email instead
                </button>
              </>
            ) : (
              <>
                {/* Divider */}
                {isGoogleAuthAvailable && (
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or create with email</span>
                    </div>
                  </div>
                )}

                {/* Show message if Google auth is not available */}
                {!isGoogleAuthAvailable && (
                  <div className="mb-6 text-center">
                    <p className="text-sm text-muted-foreground">Create your account with email and password</p>
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
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-foreground block mb-1">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`input pl-10 h-12 w-full ${
                          formErrors.name ? 'border-destructive focus:border-destructive' : ''
                        }`}
                        placeholder="Enter your full name"
                        disabled={isLoading}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-destructive">{formErrors.name}</p>
                    )}
                  </div>

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
                        placeholder="Create a password"
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
                    
                    {/* Password Requirements */}
                    {formData.password && (
                      <div className="mt-2 space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <Check className={`w-3 h-3 ${req.met ? 'text-green-500' : 'text-muted-foreground'}`} />
                            <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground block mb-1">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`input pl-10 h-12 w-full ${
                          formErrors.confirmPassword ? 'border-destructive focus:border-destructive' : ''
                        }`}
                        placeholder="Confirm your password"
                        disabled={isLoading}
                      />
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-destructive">{formErrors.confirmPassword}</p>
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
                        Create Account
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="hover:text-primary">Terms</Link> and{' '}
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}