const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const FAQ = require('../../models/FAQ');

describe('FAQ API Integration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/election_test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await FAQ.deleteMany({});

    await FAQ.create({
      question: 'How do I register to vote?',
      answer: 'Visit your local election office',
      category: 'registration',
      tags: ['voting', 'registration'],
      order: 1
    });
  });

  describe('GET /api/faq', () => {
    it('should get all FAQs', async () => {
      const res = await request(app).get('/api/faq');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.faqs).toHaveLength(1);
    });

    it('should filter by category', async () => {
      await FAQ.create({
        question: 'What is voting?',
        answer: 'Voting is...',
        category: 'basics',
        tags: ['voting'],
        order: 2
      });

      const res = await request(app)
        .get('/api/faq')
        .query({ category: 'registration' });

      expect(res.status).toBe(200);
      expect(res.body.data.faqs).toHaveLength(1);
      expect(res.body.data.faqs[0].category).toBe('registration');
    });

    it('should search FAQs', async () => {
      const res = await request(app)
        .get('/api/faq')
        .query({ search: 'register' });

      expect(res.status).toBe(200);
      expect(res.body.data.faqs.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/faq/:id', () => {
    it('should get FAQ by id', async () => {
      const faq = await FAQ.findOne();
      const res = await request(app).get(`/api/faq/${faq._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.faq.question).toBe('How do I register to vote?');
    });

    it('should return 404 for invalid id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/faq/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/faq/categories', () => {
    it('should get all categories', async () => {
      const res = await request(app).get('/api/faq/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categories).toContain('registration');
    });
  });
});
