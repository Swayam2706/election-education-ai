const express = require('express');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../utils/errors');
const { logger } = require('../utils/logger');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Content = require('../models/Content');
const Timeline = require('../models/Timeline');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', 
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' }
      });
    }

    // Get total counts
    const [totalUsers, totalQuizzes, totalContent] = await Promise.all([
      User.countDocuments(),
      Quiz.countDocuments({ isActive: true }),
      Content.countDocuments({ isPublished: true })
    ]);

    // Get user's quiz attempts
    const userAttempts = await QuizAttempt.find({ user: userId })
      .populate('quiz', 'title difficulty timeLimit')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get user's recent content views (mock data for now)
    const recentActivity = [
      ...userAttempts.map(attempt => ({
        id: attempt._id,
        type: 'quiz',
        title: attempt.quiz?.title || 'Quiz',
        timestamp: attempt.createdAt,
        score: attempt.score
      }))
    ].slice(0, 5);

    // Get user rank (simplified calculation)
    const usersWithHigherScores = await User.countDocuments({
      'stats.totalScore': { $gt: user.stats.totalScore }
    });
    const userRank = usersWithHigherScores + 1;

    // Get recommendations based on user progress
    const recommendations = await getRecommendations(user);

    // Get upcoming timeline events
    const upcomingEvents = await Timeline.find({
      date: { $gte: new Date() },
      status: 'upcoming'
    })
    .sort({ date: 1 })
    .limit(5)
    .select('title date type importance');

    const dashboardStats = {
      userProgress: {
        quizzesCompleted: user.stats.quizzesCompleted,
        articlesRead: user.stats.articlesRead,
        totalScore: user.stats.totalScore,
        rank: userRank
      },
      recentActivity,
      recommendations,
      upcomingEvents: upcomingEvents.map(event => ({
        id: event._id,
        title: event.title,
        date: event.date,
        type: event.type || 'event',
        importance: event.importance || 'medium'
      })),
      stats: {
        totalUsers,
        totalQuizzes,
        totalContent,
        totalViews: totalContent * 150 // Mock data
      }
    };

    logger.info('Dashboard stats retrieved', { userId, stats: dashboardStats });

    res.json({
      success: true,
      data: dashboardStats
    });
  })
);

// Get user progress details
router.get('/progress',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' }
      });
    }

    // Get detailed progress data
    const quizAttempts = await QuizAttempt.find({ userId })
      .populate('quizId', 'title difficulty category')
      .sort({ createdAt: -1 });

    const progressByCategory = {};
    const progressByDifficulty = {};
    
    quizAttempts.forEach(attempt => {
      const category = attempt.quizId?.category || 'General';
      const difficulty = attempt.quizId?.difficulty || 'beginner';
      
      if (!progressByCategory[category]) {
        progressByCategory[category] = { attempts: 0, totalScore: 0, avgScore: 0 };
      }
      
      if (!progressByDifficulty[difficulty]) {
        progressByDifficulty[difficulty] = { attempts: 0, totalScore: 0, avgScore: 0 };
      }
      
      progressByCategory[category].attempts++;
      progressByCategory[category].totalScore += attempt.score;
      progressByCategory[category].avgScore = progressByCategory[category].totalScore / progressByCategory[category].attempts;
      
      progressByDifficulty[difficulty].attempts++;
      progressByDifficulty[difficulty].totalScore += attempt.score;
      progressByDifficulty[difficulty].avgScore = progressByDifficulty[difficulty].totalScore / progressByDifficulty[difficulty].attempts;
    });

    const progressData = {
      user: {
        id: user._id,
        name: user.name,
        stats: user.stats
      },
      progressByCategory,
      progressByDifficulty,
      recentAttempts: quizAttempts.slice(0, 10).map(attempt => ({
        id: attempt._id,
        quiz: {
          id: attempt.quizId?._id,
          title: attempt.quizId?.title,
          difficulty: attempt.quizId?.difficulty
        },
        score: attempt.score,
        timeSpent: attempt.timeSpent,
        completedAt: attempt.createdAt
      }))
    };

    res.json({
      success: true,
      data: progressData
    });
  })
);

// Helper function to get recommendations
async function getRecommendations(user) {
  const recommendations = [];
  
  try {
    // Get quizzes user hasn't attempted
    const attemptedQuizIds = await QuizAttempt.find({ userId: user._id }).distinct('quizId');
    
    const unAttemptedQuizzes = await Quiz.find({
      _id: { $nin: attemptedQuizIds },
      status: 'published'
    })
    .limit(3)
    .select('title description difficulty estimatedTime');

    unAttemptedQuizzes.forEach(quiz => {
      recommendations.push({
        id: quiz._id,
        type: 'quiz',
        title: quiz.title,
        description: quiz.description || 'Test your knowledge with this quiz',
        difficulty: quiz.difficulty,
        estimatedTime: quiz.estimatedTime || 10
      });
    });

    // Get articles user might be interested in
    const articles = await Content.find({
      type: 'article',
      status: 'published'
    })
    .limit(2)
    .select('title excerpt estimatedReadTime');

    articles.forEach(article => {
      recommendations.push({
        id: article._id,
        type: 'article',
        title: article.title,
        description: article.excerpt || 'Learn more about this important topic',
        estimatedTime: article.estimatedReadTime || 5
      });
    });

  } catch (error) {
    logger.error('Error getting recommendations', error, { userId: user._id });
  }

  return recommendations;
}

module.exports = router;