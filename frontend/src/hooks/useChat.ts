// Custom hook for chat functionality
import { useState, useCallback, useRef, useEffect } from 'react';
import { chatService } from '../services/chat.service';
import { ChatMessage, ChatSession } from '../types';
import toast from 'react-hot-toast';

interface UseChatReturn {
  messages: ChatMessage[];
  sessions: ChatSession[];
  currentSessionId: string | null;
  loading: boolean;
  typing: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  startNewChat: () => void;
  scrollToBottom: () => void;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.getChatHistory();
      
      if (response.success && response.data) {
        setSessions(response.data.sessions);
        
        if (response.data.sessions.length > 0) {
          const latestSession = response.data.sessions[0];
          setCurrentSessionId(latestSession.id);
          setMessages(latestSession.messages || []);
        }
      } else {
        throw new Error(response.error?.message || 'Failed to load chat history');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load chat history';
      setError(errorMessage);
      if (typeof window !== 'undefined') {
        import('../utils/logger').then(({ logger }) => {
          logger.error('Load history error', err);
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.getChatSession(sessionId);
      
      if (response.success && response.data) {
        setCurrentSessionId(sessionId);
        setMessages(response.data.session.messages || []);
      } else {
        throw new Error(response.error?.message || 'Failed to load session');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load session';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'USER',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setTyping(true);
    setError(null);

    try {
      const startTime = performance.now();
      
      const response = await chatService.sendMessage(content, currentSessionId);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Track performance
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'timing_complete', {
          name: 'chat_response',
          value: Math.round(duration),
          event_category: 'API',
        });
      }

      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'ASSISTANT',
          content: response.data.message,
          createdAt: response.data.timestamp,
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (response.data.sessionId && !currentSessionId) {
          setCurrentSessionId(response.data.sessionId);
        }
      } else {
        throw new Error(response.error?.message || 'Failed to send message');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);

      // Add error message to chat
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'ASSISTANT',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  }, [currentSessionId]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const response = await chatService.deleteChatSession(sessionId);
      
      if (response.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        
        if (currentSessionId === sessionId) {
          startNewChat();
        }
        
        toast.success('Chat session deleted');
      } else {
        throw new Error(response.error?.message || 'Failed to delete session');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete session');
    }
  }, [currentSessionId]);

  const clearHistory = useCallback(async () => {
    try {
      const response = await chatService.clearChatHistory();
      
      if (response.success) {
        setSessions([]);
        startNewChat();
        toast.success('Chat history cleared');
      } else {
        throw new Error(response.error?.message || 'Failed to clear history');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to clear history');
    }
  }, []);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setError(null);
  }, []);

  return {
    messages,
    sessions,
    currentSessionId,
    loading,
    typing,
    error,
    sendMessage,
    loadHistory,
    loadSession,
    deleteSession,
    clearHistory,
    startNewChat,
    scrollToBottom,
  };
};

export default useChat;
