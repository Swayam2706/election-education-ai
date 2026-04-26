// Configuration management for backend
class ConfigManager {
  constructor() {
    this.config = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      
      server: {
        port: parseInt(process.env.PORT) || 5001,
        host: process.env.HOST || 'localhost',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
        trustProxy: process.env.TRUST_PROXY === 'true',
      },

      database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/election_education',
        options: {},
      },

      auth: {
        jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
        jwtExpire: process.env.JWT_EXPIRE || '7d',
      },

      firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        clientId: process.env.FIREBASE_CLIENT_ID,
        authUri: process.env.FIREBASE_AUTH_URI,
        tokenUri: process.env.FIREBASE_TOKEN_URI,
        enabled: !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY),
      },

      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
        max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
        skipSuccessfulRequests: false,
      },

      performance: {
        requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
        bodyLimit: process.env.BODY_LIMIT || '10mb',
        compression: true,
        compressionLevel: 6,
      },

      security: {
        helmet: {
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", "https:"],
              scriptSrc: ["'self'", "'unsafe-eval'"],
              imgSrc: ["'self'", "data:", "https:"],
              connectSrc: ["'self'", "https:"],
              fontSrc: ["'self'", "https:"],
            },
          },
          crossOriginEmbedderPolicy: false,
          crossOriginOpenerPolicy: false, // Allow Firebase popups
        },
      },

      features: {
        chatbot: !!(process.env.GEMINI_API_KEY),
        analytics: true,
        firebase: !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY),
      },
    };
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  isDevelopment() {
    return this.config.NODE_ENV === 'development';
  }

  isProduction() {
    return this.config.NODE_ENV === 'production';
  }

  getJWTConfig() {
    return {
      secret: this.config.auth.jwtSecret,
      expiresIn: this.config.auth.jwtExpire,
    };
  }

  getFirebaseConfig() {
    if (!this.config.firebase.enabled) {
      return null;
    }

    return {
      projectId: this.config.firebase.projectId,
      privateKeyId: this.config.firebase.privateKeyId,
      privateKey: this.config.firebase.privateKey,
      clientEmail: this.config.firebase.clientEmail,
      clientId: this.config.firebase.clientId,
      authUri: this.config.firebase.authUri,
      tokenUri: this.config.firebase.tokenUri,
    };
  }

  getRateLimitConfig() {
    return this.config.rateLimit;
  }

  getSecurityConfig() {
    return this.config.security;
  }

  isFeatureEnabled(feature) {
    return this.config.features?.[feature] === true;
  }

  getPerformanceConfig() {
    return this.config.performance;
  }
}

const config = new ConfigManager();
module.exports = config;