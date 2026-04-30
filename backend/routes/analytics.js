const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Track analytics event (fire and forget)
router.post('/track', optionalAuth, async (req, res) => {
  try {
    const { eventType, eventData } = req.body;
    
    // Log event to analytics service
    logger.info('Analytics Event', {
      eventType,
      eventData,
      userId: req.user?.userId || 'anonymous',
      timestamp: new Date().toISOString()
    });

    // Respond immediately - don't block the client
    res.status(200).json({ success: true });
  } catch (error) {
    // Don't fail - analytics shouldn't break the app
    res.status(200).json({ success: true });
  }
});

// Get real-time stats
router.get('/stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const Quiz = require('../models/Quiz');
    const Content = require('../models/Content');
    const QuizAttempt = require('../models/QuizAttempt');

    const [totalUsers, totalQuizzes, totalContent, totalAttempts] = await Promise.all([
      User.countDocuments(),
      Quiz.countDocuments({ isActive: true }),
      Content.countDocuments({ isPublished: true }),
      QuizAttempt.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalQuizzes,
        totalContent,
        totalAttempts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

// Get user analytics
router.get('/user', authenticate, async (req, res) => {
  try {
    const User = require('../models/User');
    const QuizAttempt = require('../models/QuizAttempt');
    const Chat = require('../models/Chat');

    const user = await User.findById(req.user.userId);
    
    const recentQuizzes = await QuizAttempt.find({ user: req.user.userId })
      .populate('quiz', 'title category')
      .sort({ createdAt: -1 })
      .limit(5);

    const quizStats = await QuizAttempt.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          bestScore: { $max: '$percentage' },
          totalTimeSpent: { $sum: '$timeSpent' }
        }
      }
    ]);

    const chatCount = await Chat.countDocuments({ user: req.user.userId });

    const analytics = {
      user: {
        name: user.name,
        joinDate: user.createdAt,
        stats: user.stats
      },
      quizzes: {
        totalAttempts: quizStats[0]?.totalAttempts || 0,
        averageScore: Math.round(quizStats[0]?.averageScore || 0),
        bestScore: quizStats[0]?.bestScore || 0,
        totalTimeSpent: quizStats[0]?.totalTimeSpent || 0,
        recent: recentQuizzes
      },
      chats: {
        totalConversations: chatCount
      }
    };

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard recommendations
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const User = require('../models/User');
    const Quiz = require('../models/Quiz');
    const Content = require('../models/Content');
    const QuizAttempt = require('../models/QuizAttempt');

    const user = await User.findById(req.user.userId);
    
    // Get user's quiz history to recommend similar content
    const userQuizzes = await QuizAttempt.find({ user: req.user.userId })
      .populate('quiz', 'category difficulty')
      .limit(10);

    const categories = [...new Set(userQuizzes.map(attempt => attempt.quiz.category))];
    
    // Recommend quizzes
    const recommendedQuizzes = await Quiz.find({
      isActive: true,
      category: { $in: categories.length > 0 ? categories : ['voting-basics'] },
      _id: { $nin: userQuizzes.map(attempt => attempt.quiz._id) }
    }).limit(3);

    // Recommend content
    const recommendedContent = await Content.find({
      isPublished: true,
      category: { $in: categories.length > 0 ? categories : ['voting-basics'] }
    }).limit(3);

    const recommendations = {
      quizzes: recommendedQuizzes,
      content: recommendedContent,
      nextSteps: [
        'Complete your voter registration',
        'Learn about upcoming elections',
        'Practice with more quizzes',
        'Share knowledge with friends'
      ]
    };

    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;