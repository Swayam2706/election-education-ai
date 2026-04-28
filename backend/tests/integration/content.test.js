const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const Content = require('../../models/Content');

describe('Content API Integration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/election_test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Content.deleteMany({});

    await Content.create({
      title: 'Voting Basics',
      description: 'Learn about voting',
      content: 'Content here',
      category: 'voting-process',
      difficulty: 'beginner',
      tags: ['voting', 'basics'],
      isPublished: true
    });
  });

  describe('GET /api/content', () => {
    it('should get all published content', async () => {
      const res = await request(app).get('/api/content');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contents).toHaveLength(1);
    });

    it('should filter by category', async () => {
      await Content.create({
        title: 'Election History',
        description: 'History',
        content: 'Content',
        category: 'history',
        difficulty: 'intermediate',
        tags: ['history'],
        isPublished: true
      });

      const res = await request(app)
        .get('/api/content')
        .query({ category: 'voting-process' });

      expect(res.status).toBe(200);
      expect(res.body.data.contents).toHaveLength(1);
      expect(res.body.data.contents[0].category).toBe('voting-process');
    });

    it('should search content', async () => {
      const res = await request(app)
        .get('/api/content')
        .query({ search: 'voting' });

      expect(res.status).toBe(200);
      expect(res.body.data.contents.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/content/:id', () => {
    it('should get content by id', async () => {
      const content = await Content.findOne();
      const res = await request(app).get(`/api/content/${content._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content.title).toBe('Voting Basics');
    });

    it('should return 404 for invalid id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/content/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/content/categories', () => {
    it('should get all categories', async () => {
      const res = await request(app).get('/api/content/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categories).toContain('voting-process');
    });
  });
});
