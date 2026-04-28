import { chatService } from '../chat.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            message: 'AI response',
            sessionId: 'session-1',
            timestamp: new Date().toISOString(),
          },
        },
      };

      mockedAxios.request.mockResolvedValueOnce(mockResponse);

      const result = await chatService.sendMessage('Hello');

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('AI response');
    });

    it('should handle session id', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            message: 'Response',
            sessionId: 'existing-session',
            timestamp: new Date().toISOString(),
          },
        },
      };

      mockedAxios.request.mockResolvedValueOnce(mockResponse);

      const result = await chatService.sendMessage('Hello', 'existing-session');

      expect(result.success).toBe(true);
    });
  });

  describe('getChatHistory', () => {
    it('should fetch chat history', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            sessions: [
              { id: '1', title: 'Chat 1', messages: [] },
            ],
            total: 1,
          },
        },
      };

      mockedAxios.request.mockResolvedValueOnce(mockResponse);

      const result = await chatService.getChatHistory();

      expect(result.success).toBe(true);
      expect(result.data?.sessions).toHaveLength(1);
    });
  });

  describe('deleteChatSession', () => {
    it('should delete session', async () => {
      const mockResponse = {
        data: { success: true },
      };

      mockedAxios.request.mockResolvedValueOnce(mockResponse);

      const result = await chatService.deleteChatSession('session-1');

      expect(result.success).toBe(true);
    });
  });
});
