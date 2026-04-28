/**
 * QuizQuestion Component
 * Displays a single quiz question with answer options
 */
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizQuestionProps {
  question: {
    question: string;
    options: string[];
    correctAnswer?: number;
  };
  questionIndex: number;
  selectedAnswer?: number;
  onAnswerSelect: (answerIndex: number) => void;
  showResults?: boolean;
  disabled?: boolean;
}

/**
 * QuizQuestion - Renders a quiz question with selectable answers
 */
export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionIndex,
  selectedAnswer,
  onAnswerSelect,
  showResults = false,
  disabled = false,
}) => {
  const getOptionClassName = (optionIndex: number): string => {
    const baseClasses = 'w-full text-left p-4 rounded-lg border-2 transition-all';
    
    if (showResults) {
      if (optionIndex === question.correctAnswer) {
        return `${baseClasses} border-green-500 bg-green-50 text-green-900`;
      }
      if (optionIndex === selectedAnswer && optionIndex !== question.correctAnswer) {
        return `${baseClasses} border-red-500 bg-red-50 text-red-900`;
      }
      return `${baseClasses} border-gray-200 bg-gray-50 opacity-50`;
    }
    
    if (selectedAnswer === optionIndex) {
      return `${baseClasses} border-primary bg-primary/10 text-primary`;
    }
    
    return `${baseClasses} border-border hover:border-primary/50 hover:bg-accent ${
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
    }`;
  };

  const getOptionIcon = (optionIndex: number) => {
    if (!showResults) return null;
    
    if (optionIndex === question.correctAnswer) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (optionIndex === selectedAnswer && optionIndex !== question.correctAnswer) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Question {questionIndex + 1}
        </h3>
        <p className="text-lg text-foreground">{question.question}</p>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !disabled && !showResults && onAnswerSelect(index)}
            disabled={disabled || showResults}
            className={getOptionClassName(index)}
          >
            <div className="flex items-center justify-between">
              <span className="flex-1 text-left">{option}</span>
              {getOptionIcon(index)}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuizQuestion;
