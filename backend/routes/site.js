const express = require('express');
const SiteSettings = require('../models/SiteSettings');

const router = express.Router();

// Get site statistics
router.get('/stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const Quiz = require('../models/Quiz');
    const Content = require('../models/Content');
    const QuizAttempt = require('../models/QuizAttempt');

    const [totalUsers, totalQuizzes, totalContent, totalQuizAttempts] = await Promise.all([
      User.countDocuments(),
      Quiz.countDocuments({ isActive: true }),
      Content.countDocuments({ isPublished: true }),
      QuizAttempt.countDocuments()
    ]);

    const averageScoreResult = await QuizAttempt.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
    ]);

    const stats = {
      totalUsers,
      totalQuizzes,
      totalContent,
      totalArticles: totalContent, // Alias for compatibility
      totalQuizAttempts,
      averageQuizScore: Math.round(averageScoreResult[0]?.avgScore || 0),
      totalViews: totalContent * 150 // Mock data for now
    };

    res.json({ 
      success: true,
      data: stats 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

// Get site settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await SiteSettings.find({ isPublic: true });
    
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json({ settings: settingsObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get navigation links
router.get('/navigation', async (req, res) => {
  try {
    const navigation = [
      { label: 'Home', href: '/', active: false },
      { label: 'Learn', href: '/learn', active: false },
      { label: 'Quiz', href: '/quiz', active: false },
      { label: 'Timeline', href: '/timeline', active: false },
      { label: 'Chat', href: '/chat', active: false },
      { label: 'Eligibility', href: '/eligibility', active: false },
      { label: 'FAQ', href: '/faq', active: false }
    ];

    res.json({ navigation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get footer sections
router.get('/footer', async (req, res) => {
  try {
    const footer = {
      sections: [
        {
          title: 'Learn',
          links: [
            { label: 'Articles', href: '/learn' },
            { label: 'Quizzes', href: '/quiz' },
            { label: 'Timeline', href: '/timeline' },
            { label: 'FAQ', href: '/faq' }
          ]
        },
        {
          title: 'Tools',
          links: [
            { label: 'AI Assistant', href: '/chat' },
            { label: 'Eligibility Check', href: '/eligibility' },
            { label: 'Dashboard', href: '/dashboard' }
          ]
        },
        {
          title: 'Support',
          links: [
            { label: 'Contact', href: '/contact' },
            { label: 'About', href: '/about' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' }
          ]
        }
      ],
      social: [
        { platform: 'Twitter', url: 'https://twitter.com/electedu', icon: 'twitter' },
        { platform: 'Facebook', url: 'https://facebook.com/electedu', icon: 'facebook' },
        { platform: 'Instagram', url: 'https://instagram.com/electedu', icon: 'instagram' }
      ],
      newsletter: {
        title: 'Stay Informed',
        description: 'Get the latest election updates and civic education content.',
        placeholder: 'Enter your email'
      }
    };

    res.json({ footer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chat suggestions
router.get('/chat-suggestions', async (req, res) => {
  try {
    const suggestions = [
      'How do I register to vote?',
      'What documents do I need to vote?',
      'When is the next election?',
      'How does the electoral college work?',
      'What are the different types of elections?',
      'How can I find my polling location?'
    ];

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get feature cards for homepage
router.get('/features', async (req, res) => {
  try {
    const features = [
      {
        title: 'AI-Powered Learning',
        description: 'Get personalized answers to your election questions with our intelligent chatbot.',
        icon: 'bot',
        href: '/chat'
      },
      {
        title: 'Interactive Quizzes',
        description: 'Test your knowledge with engaging quizzes on voting, elections, and democracy.',
        icon: 'quiz',
        href: '/quiz'
      },
      {
        title: 'Election Timeline',
        description: 'Stay updated with important dates and deadlines for upcoming elections.',
        icon: 'calendar',
        href: '/timeline'
      },
      {
        title: 'Eligibility Checker',
        description: 'Find out if you\'re eligible to vote and what steps you need to take.',
        icon: 'check',
        href: '/eligibility'
      }
    ];

    res.json({ features });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;