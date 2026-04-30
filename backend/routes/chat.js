const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { validate, chatValidation } = require('../middleware/validation');
const { logger } = require('../utils/logger');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get user's chat sessions
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const sessions = await Chat.find({ user: req.user.userId, isActive: true })
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('title messages createdAt updatedAt');

    res.json({ 
      success: true,
      data: { 
        sessions: sessions.map(session => ({
          id: session._id,
          title: session.title,
          messages: session.messages,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

// Create new chat session
router.post('/sessions', authenticate, async (req, res) => {
  try {
    const chat = new Chat({
      user: req.user.userId,
      title: 'New Chat',
      messages: []
    });

    await chat.save();

    res.json({
      success: true,
      data: {
        sessionId: chat._id,
        session: {
          id: chat._id,
          title: chat.title,
          messages: chat.messages,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

// Get specific chat session
router.get('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const session = await Chat.findOne({
      _id: req.params.sessionId,
      user: req.user.userId
    });

    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: { message: 'Session not found' }
      });
    }

    res.json({ 
      success: true,
      data: {
        session: {
          id: session._id,
          title: session.title,
          messages: session.messages,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const session = await Chat.findOneAndUpdate(
      { _id: req.params.sessionId, user: req.user.userId },
      { isActive: false }
    );

    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: { message: 'Session not found' }
      });
    }

    res.json({
      success: true,
      data: { message: 'Session deleted successfully' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

// Get user's chat history (legacy endpoint)
router.get('/history', authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.userId, isActive: true })
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('title messages updatedAt');

    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific chat
router.get('/:chatId', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user.userId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message
router.post('/send', authenticate, async (req, res) => {
  try {
    const { message, chatId } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message is required and must be a non-empty string' }
      });
    }

    // Check message length
    if (message.length > 5000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message is too long (max 5000 characters)' }
      });
    }

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: req.user.userId });
      if (!chat) {
        return res.status(404).json({
          success: false,
          error: { message: 'Chat session not found' }
        });
      }
    } else {
      // Create new chat
      chat = new Chat({
        user: req.user.userId,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: []
      });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Generate AI response with error handling and retry logic
    let aiMessage = '';
    let retries = 3;
    let lastError = null;

    logger.info('Generating AI response', { 
      messagePreview: message.substring(0, 50) + '...',
      hasApiKey: !!process.env.GEMINI_API_KEY 
    });

    while (retries > 0 && !aiMessage) {
      try {
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('Gemini API key not configured');
        }

        logger.debug('Calling Gemini API', { attempt: 4 - retries, retriesLeft: retries });

        // Use gemini-2.5-flash (latest fast model)
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        });
        
        const context = `You are an AI assistant specializing in election education and civic engagement. 
        Help users understand voting processes, election timelines, candidate information, and democratic principles.
        Be informative, accurate, and encouraging about civic participation.
        Keep responses concise and under 500 words.
        
        User question: ${message}`;

        const result = await model.generateContent(context);
        const response = result.response;
        aiMessage = response.text();

        // Validate response
        if (!aiMessage || aiMessage.trim().length === 0) {
          throw new Error('Empty response from AI');
        }

        logger.info('AI response generated successfully');
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        retries--;
        logger.error(`Gemini API error (${3 - retries}/3)`, { 
          message: error.message,
          details: error 
        });
        
        if (retries > 0) {
          const waitTime = Math.pow(2, 3 - retries) * 1000;
          logger.warn('Retrying Gemini API call', { waitTime, retriesLeft: retries });
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // If all retries failed, use fallback response
    if (!aiMessage) {
      logger.error('All Gemini API retries failed', { error: lastError });
      
      // Provide contextual fallback based on the question
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('register') || lowerMessage.includes('registration')) {
        aiMessage = "To register to vote, you typically need to:\n\n1. Be a U.S. citizen\n2. Meet your state's residency requirements\n3. Be 18 years old by Election Day\n\nYou can register online at vote.gov or through your state's election website. You'll need a valid ID and proof of residence. Check our Learning section for detailed state-specific requirements!";
      } else if (lowerMessage.includes('document') || lowerMessage.includes('id')) {
        aiMessage = "Required documents vary by state, but commonly include:\n\n• Driver's license or state ID\n• Passport\n• Utility bill or bank statement (for address verification)\n• Birth certificate (for registration)\n\nSome states have strict voter ID laws while others are more flexible. Visit our FAQ page for state-specific requirements!";
      } else if (lowerMessage.includes('election') || lowerMessage.includes('when')) {
        aiMessage = "Election dates vary by type:\n\n• Presidential elections: Every 4 years (next in November 2024)\n• Midterm elections: Every 2 years\n• Local elections: Vary by jurisdiction\n\nCheck our Timeline page for upcoming election dates and important deadlines in your area!";
      } else {
        aiMessage = "I apologize, but I'm currently unable to connect to my AI service. However, I can still help you! Please explore:\n\n• Our Learning section for comprehensive election information\n• The FAQ page for common questions\n• The Timeline for important dates\n• The Eligibility Checker to verify your voting status\n\nOr try asking your question again in a moment!";
      }
    }

    // Add AI response
    chat.messages.push({
      role: 'assistant',
      content: aiMessage,
      timestamp: new Date()
    });

    await chat.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { 'stats.chatMessages': 1 }
    });

    res.json({
      success: true,
      data: {
        message: aiMessage,
        sessionId: chat._id,
        chat: {
          id: chat._id,
          title: chat.title,
          messages: chat.messages
        }
      }
    });
  } catch (error) {
    logger.error('Chat error', { error });
    res.status(500).json({
      success: false,
      error: { 
        message: 'Failed to process message. Please try again.',
        code: 'CHAT_ERROR'
      }
    });
  }
});

// Delete chat
router.delete('/:chatId', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, user: req.user.userId },
      { isActive: false }
    );

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;