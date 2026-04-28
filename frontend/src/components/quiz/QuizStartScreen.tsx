/**
 * QuizStartScreen Component
 * Displays quiz information before starting
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Clock, Trophy, ArrowRight } from 'lucide-react';

interface Quiz {
  title: string;
  description?: string;
  questions: unknown[];
  difficulty: string;
  timeLimit?: number;
  category: string;
}

interface QuizStartScreenProps {
  quiz: Quiz;
  onStart: () => void;
}

export const QuizStartScreen: React.FC<QuizStartScreenProps> = ({ quiz, onStart }) => {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-lg text-muted-foreground mb-6">{quiz.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-accent/50 p-6 rounded-xl text-center">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{quiz.questions.length}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="bg-accent/50 p-6 rounded-xl text-center">
              <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{quiz.difficulty}</div>
              <div className="text-sm text-muted-foreground">Difficulty</div>
            </div>
            <div className="bg-accent/50 p-6 rounded-xl text-center">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}
              </div>
              <div className="text-sm text-muted-foreground">Time Limit</div>
            </div>
            <div className="bg-accent/50 p-6 rounded-xl text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{quiz.category}</div>
              <div className="text-sm text-muted-foreground">Category</div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={onStart}
              className="btn-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto"
            >
              Start Quiz
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizStartScreen;
