const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  readTime: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    default: null
  },
  authorName: {
    type: String,
    default: 'ElectEdu Team'
  },
  authorImage: {
    type: String,
    default: null
  },
  isPublished: {
    type: Boolean,
    default: true,
    index: true
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for author object (for backward compatibility)
contentSchema.virtual('author').get(function() {
  return {
    name: this.authorName,
    image: this.authorImage
  };
});

// Indexes for performance
contentSchema.index({ category: 1, isPublished: 1 });
contentSchema.index({ featured: 1, isPublished: 1 });
contentSchema.index({ createdAt: -1 });
contentSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Content', contentSchema);