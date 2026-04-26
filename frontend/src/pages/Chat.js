import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, RefreshCw, MessageSquare, Sparkles } from 'lucide-react';
import { chatService } from '../services/chat.service';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadChatHistory();
    }
  }, [isAuthenticated]);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.getChatHistory();
      if (response.success && response.data?.sessions?.length > 0) {
        const latestSession = response.data.sessions[0];
        setSessionId(latestSession.id);
        
        // Ensure all messages have unique IDs
        const messagesWithIds = (latestSession.messages || []).map((msg, index) => ({
          ...msg,
          id: msg.id || `${msg.role}-${latestSession.id}-${index}`,
          role: msg.role || 'ASSISTANT'
        }));
        
        setMessages(messagesWithIds);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'USER',
      content: inputMessage.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(userMessage.content, sessionId);
      
      if (response.success && response.data) {
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'ASSISTANT',
          content: response.data.message,
          createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        if (response.data.sessionId && !sessionId) {
          setSessionId(response.data.sessionId);
        }
      } else {
        throw new Error(response.error?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'ASSISTANT',
        content: 'Sorry, I encountered an error. Please try again or refresh the page.',
        createdAt: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setInputMessage('');
    inputRef.current?.focus();
  };

  const suggestedQuestions = [
    "How do I register to vote?",
    "What documents do I need to vote?",
    "When is the next election?",
    "How does the electoral process work?",
    "What are the different types of elections?"
  ];

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <MessageSquare className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">AI Chat Assistant</h1>
            <p className="text-muted-foreground mb-6">
              Please log in to start chatting with our AI assistant about elections and voting.
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">AI Chat Assistant</h1>
                <p className="text-muted-foreground">Ask me anything about elections and voting</p>
              </div>
            </div>
            <button
              onClick={startNewChat}
              className="btn-secondary flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4" />
              New Chat
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Suggested Questions Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Suggested Questions
              </h3>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left p-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="card h-[600px] flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && !isLoading ? (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Welcome to Election Education Chat!
                    </h3>
                    <p className="text-muted-foreground">
                      Ask me anything about elections, voting, or the democratic process.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex gap-3 ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'ASSISTANT' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            message.role === 'USER'
                              ? 'bg-primary text-white'
                              : message.isError
                              ? 'bg-destructive/10 border border-destructive/20 text-destructive'
                              : 'bg-accent/50 text-foreground'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <div className={`text-xs mt-2 ${
                            message.role === 'USER' ? 'text-white/70' : 'text-muted-foreground'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </div>

                        {message.role === 'USER' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-accent/50 p-4 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-border p-6">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about elections, voting, or the democratic process..."
                      className="w-full p-4 pr-12 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      rows={1}
                      style={{ minHeight: '56px', maxHeight: '120px' }}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="btn-primary w-14 h-14 flex items-center justify-center rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}