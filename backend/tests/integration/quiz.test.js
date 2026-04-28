const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');
const Quiz = require('../../models/Quiz');
const QuizAttempt = require('../../models/QuizAttempt');

describe('Quiz API Integration Tests', () => {
  let authToken;
  let userId;
  let quizId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/election_test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Quiz.deleteMany({});
    await QuizAttempt.deleteMany({});

    const user = await User.create({
      email: 'test@example.com',
      password: 'Test@1234',
      name: 'Test User'
    });
    userId = user._id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Test@1234' });
    
    authToken = loginRes.body.data.token;

    const quiz = await Quiz.create({
      title: 'Test Quiz',
      description: 'Test Description',
      category: 'voting-process',
      difficulty: 'beginner',
      questions: [
        {
          question: 'What is voting?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'Explanation'
        }
      ],
      timeLimit: 600,
      passingScore: 70
    });
    quizId = quiz._id;
  });

  describe('GET /api/quiz', () => {
    it('should get all quizzes', async () => {
      const res = await request(app).get('/api/quiz');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quizzes).toHaveLength(1);
    });

    it('should filter by difficulty', async () => {
      await Quiz.create({
        title: 'Advanced Quiz',
        description: 'Advanced',
        category: 'voting-process',
        difficulty: 'advanced',
        questions: [{ question: 'Q', options: ['A'], correctAnswer: 0, explanation: 'E' }]
      });

      const res = await request(app)
        .get('/api/quiz')
        .query({ difficulty: 'beginner' });

      expect(res.status).toBe(200);
      expect(res.body.data.quizzes).toHaveLength(1);
      expect(res.body.data.quizzes[0].difficulty).toBe('beginner');
    });
  });

  describe('GET /api/quiz/:id', () => {
    it('should get quiz by id', async () => {
      const res = await request(app).get(`/api/quiz/${quizId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quiz.title).toBe('Test Quiz');
    });

    it('should return 404 for invalid id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/quiz/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/quiz/:id/submit', () => {
    it('should submit quiz and calculate score', async () => {
      const res = await request(app)
        .post(`/api/quiz/${quizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ answers: [0] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBe(100);
      expect(res.body.data.passed).toBe(true);
    });

    it('should calculate incorrect answers', async () => {
      const res = await request(app)
        .post(`/api/quiz/${quizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ answers: [1] });

      expect(res.status).toBe(200);
      expect(res.body.data.score).toBe(0);
      expect(res.body.data.passed).toBe(false);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post(`/api/quiz/${quizId}/submit`)
        .send({ answers: [0] });

      expect(res.status).toBe(401);
    });

    it('should validate answers array', async () => {
      const res = await request(app)
        .post(`/api/quiz/${quizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ answers: [] });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/quiz/attempts', () => {
    it('should get user quiz attempts', async () => {
      await QuizAttempt.create({
        user: userId,
        quiz: quizId,
        answers: [0],
        score: 100,
        completed: true
      });

      const res = await request(app)
        .get('/api/quiz/attempts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.attempts).toHaveLength(1);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/quiz/attempts');
      expect(res.status).toBe(401);
    });
  });
});
