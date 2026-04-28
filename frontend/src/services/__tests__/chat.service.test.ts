import { chatService } from '../chat.service';

// Mock the base-api.service module properly as a class
jest.mock('../base-api.service', () => {
  return {
    BaseApiService: class MockBaseApiService {
      request = jest.fn();
    },
  };
});

describe('ChatService', () => {
  let mockRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mocked request function from the chatService instance
    mockRequest = (chatService as any).api.request as jest.Mock;
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

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await chatService.sendMessage('Hello');

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('AI response');
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

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await chatService.sendMessage('Hello', 'existing-session');

      expect(result.success).toBe(true);
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

      mockRequest.mockResolvedValueOnce(mockResponse);

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

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await chatService.deleteChatSession('session-1');

      expect(result.success).toBe(true);
    });
  });
});
