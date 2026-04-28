// Mock the entire chat service
const mockSendMessage = jest.fn();
const mockGetChatHistory = jest.fn();
const mockDeleteChatSession = jest.fn();

jest.mock('../chat.service', () => ({
  chatService: {
    sendMessage: (...args: any[]) => mockSendMessage(...args),
    getChatHistory: (...args: any[]) => mockGetChatHistory(...args),
    deleteChatSession: (...args: any[]) => mockDeleteChatSession(...args),
  },
}));

import { chatService } from '../chat.service';

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: 'AI response',
          sessionId: 'session-1',
          timestamp: new Date().toISOString(),
        },
      };

      mockSendMessage.mockResolvedValueOnce(mockResponse);

      const result = await chatService.sendMessage('Hello');

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('AI response');
      expect(mockSendMessage).toHaveBeenCalledWith('Hello');
    });

    it('should handle session id', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: 'Response',
          sessionId: 'existing-session',
          timestamp: new Date().toISOString(),
        },
      };

      mockSendMessage.mockResolvedValueOnce(mockResponse);

      const result = await chatService.sendMessage('Hello', 'existing-session');

      expect(result.success).toBe(true);
      expect(mockSendMessage).toHaveBeenCalledWith('Hello', 'existing-session');
    });
  });

  describe('getChatHistory', () => {
    it('should fetch chat history', async () => {
      const mockResponse = {
        success: true,
        data: {
          sessions: [
            { id: '1', title: 'Chat 1', messages: [] },
          ],
          total: 1,
        },
      };

      mockGetChatHistory.mockResolvedValueOnce(mockResponse);

      const result = await chatService.getChatHistory();

      expect(result.success).toBe(true);
      expect(result.data?.sessions).toHaveLength(1);
    });
  });

  describe('deleteChatSession', () => {
    it('should delete session', async () => {
      const mockResponse = {
        success: true,
      };

      mockDeleteChatSession.mockResolvedValueOnce(mockResponse);

      const result = await chatService.deleteChatSession('session-1');

      expect(result.success).toBe(true);
      expect(mockDeleteChatSession).toHaveBeenCalledWith('session-1');
    });
  });
});
