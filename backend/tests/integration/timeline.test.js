const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const Timeline = require('../../models/Timeline');

describe('Timeline API Integration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/election_test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Timeline.deleteMany({});

    await Timeline.create({
      title: 'First Election',
      description: 'Historic event',
      date: new Date('2020-01-01'),
      category: 'election',
      importance: 'high',
      country: 'USA'
    });
  });

  describe('GET /api/timeline', () => {
    it('should get all timeline events', async () => {
      const res = await request(app).get('/api/timeline');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.events).toHaveLength(1);
    });

    it('should filter by category', async () => {
      await Timeline.create({
        title: 'Reform',
        description: 'Reform event',
        date: new Date('2021-01-01'),
        category: 'reform',
        importance: 'medium'
      });

      const res = await request(app)
        .get('/api/timeline')
        .query({ category: 'election' });

      expect(res.status).toBe(200);
      expect(res.body.data.events).toHaveLength(1);
      expect(res.body.data.events[0].category).toBe('election');
    });

    it('should filter by date range', async () => {
      const res = await request(app)
        .get('/api/timeline')
        .query({ 
          startDate: '2019-01-01',
          endDate: '2020-12-31'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.events.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/timeline/:id', () => {
    it('should get event by id', async () => {
      const event = await Timeline.findOne();
      const res = await request(app).get(`/api/timeline/${event._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event.title).toBe('First Election');
    });

    it('should return 404 for invalid id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/timeline/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });
});
