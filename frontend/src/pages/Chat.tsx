import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import {
  ChatHeader,
  ChatSidebar,
  ChatMessage,
  ChatInput,
  ChatEmptyState,
  ChatTypingIndicator,
} from '../components/chat';

const Chat: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const {
    messages,
    loading,
    typing,
    sendMessage,
    loadHistory,
    startNewChat,
  } = useChat();

  const [inputMessage, setInputMessage] = useState<string>('');

  // Load chat history on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, loadHistory]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim() || loading) return;
    
    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleClearChat = (): void => {
    if (window.confirm('Are you sure you want to clear this chat?')) {
      startNewChat();
    }
  };

  const handleSuggestedQuestion = (question: string): void => {
    setInputMessage(question);
  };

  const suggestedQuestions: string[] = [
    'How do I register to vote?',
    'What documents do I need to vote?',
    'When is the next election?',
    'How does the electoral process work?',
    'What are the different types of elections?',
  ];

  // Unauthenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <MessageSquare className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              AI Chat Assistant
            </h1>
            <p className="text-muted-foreground mb-6">
              Please log in to start chatting with our AI assistant about
              elections and voting.
            </p>
            <a href="/login" className="btn-primary">
              Sign In to Chat
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <ChatHeader
          onNewChat={startNewChat}
          onClearChat={handleClearChat}
          hasMessages={messages.length > 0}
          disabled={loading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Suggested Questions Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ChatSidebar
              suggestedQuestions={suggestedQuestions}
              onQuestionClick={handleSuggestedQuestion}
              disabled={loading}
            />
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div
              className="card flex flex-col"
              style={{
                height: 'calc(100vh - 200px)',
                minHeight: '500px',
                maxHeight: '700px',
              }}
            >
              {/* Messages Area */}
              <div 
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth"
                role="log"
                aria-live="polite"
                aria-atomic="false"
                aria-relevant="additions"
              >
                {messages.length === 0 && !loading ? (
                  <ChatEmptyState />
                ) : (
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                  </AnimatePresence>
                )}

                {typing && <ChatTypingIndicator />}
              </div>

              {/* Input Area */}
              <ChatInput
                value={inputMessage}
                onChange={setInputMessage}
                onSubmit={handleSendMessage}
                disabled={loading}
                loading={loading}
                placeholder="Ask me about elections, voting, or the democratic process..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;