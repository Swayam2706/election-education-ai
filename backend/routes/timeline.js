const express = require('express');
const Timeline = require('../models/Timeline');

const router = express.Router();

// Get all timeline events
router.get('/', async (req, res) => {
  try {
    const { category, status, year } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const events = await Timeline.find(filter)
      .sort({ date: 1 });

    res.json({ 
      success: true,
      data: { events }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

// Get timeline event by ID
router.get('/:eventId', async (req, res) => {
  try {
    const event = await Timeline.findOne({ 
      _id: req.params.eventId, 
      isActive: true 
    });

    if (!event) {
      return res.status(404).json({ message: 'Timeline event not found' });
    }

    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming events
router.get('/status/upcoming', async (req, res) => {
  try {
    const events = await Timeline.find({
      isActive: true,
      status: 'upcoming',
      date: { $gte: new Date() }
    })
    .sort({ date: 1 })
    .limit(5);

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current events
router.get('/status/current', async (req, res) => {
  try {
    const events = await Timeline.find({
      isActive: true,
      status: 'current'
    })
    .sort({ date: 1 });

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get timeline categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Timeline.distinct('category', { isActive: true });
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

// Get timeline years
router.get('/years', async (req, res) => {
  try {
    const events = await Timeline.find({ isActive: true }).select('date');
    const years = [...new Set(events.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a);
    
    res.json({ 
      success: true,
      data: { years }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

// Get timeline categories (legacy)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Timeline.distinct('category', { isActive: true });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;