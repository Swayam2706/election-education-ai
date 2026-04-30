/**
 * Environment Variable Validation
 * Ensures all required environment variables are present and valid
 */

import { logger } from '../utils/logger';

/**
 * Required environment variables
 */
const REQUIRED_ENV_VARS = [
  'REACT_APP_API_URL',
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
] as const;

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS = {
  REACT_APP_FIREBASE_MEASUREMENT_ID: '',
  REACT_APP_ENABLE_ANALYTICS: 'true',
  REACT_APP_ENABLE_PERFORMANCE: 'true',
  REACT_APP_LOG_LEVEL: 'info',
} as const;

/**
 * Environment variable validation result
 */
interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validates all required environment variables
 * @returns Validation result
 */
export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    
    if (!value || value.trim() === '') {
      missing.push(varName);
      logger.error('Missing required environment variable', { varName });
    }
  }

  // Check optional variables
  for (const [varName, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
    const value = process.env[varName];
    
    if (!value || value.trim() === '') {
      warnings.push(`${varName} not set, using default: ${defaultValue}`);
      logger.warn('Optional environment variable not set', { varName, defaultValue });
    }
  }

  // Validate API URL format
  const apiUrl = process.env.REACT_APP_API_URL;
  if (apiUrl && !isValidUrl(apiUrl)) {
    warnings.push('REACT_APP_API_URL may not be a valid URL');
    logger.warn('Invalid API URL format', { apiUrl });
  }

  // Validate Firebase config
  const firebaseProjectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
  if (firebaseProjectId && !/^[a-z0-9-]+$/.test(firebaseProjectId)) {
    warnings.push('REACT_APP_FIREBASE_PROJECT_ID has invalid format');
    logger.warn('Invalid Firebase project ID format', { firebaseProjectId });
  }

  const valid = missing.length === 0;

  if (!valid) {
    logger.error('Environment validation failed', { missing, warnings });
  } else if (warnings.length > 0) {
    logger.warn('Environment validation passed with warnings', { warnings });
  } else {
    logger.info('Environment validation passed');
  }

  return { valid, missing, warnings };
}

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns True if valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets environment variable with fallback
 * @param key - Environment variable key
 * @param fallback - Fallback value
 * @returns Environment variable value or fallback
 */
export function getEnvVar(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

/**
 * Checks if running in production
 * @returns True if production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Checks if running in development
 * @returns True if development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Checks if running in test
 * @returns True if test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Gets application configuration from environment
 * @returns Application configuration object
 */
export function getAppConfig() {
  return {
    apiUrl: getEnvVar('REACT_APP_API_URL', 'http://localhost:5001/api'),
    firebase: {
      apiKey: getEnvVar('REACT_APP_FIREBASE_API_KEY'),
      authDomain: getEnvVar('REACT_APP_FIREBASE_AUTH_DOMAIN'),
      projectId: getEnvVar('REACT_APP_FIREBASE_PROJECT_ID'),
      storageBucket: getEnvVar('REACT_APP_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getEnvVar('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
      appId: getEnvVar('REACT_APP_FIREBASE_APP_ID'),
      measurementId: getEnvVar('REACT_APP_FIREBASE_MEASUREMENT_ID'),
    },
    features: {
      analytics: getEnvVar('REACT_APP_ENABLE_ANALYTICS', 'true') === 'true',
      performance: getEnvVar('REACT_APP_ENABLE_PERFORMANCE', 'true') === 'true',
    },
    logging: {
      level: getEnvVar('REACT_APP_LOG_LEVEL', 'info'),
    },
  };
}

// Validate environment on module load
if (!isTest()) {
  const result = validateEnvironment();
  
  if (!result.valid) {
    console.error('❌ Environment validation failed!');
    console.error('Missing variables:', result.missing);
    
    if (isProduction()) {
      throw new Error('Required environment variables are missing. Application cannot start.');
    }
  }
}

export default {
  validate: validateEnvironment,
  getEnvVar,
  getAppConfig,
  isProduction,
  isDevelopment,
  isTest,
};
