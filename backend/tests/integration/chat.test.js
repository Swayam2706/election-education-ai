const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');
const Chat = require('../../models/Chat');

describe('Chat API Integration Tests', () => {
  let authToken;
  let userId;

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
    await Chat.deleteMany({});

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
  });

  describe('POST /api/chat/send', () => {
    it('should send a message and get AI response', async () => {
      const res = await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'How do I register to vote?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBeDefined();
      expect(res.body.data.sessionId).toBeDefined();
    });

    it('should reject empty messages', async () => {
      const res = await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: '' });

      expect(res.status).toBe(400);
    });

    it('should reject messages over 5000 characters', async () => {
      const longMessage = 'a'.repeat(5001);
      const res = await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: longMessage });

      expect(res.status).toBe(400);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/chat/send')
        .send({ message: 'Test message' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/chat/sessions', () => {
    it('should return user chat sessions', async () => {
      await Chat.create({
        user: userId,
        title: 'Test Chat',
        messages: [
          { role: 'user', content: 'Hello', timestamp: new Date() }
        ]
      });

      const res = await request(app)
        .get('/api/chat/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sessions).toHaveLength(1);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/chat/sessions');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/chat/sessions/:sessionId', () => {
    it('should delete a chat session', async () => {
      const chat = await Chat.create({
        user: userId,
        title: 'Test Chat',
        messages: []
      });

      const res = await request(app)
        .delete(`/api/chat/sessions/${chat._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedChat = await Chat.findById(chat._id);
      expect(deletedChat.isActive).toBe(false);
    });

    it('should not delete other users sessions', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        password: 'Test@1234',
        name: 'Other User'
      });

      const chat = await Chat.create({
        user: otherUser._id,
        title: 'Other Chat',
        messages: []
      });

      const res = await request(app)
        .delete(`/api/chat/sessions/${chat._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});
