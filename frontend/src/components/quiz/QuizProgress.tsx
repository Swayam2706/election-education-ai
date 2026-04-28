/**
 * QuizProgress Component
 * Shows progress through quiz questions
 */
import React from 'react';

interface QuizProgressProps {
  current: number;
  total: number;
  answered: number;
}

/**
 * QuizProgress - Visual progress indicator for quiz
 */
export const QuizProgress: React.FC<QuizProgressProps> = ({
  current,
  total,
  answered,
}) => {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Question {current + 1} of {total}</span>
        <span>{answered} answered</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default QuizProgress;
