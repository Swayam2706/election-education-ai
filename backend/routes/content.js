const express = require('express');
const Content = require('../models/Content');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get all content
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, featured, limit = 20, page = 1 } = req.query;
    const filter = { isPublished: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (featured === 'true') filter.featured = true;
    
    // Use regex search instead of text search if no text index exists
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Use Promise.all for parallel queries
    const [content, total] = await Promise.all([
      Content.find(filter)
        .select('title slug excerpt category tags difficulty readTime image author views likes featured')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Content.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        content: content || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Content route error', { error });
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

// Get content by slug
router.get('/:slug', async (req, res) => {
  try {
    const content = await Content.findOne({ 
      slug: req.params.slug, 
      isPublished: true 
    });

    if (!content) {
      return res.status(404).json({ 
        success: false,
        error: { message: 'Content not found' }
      });
    }

    // Increment view count
    await Content.findByIdAndUpdate(content._id, { $inc: { views: 1 } });

    res.json({ 
      success: true,
      data: { content }
    });
  } catch (error) {
    logger.error('Content by slug error', { error });
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

// Like content
router.post('/:slug/like', authenticate, async (req, res) => {
  try {
    const content = await Content.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { 'stats.articlesRead': 1 }
    });

    res.json({ 
      success: true,
      data: {
        message: 'Content liked successfully',
        likes: content.likes
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

// Track content view
router.post('/:slug/view', async (req, res) => {
  try {
    const content = await Content.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ 
        success: false,
        error: { message: 'Content not found' }
      });
    }

    res.json({ 
      success: true,
      data: { views: content.views }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

// Get content categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Content.distinct('category', { isPublished: true });
    res.json({ 
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

// Get content categories (legacy)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Content.distinct('category', { isPublished: true });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured content
router.get('/featured/list', async (req, res) => {
  try {
    const content = await Content.find({ 
      isPublished: true, 
      featured: true 
    })
    .select('title slug excerpt category readTime image author views likes')
    .sort({ createdAt: -1 })
    .limit(6);

    res.json({ 
      success: true,
      data: { content }
    });
  } catch (error) {
    logger.error('Featured content error', { error });
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

module.exports = router;