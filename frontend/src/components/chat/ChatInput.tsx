// Chat Input Component
import React, { useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  loading = false,
  placeholder = 'Type your message...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [value]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border-t border-border p-4 sm:p-6 bg-background/50 backdrop-blur-sm">
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full p-3 sm:p-4 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
            rows={1}
            style={{ minHeight: '56px', maxHeight: '120px' }}
            disabled={disabled}
            aria-label="Chat message input"
            aria-describedby="chat-input-help"
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={!value.trim() || disabled || loading}
          className="btn-primary w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg flex-shrink-0"
          aria-label={loading ? 'Sending message' : 'Send message'}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 px-1" id="chat-input-help">
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  );
};

export default ChatInput;
