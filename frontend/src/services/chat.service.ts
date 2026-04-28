// Chat Service - Domain-specific API abstraction
import BaseApiService from './base-api.service';
import { ApiResponse, ChatMessage, ChatSession } from '../types';

interface SendMessageRequest {
  message: string;
  sessionId?: string | null;
}

interface SendMessageResponse {
  message: string;
  sessionId: string;
  timestamp: string;
}

interface ChatHistoryResponse {
  sessions: ChatSession[];
  total: number;
}

interface ChatSessionResponse {
  session: ChatSession;
}

class ChatService extends BaseApiService {
  private readonly endpoint = '/chat';

  /**
   * Send a message to the AI assistant
   */
  async sendMessage(message: string, sessionId?: string | null): Promise<ApiResponse<SendMessageResponse>> {
    return this.post<SendMessageResponse>(this.endpoint, {
      message,
      sessionId: sessionId || undefined,
    });
  }

  /**
   * Get chat history for the current user
   */
  async getChatHistory(limit: number = 10): Promise<ApiResponse<ChatHistoryResponse>> {
    return this.get<ChatHistoryResponse>(`${this.endpoint}/history`, {
      params: { limit },
    });
  }

  /**
   * Get a specific chat session
   */
  async getChatSession(sessionId: string): Promise<ApiResponse<ChatSessionResponse>> {
    return this.get<ChatSessionResponse>(`${this.endpoint}/session/${sessionId}`);
  }

  /**
   * Delete a chat session
   */
  async deleteChatSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/session/${sessionId}`);
  }

  /**
   * Clear all chat history
   */
  async clearChatHistory(): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/history`);
  }

  /**
   * Update chat session title
   */
  async updateSessionTitle(sessionId: string, title: string): Promise<ApiResponse<ChatSessionResponse>> {
    return this.patch<ChatSessionResponse>(`${this.endpoint}/session/${sessionId}`, {
      title,
    });
  }
}

export const chatService = new ChatService();
export default chatService;
