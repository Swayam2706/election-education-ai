import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../useChat';
import { chatService } from '../../services/chat.service';

jest.mock('../../services/chat.service');

describe('useChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.typing).toBe(false);
  });

  it('should send message successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        message: 'AI response',
        sessionId: 'session-1',
        timestamp: new Date().toISOString(),
      },
    };

    (chatService.sendMessage as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe('Hello');
      expect(result.current.messages[1].content).toBe('AI response');
    });
  });

  it('should handle errors', async () => {
    (chatService.sendMessage as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should start new chat', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.startNewChat();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.currentSessionId).toBeNull();
  });
});
