// Chat Empty State Component
import React from 'react';
import { Bot } from 'lucide-react';

export const ChatEmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
        <Bot className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Welcome to Election Education Chat!
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Ask me anything about elections, voting, or the democratic process. I'm
        here to help!
      </p>
    </div>
  );
};

export default ChatEmptyState;
