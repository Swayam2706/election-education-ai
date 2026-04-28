/**
 * QuizTimer Component
 * Displays countdown timer for timed quizzes
 */
import React from 'react';
import { Timer, AlertCircle } from 'lucide-react';

interface QuizTimerProps {
  timeLeft: number;
  totalTime: number;
}

/**
 * QuizTimer - Shows remaining time with visual indicator
 */
export const QuizTimer: React.FC<QuizTimerProps> = ({ timeLeft, totalTime }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / totalTime) * 100;
  
  const isLowTime = percentage < 20;
  const isMediumTime = percentage < 50 && percentage >= 20;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
      isLowTime ? 'bg-red-100 text-red-700' :
      isMediumTime ? 'bg-orange-100 text-orange-700' :
      'bg-blue-100 text-blue-700'
    }`}>
      {isLowTime ? (
        <AlertCircle className="w-5 h-5 animate-pulse" />
      ) : (
        <Timer className="w-5 h-5" />
      )}
      <span className="font-mono font-semibold">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default QuizTimer;
