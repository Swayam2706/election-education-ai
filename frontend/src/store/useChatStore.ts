import { create } from 'zustand';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: Date;
}

interface ChatSession {
  id: string;
  title: string | null;
  messages: Message[];
  createdAt: Date;
}

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  addSession: (session: ChatSession) => void;
  addMessage: (sessionId: string, message: Message) => void;
  setCurrentSession: (sessionId: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearSessions: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessions: [],
  currentSessionId: null,
  isLoading: false,
  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
      currentSessionId: session.id,
    })),
  addMessage: (sessionId, message) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, messages: [...session.messages, message] }
          : session
      ),
    })),
  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearSessions: () => set({ sessions: [], currentSessionId: null }),
}));
