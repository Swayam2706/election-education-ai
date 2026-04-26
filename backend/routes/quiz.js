const express = require('express');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { validate, quizValidation } = require('../middleware/validation');

const router = express.Router();

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const quizzes = await Quiz.find(filter)
      .select('title description category difficulty timeLimit totalAttempts averageScore tags')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true,
      data: {
        quizzes: quizzes
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

// Get quiz by ID
router.get('/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.quizId, isActive: true });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Remove correct answers from questions for security
    const quizData = quiz.toObject();
    quizData.questions = quizData.questions.map(q => ({
      question: q.question,
      options: q.options
    }));

    res.json({ 
      success: true,
      data: quizData 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz attempt
router.post('/submit', authenticate, validate(quizValidation.submitAttempt), async (req, res) => {
  try {
    const { quizId, answers, timeSpent } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent || 0
      };
    });

    const score = correctAnswers;
    const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Save attempt
    const attempt = new QuizAttempt({
      user: req.user.userId,
      quiz: quizId,
      answers: processedAnswers,
      score,
      percentage,
      timeSpent
    });

    await attempt.save();

    // Update quiz stats
    await Quiz.findByIdAndUpdate(quizId, {
      $inc: { totalAttempts: 1 },
      $set: {
        averageScore: await QuizAttempt.aggregate([
          { $match: { quiz: quiz._id } },
          { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
        ]).then(result => result[0]?.avgScore || 0)
      }
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { 
        'stats.quizzesCompleted': 1,
        'stats.totalScore': score
      }
    });

    // Return results with correct answers
    const results = {
      attempt: {
        id: attempt._id,
        score,
        percentage,
        timeSpent
      },
      questions: quiz.questions.map((question, index) => ({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        userAnswer: answers[index]?.selectedAnswer,
        isCorrect: processedAnswers[index].isCorrect
      }))
    };

    res.json({
      success: true,
      data: {
        score,
        percentage,
        timeSpent,
        attempt: {
          id: attempt._id,
          score,
          percentage,
          timeSpent
        },
        questions: quiz.questions.map((question, index) => ({
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          userAnswer: answers[index]?.selectedAnswer,
          isCorrect: processedAnswers[index].isCorrect
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quiz categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Quiz.distinct('category', { isActive: true });
    
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

// Get quiz statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [totalQuizzes, userAttempts, userStats] = await Promise.all([
      Quiz.countDocuments({ isActive: true }),
      QuizAttempt.countDocuments({ user: userId }),
      QuizAttempt.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$percentage' },
            totalScore: { $sum: '$score' },
            bestScore: { $max: '$percentage' }
          }
        }
      ])
    ]);

    const stats = {
      totalQuizzes,
      userAttempts,
      averageScore: Math.round(userStats[0]?.averageScore || 0),
      totalScore: userStats[0]?.totalScore || 0,
      bestScore: userStats[0]?.bestScore || 0
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

// Get user's quiz attempts
router.get('/attempts', authenticate, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.userId })
      .populate('quiz', 'title category difficulty')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ 
      success: true,
      data: { attempts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

module.exports = router;


// Get specific quiz attempt
router.get('/attempts/:id', authenticate, async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('quiz', 'title category difficulty questions');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz attempt not found' }
      });
    }

    res.json({ 
      success: true,
      data: { attempt }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});
