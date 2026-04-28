/**
 * QuizResults Component
 * Displays quiz completion results with score and feedback
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, RotateCcw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  passed: boolean;
  onRetry: () => void;
}

/**
 * QuizResults - Shows final quiz score and actions
 */
export const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  passed,
  onRetry,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
        passed ? 'bg-green-100' : 'bg-orange-100'
      }`}>
        {passed ? (
          <Trophy className="w-16 h-16 text-green-600" />
        ) : (
          <Target className="w-16 h-16 text-orange-600" />
        )}
      </div>

      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {passed ? 'Congratulations!' : 'Good Effort!'}
        </h2>
        <p className="text-xl text-muted-foreground">
          You scored {score} out of {totalQuestions}
        </p>
        <p className="text-4xl font-bold text-primary mt-2">{percentage}%</p>
      </div>

      <div className="p-6 bg-accent rounded-lg">
        <p className="text-foreground">
          {passed
            ? 'Great job! You have a solid understanding of the election process.'
            : 'Keep learning! Review the material and try again to improve your score.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRetry}
          className="btn-outline flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
        <Link to="/quiz" className="btn-primary flex items-center justify-center gap-2">
          More Quizzes
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default QuizResults;
