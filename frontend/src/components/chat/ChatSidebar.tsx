// Chat Sidebar Component
import React from 'react';
import { Sparkles } from 'lucide-react';

interface ChatSidebarProps {
  suggestedQuestions: string[];
  onQuestionClick: (question: string) => void;
  disabled?: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  suggestedQuestions,
  onQuestionClick,
  disabled = false,
}) => {
  return (
    <div className="card p-4 sm:p-6 lg:sticky lg:top-8">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        Suggested Questions
      </h3>
      <div className="space-y-2">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="w-full text-left p-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 hover:shadow-sm"
            disabled={disabled}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
