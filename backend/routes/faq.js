const express = require('express');
const FAQ = require('../models/FAQ');

const router = express.Router();

// Get all FAQs
router.get('/', async (req, res) => {
  try {
    const { category, search, q } = req.query;
    const filter = { isPublished: true };

    if (category) filter.category = category;
    
    // Use regex search instead of text search
    if (search || q) {
      const searchTerm = search || q;
      filter.$or = [
        { question: { $regex: searchTerm, $options: 'i' } },
        { answer: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }

    const faqs = await FAQ.find(filter)
      .sort({ order: 1, createdAt: -1 });

    res.json({ 
      success: true,
      data: { faqs }
    });
  } catch (error) {
    console.error('FAQ route error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

// Search FAQs
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json({ 
        success: true,
        data: { faqs: [] }
      });
    }

    const faqs = await FAQ.find({ 
      isPublished: true,
      $or: [
        { question: { $regex: q, $options: 'i' } },
        { answer: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .sort({ order: 1 })
    .limit(20);

    res.json({ 
      success: true,
      data: { faqs }
    });
  } catch (error) {
    console.error('FAQ search error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

// Get FAQ by ID
router.get('/:faqId', async (req, res) => {
  try {
    const faq = await FAQ.findOne({ 
      _id: req.params.faqId, 
      isPublished: true 
    });

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    // Increment view count
    await FAQ.findByIdAndUpdate(faq._id, { $inc: { views: 1 } });

    res.json({ 
      success: true,
      data: { faq }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark FAQ as helpful
router.post('/:faqId/helpful', async (req, res) => {
  try {
    const { helpful } = req.body; // true for helpful, false for not helpful

    const updateField = helpful ? { $inc: { helpful: 1 } } : { $inc: { notHelpful: 1 } };
    
    const faq = await FAQ.findByIdAndUpdate(
      req.params.faqId,
      updateField,
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ 
      message: 'Feedback recorded successfully',
      helpful: faq.helpful,
      notHelpful: faq.notHelpful
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get FAQ categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await FAQ.distinct('category', { isPublished: true });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get popular FAQs
router.get('/popular/list', async (req, res) => {
  try {
    const faqs = await FAQ.find({ isPublished: true })
      .sort({ views: -1, helpful: -1 })
      .limit(10)
      .select('question answer category views helpful');

    res.json({ faqs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;