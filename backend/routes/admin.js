const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Content = require('../models/Content');
const Timeline = require('../models/Timeline');
const FAQ = require('../models/FAQ');
const SiteSettings = require('../models/SiteSettings');

const router = express.Router();

// Apply admin authorization to all routes
router.use(authenticate);
router.use(authorize('ADMIN'));

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      quizzes: await Quiz.countDocuments(),
      content: await Content.countDocuments(),
      timeline: await Timeline.countDocuments(),
      faqs: await FAQ.countDocuments()
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Content management
router.get('/content', async (req, res) => {
  try {
    const content = await Content.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/content', async (req, res) => {
  try {
    const content = new Content(req.body);
    await content.save();
    res.status(201).json({ message: 'Content created successfully', content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/content/:id', async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({ message: 'Content updated successfully', content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/content/:id', async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Quiz management
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/quizzes', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Site settings management
router.get('/settings', async (req, res) => {
  try {
    const settings = await SiteSettings.find().sort({ category: 1, key: 1 });
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const { key, value, type, description, category, isPublic } = req.body;
    
    const setting = await SiteSettings.findOneAndUpdate(
      { key },
      { value, type, description, category, isPublic },
      { upsert: true, new: true }
    );

    res.json({ message: 'Setting updated successfully', setting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;