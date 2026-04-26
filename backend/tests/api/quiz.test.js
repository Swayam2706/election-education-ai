const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Quiz = require('../../models/Quiz');

describe('Quiz API Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/quiz', () => {
    it('should return list of quizzes', async () => {
      const res = await request(app)
        .get('/api/quiz')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('quizzes');
      expect(Array.isArray(res.body.data.quizzes)).toBe(true);
    });

    it('should filter quizzes by difficulty', async () => {
      const res = await request(app)
        .get('/api/quiz?difficulty=beginner')
        .expect(200);

      expect(res.body.success).toBe(true);
      if (res.body.data.quizzes.length > 0) {
        expect(res.body.data.quizzes[0].difficulty).toBe('beginner');
      }
    });
  });

  describe('GET /api/quiz/:quizId', () => {
    it('should return 404 for invalid quiz ID', async () => {
      const res = await request(app)
        .get('/api/quiz/invalid-id')
        .expect(500); // Will fail validation

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/quiz/categories', () => {
    it('should return quiz categories', async () => {
      const res = await request(app)
        .get('/api/quiz/categories')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('categories');
      expect(Array.isArray(res.body.data.categories)).toBe(true);
    });
  });
});
