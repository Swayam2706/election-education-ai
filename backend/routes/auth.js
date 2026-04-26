const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, authValidation, sanitizeInput } = require('../middleware/validation');
const { asyncHandler, AuthenticationError, ConflictError } = require('../utils/errors');
const { logger } = require('../utils/logger');
const config = require('../utils/config');

const router = express.Router();

// Initialize Firebase Admin only if credentials are provided
let admin = null;
try {
  const firebaseConfig = config.getFirebaseConfig();
  if (firebaseConfig) {
    admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig)
      });
    }
    logger.info('Firebase Admin SDK initialized');
  }
} catch (error) {
  logger.warn('Firebase Admin not initialized', { error: error.message });
  admin = null;
}

const generateToken = (userId, email, role) => {
  const jwtConfig = config.getJWTConfig();
  return jwt.sign(
    { userId, email, role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
};

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Register with email/password
router.post('/register', 
  validate(authValidation.register), 
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User already exists with this email');
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = generateToken(user._id, user.email, user.role);

    logger.auth('User registered', user._id, { 
      email: user.email,
      method: 'email',
      ip: req.ip 
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          preferences: user.preferences,
          stats: user.stats
        }
      }
    });
  })
);

// Login with email/password
router.post('/login', 
  validate(authValidation.login), 
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.security('Failed login attempt', {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw new AuthenticationError('Invalid email or password');
    }

    const token = generateToken(user._id, user.email, user.role);

    logger.auth('User logged in', user._id, { 
      email: user.email,
      method: 'email',
      ip: req.ip 
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          preferences: user.preferences,
          stats: user.stats
        }
      }
    });
  })
);

// Firebase sync (for Google auth)
router.post('/firebase-sync', 
  validate(authValidation.firebaseSync), 
  asyncHandler(async (req, res) => {
    if (!admin) {
      return res.status(503).json({
        success: false,
        error: {
          message: 'Google sign-in is not available on this server',
          code: 'FIREBASE_NOT_CONFIGURED'
        }
      });
    }

    const { firebaseUid, email, name, image, token } = req.body;

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (decodedToken.uid !== firebaseUid) {
      throw new AuthenticationError('Invalid Firebase token');
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // Check if user exists with same email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // Link Firebase account to existing user
        existingUser.firebaseUid = firebaseUid;
        existingUser.image = image || existingUser.image;
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new user
        user = new User({
          firebaseUid,
          email,
          name: name || 'User',
          image: image || null,
          role: 'USER'
        });
        await user.save();
      }

      logger.auth('New Firebase user created', user._id, { 
        email: user.email,
        method: 'firebase',
        ip: req.ip 
      });
    } else {
      // Update existing user
      user.name = name || user.name;
      user.image = image || user.image;
      await user.save();

      logger.auth('Firebase user synced', user._id, { 
        email: user.email,
        method: 'firebase',
        ip: req.ip 
      });
    }

    const jwtToken = generateToken(user._id, user.email, user.role);

    res.json({
      success: true,
      message: 'Firebase sync successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          preferences: user.preferences,
          stats: user.stats
        },
        token: jwtToken
      }
    });
  })
);

// Get current user
router.get('/me', 
  authenticate, 
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          preferences: user.preferences,
          stats: user.stats,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  })
);

// Update user profile
router.put('/profile', 
  authenticate,
  validate(authValidation.updateProfile),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const { name, image, preferences } = req.body;

    if (name) user.name = name;
    if (image !== undefined) user.image = image;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    logger.auth('Profile updated', user._id, { 
      changes: Object.keys(req.body),
      ip: req.ip 
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          preferences: user.preferences,
          stats: user.stats
        }
      }
    });
  })
);

// Change password
router.put('/password', 
  authenticate,
  validate(authValidation.changePassword),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Check if user has a password (Firebase users might not)
    if (!user.password) {
      throw new AuthenticationError('Password change not available for this account type');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AuthenticationError('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    logger.auth('Password changed', user._id, { ip: req.ip });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

// Logout (client-side token invalidation)
router.post('/logout', 
  optionalAuth, 
  asyncHandler(async (req, res) => {
    if (req.user) {
      logger.auth('User logged out', req.user.userId, { ip: req.ip });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  })
);

// Refresh token
router.post('/refresh', 
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const token = generateToken(user._id, user.email, user.role);

    res.json({
      success: true,
      data: { token }
    });
  })
);

// Check email availability
router.post('/check-email',
  validate({
    body: Joi.object({
      email: Joi.string().email().required()
    })
  }),
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    const existingUser = await User.findOne({ email });
    
    res.json({
      success: true,
      data: {
        available: !existingUser
      }
    });
  })
);

module.exports = router;