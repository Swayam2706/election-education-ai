/**
 * QuizResultsScreen Component
 * Displays quiz results and detailed answer review
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, CheckCircle, Timer, RotateCcw, XCircle, BookOpen } from 'lucide-react';

interface QuizResults {
  score: number;
  percentage: number;
  timeSpent: number;
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    userAnswer: number;
    isCorrect: boolean;
    explanation?: string;
  }>;
}

interface QuizResultsScreenProps {
  results: QuizResults;
  totalQuestions: number;
  formatTime: (seconds: number) => string;
}

export const QuizResultsScreen: React.FC<QuizResultsScreenProps> = ({
  results,
  totalQuestions,
  formatTime,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center mb-8"
        >
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">Quiz Completed!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-accent/50 p-6 rounded-xl">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {results.score} / {results.questions?.length || totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            <div className="bg-accent/50 p-6 rounded-xl">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{results.percentage}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-accent/50 p-6 rounded-xl">
              <Timer className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{formatTime(results.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/quiz')} className="btn-secondary">
              More Quizzes
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>
          </div>
        </motion.div>

        {/* Detailed Results */}
        {results.questions && results.questions.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Review Your Answers</h2>
            
            {results.questions.map((questionResult, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    questionResult.isCorrect 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {questionResult.isCorrect ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Question {index + 1}
                    </h3>
                    <p className="text-foreground">{questionResult.question}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {questionResult.options.map((option, optionIndex) => {
                    const isCorrect = optionIndex === questionResult.correctAnswer;
                    const isUserAnswer = optionIndex === questionResult.userAnswer;
                    
                    let className = 'p-3 rounded-lg border-2 ';
                    if (isCorrect) {
                      className += 'border-green-500 bg-green-500/10 text-green-700';
                    } else if (isUserAnswer && !isCorrect) {
                      className += 'border-red-500 bg-red-500/10 text-red-700';
                    } else {
                      className += 'border-border bg-accent/30 text-muted-foreground';
                    }

                    return (
                      <div key={optionIndex} className={className}>
                        <div className="flex items-center gap-2">
                          {isCorrect && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                          <span>{option}</span>
                          {isCorrect && <span className="ml-auto text-xs font-semibold">Correct Answer</span>}
                          {isUserAnswer && !isCorrect && <span className="ml-auto text-xs font-semibold">Your Answer</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {questionResult.explanation && (
                  <div className="bg-blue-500/10 border-2 border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-1">Explanation</h4>
                        <p className="text-sm text-foreground">{questionResult.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultsScreen;
