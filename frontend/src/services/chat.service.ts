import { apiService } from './api.service';

export interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string | null;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export const chatService = {
  async sendMessage(message: string, sessionId?: string) {
    const response = await apiService.post('/chat/send', { 
      message, 
      chatId: sessionId 
    });
    return response;
  },

  async getChatHistory() {
    const response = await apiService.get('/chat/sessions');
    return response;
  },

  async createNewSession() {
    const response = await apiService.post('/chat/sessions');
    return response;
  },

  async deleteSession(sessionId: string) {
    const response = await apiService.delete(`/chat/sessions/${sessionId}`);
    return response;
  },

  async getChatSession(sessionId: string) {
    const response = await apiService.get(`/chat/sessions/${sessionId}`);
    return response;
  }
};
