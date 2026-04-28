// Chat Header Component
import React from 'react';
import { Bot, RefreshCw, Trash2 } from 'lucide-react';

interface ChatHeaderProps {
  onNewChat: () => void;
  onClearChat: () => void;
  hasMessages: boolean;
  disabled?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onNewChat,
  onClearChat,
  hasMessages,
  disabled = false,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              AI Chat Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              Ask me anything about elections and voting
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasMessages && (
            <button
              onClick={onClearChat}
              className="btn-secondary flex items-center gap-2"
              disabled={disabled}
              aria-label="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
          <button
            onClick={onNewChat}
            className="btn-secondary flex items-center gap-2"
            disabled={disabled}
            aria-label="Start new chat session"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
