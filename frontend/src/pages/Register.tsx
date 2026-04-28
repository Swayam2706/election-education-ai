import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  AlertCircle, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth, googleProvider } from '../lib/firebase';
import { GoogleSignInButton, EmailSignUpForm } from '../components/auth';

const perks = [
  'AI-powered election assistant',
  'Interactive quizzes & certificates',
  'Personalized learning dashboard',
  'Multi-language support',
];

/**
 * Register Component
 * User registration page with Google OAuth and email/password options
 * @returns Rendered registration page
 */
export default function Register() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, isLoading, error, clearError } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);

  const isGoogleAuthAvailable = auth && googleProvider;

  /**
   * Handle email/password registration
   */
  const handleEmailSignup = async (formData: { email: string; password: string; name: string }) => {
    try {
      await signUpWithEmail(formData.email, formData.password, formData.name);
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in the context
    }
  };

  /**
   * Handle Google OAuth sign-up
   */
  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in the context
    }
  };

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
              <GoogleSignInButton
                onClick={handleGoogleSignup}
                isLoading={isLoading}
                text="Sign up with Google"
              />
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
                <EmailSignUpForm
                  onSubmit={handleEmailSignup}
                  isLoading={isLoading}
                  onBackToGoogle={() => setShowEmailForm(false)}
                  showBackButton={isGoogleAuthAvailable}
                />
              </>
            )}

                {/* Email/Password Form */}
                <EmailSignUpForm
                  onSubmit={handleEmailSignup}
                  isLoading={isLoading}
                  onBackToGoogle={() => setShowEmailForm(false)}
                  showBackButton={isGoogleAuthAvailable}
                />
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