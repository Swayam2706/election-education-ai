// Zod Validation Schemas - Enterprise Grade
const { z } = require('zod');

// Common schemas
const emailSchema = z.string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .trim();

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

const mongoIdSchema = z.string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// Auth schemas
const authSchemas = {
  register: z.object({
    body: z.object({
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string(),
      name: nameSchema
    }).refine(data => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    })
  }),

  login: z.object({
    body: z.object({
      email: emailSchema,
      password: z.string().min(1, 'Password is required')
    })
  }),

  firebaseSync: z.object({
    body: z.object({
      firebaseUid: z.string().min(1, 'Firebase UID is required'),
      email: emailSchema,
      name: nameSchema.optional(),
      image: z.string().url('Invalid image URL').optional(),
      token: z.string().min(1, 'Firebase token is required')
    })
  }),

  updateProfile: z.object({
    body: z.object({
      name: nameSchema.optional(),
      image: z.string().url('Invalid image URL').optional().nullable(),
      preferences: z.object({
        language: z.enum(['en', 'es', 'fr', 'de', 'hi']).optional(),
        theme: z.enum(['light', 'dark', 'system']).optional(),
        notifications: z.boolean().optional()
      }).optional()
    })
  }),

  changePassword: z.object({
    body: z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: passwordSchema,
      confirmPassword: z.string()
    }).refine(data => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    })
  }),

  checkEmail: z.object({
    body: z.object({
      email: emailSchema
    })
  })
};

// Chat schemas
const chatSchemas = {
  sendMessage: z.object({
    body: z.object({
      message: z.string()
        .min(1, 'Message cannot be empty')
        .max(5000, 'Message must not exceed 5000 characters')
        .trim(),
      chatId: mongoIdSchema.optional()
    })
  }),

  getSession: z.object({
    params: z.object({
      sessionId: mongoIdSchema
    })
  }),

  deleteSession: z.object({
    params: z.object({
      sessionId: mongoIdSchema
    })
  })
};

// Quiz schemas
const quizSchemas = {
  submitAnswer: z.object({
    body: z.object({
      quizId: mongoIdSchema,
      questionIndex: z.number().int().min(0),
      selectedAnswer: z.number().int().min(0).max(3),
      timeSpent: z.number().int().min(0).optional()
    })
  }),

  getQuiz: z.object({
    params: z.object({
      id: mongoIdSchema
    })
  }),

  createAttempt: z.object({
    body: z.object({
      quizId: mongoIdSchema
    })
  })
};

// Content schemas
const contentSchemas = {
  getContent: z.object({
    params: z.object({
      id: mongoIdSchema
    })
  }),

  listContent: z.object({
    query: z.object({
      category: z.string().optional(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional()
    })
  })
};

// Admin schemas
const adminSchemas = {
  createContent: z.object({
    body: z.object({
      title: z.string().min(5).max(200),
      description: z.string().min(10).max(500),
      content: z.string().min(50),
      category: z.string().min(2).max(50),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
      tags: z.array(z.string()).optional(),
      image: z.string().url().optional()
    })
  }),

  updateContent: z.object({
    params: z.object({
      id: mongoIdSchema
    }),
    body: z.object({
      title: z.string().min(5).max(200).optional(),
      description: z.string().min(10).max(500).optional(),
      content: z.string().min(50).optional(),
      category: z.string().min(2).max(50).optional(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      tags: z.array(z.string()).optional(),
      image: z.string().url().optional(),
      isPublished: z.boolean().optional()
    })
  }),

  deleteContent: z.object({
    params: z.object({
      id: mongoIdSchema
    })
  })
};

// FAQ schemas
const faqSchemas = {
  getFAQ: z.object({
    params: z.object({
      id: mongoIdSchema
    })
  }),

  listFAQs: z.object({
    query: z.object({
      category: z.string().optional(),
      search: z.string().max(200).optional()
    })
  })
};

// Timeline schemas
const timelineSchemas = {
  getTimeline: z.object({
    params: z.object({
      id: mongoIdSchema
    })
  }),

  listTimelines: z.object({
    query: z.object({
      country: z.string().optional(),
      year: z.string().regex(/^\d{4}$/).optional()
    })
  })
};

// Eligibility schemas
const eligibilitySchemas = {
  checkEligibility: z.object({
    body: z.object({
      dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
      citizenship: z.string().min(2).max(50),
      state: z.string().min(2).max(50).optional(),
      registrationStatus: z.enum(['registered', 'not_registered', 'unknown']).optional()
    })
  })
};

module.exports = {
  authSchemas,
  chatSchemas,
  quizSchemas,
  contentSchemas,
  adminSchemas,
  faqSchemas,
  timelineSchemas,
  eligibilitySchemas
};
