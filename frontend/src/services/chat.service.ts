/**
 * Chat Service - Domain-specific API abstraction for chat functionality
 * Handles all chat-related API operations including messaging, history, and session management
 */

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
   * @param message - The message text to send
   * @param sessionId - Optional session ID to continue existing conversation
   * @returns Promise with AI response, session ID, and timestamp
   * @example
   * ```ts
   * const response = await chatService.sendMessage('What is democracy?');
   * console.log(response.data.message); // AI response
   * ```
   */
  async sendMessage(message: string, sessionId?: string | null): Promise<ApiResponse<SendMessageResponse>> {
    return this.post<SendMessageResponse>(this.endpoint, {
      message,
      sessionId: sessionId || undefined,
    });
  }

  /**
   * Get chat history for the current user
   * @param limit - Maximum number of sessions to retrieve (default: 10)
   * @returns Promise with array of chat sessions and total count
   * @example
   * ```ts
   * const history = await chatService.getChatHistory(20);
   * console.log(history.data.sessions); // Array of chat sessions
   * ```
   */
  async getChatHistory(limit: number = 10): Promise<ApiResponse<ChatHistoryResponse>> {
    return this.get<ChatHistoryResponse>(`${this.endpoint}/history`, {
      params: { limit },
    });
  }

  /**
   * Get a specific chat session by ID
   * @param sessionId - The unique identifier of the chat session
   * @returns Promise with complete session data including all messages
   * @throws Error if session not found
   */
  async getChatSession(sessionId: string): Promise<ApiResponse<ChatSessionResponse>> {
    return this.get<ChatSessionResponse>(`${this.endpoint}/session/${sessionId}`);
  }

  /**
   * Delete a specific chat session
   * @param sessionId - The unique identifier of the chat session to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if deletion fails
   */
  async deleteChatSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/session/${sessionId}`);
  }

  /**
   * Clear all chat history for the current user
   * @returns Promise that resolves when all history is cleared
   * @warning This action cannot be undone
   */
  async clearChatHistory(): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/history`);
  }

  /**
   * Update the title of a chat session
   * @param sessionId - The unique identifier of the chat session
   * @param title - The new title for the session
   * @returns Promise with updated session data
   */
  async updateSessionTitle(sessionId: string, title: string): Promise<ApiResponse<ChatSessionResponse>> {
    return this.patch<ChatSessionResponse>(`${this.endpoint}/session/${sessionId}`, {
      title,
    });
  }
}

export const chatService = new ChatService();
export default chatService;
