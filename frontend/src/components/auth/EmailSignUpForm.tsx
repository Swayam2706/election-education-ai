/**
 * EmailSignUpForm Component
 * Email/password registration form with validation
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { PasswordRequirements } from './PasswordRequirements';

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

interface EmailSignUpFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  onBackToGoogle?: () => void;
  showBackButton?: boolean;
}

/**
 * EmailSignUpForm - Form for email/password registration
 * @param props - Component props
 * @returns Rendered sign-up form
 */
export const EmailSignUpForm: React.FC<EmailSignUpFormProps> = ({
  onSubmit,
  isLoading,
  onBackToGoogle,
  showBackButton = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <PasswordRequirements password={formData.password} />
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

      {showBackButton && onBackToGoogle && (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onBackToGoogle}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Google
          </button>
        </div>
      )}

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
  );
};

export default EmailSignUpForm;
