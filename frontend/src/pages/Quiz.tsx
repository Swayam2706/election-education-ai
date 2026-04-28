import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock, Users } from 'lucide-react';
import { quizService } from '../services/quiz.service';
import { Quiz as QuizType } from '../types';

// Memoized Quiz Card Component
const QuizCard = React.memo(({ quiz }) => {
  return (
    <Link
      to={`/quiz/${quiz._id}`}
      className="card p-6 hover:shadow-lg transition-all group"
    >
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-primary capitalize">
          {quiz.difficulty}
        </span>
      </div>
      
      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {quiz.title}
      </h3>
      
      <p className="text-muted-foreground text-sm mb-4">
        {quiz.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {Math.floor(quiz.timeLimit / 60)} min
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {quiz.totalAttempts || 0} attempts
        </div>
      </div>
    </Link>
  );
});

QuizCard.displayName = 'QuizCard';

// Loading Skeleton Component
const QuizSkeleton = React.memo(() => (
  <div className="card p-6">
    <div className="h-4 bg-muted rounded mb-2 animate-pulse"></div>
    <div className="h-3 bg-muted rounded w-3/4 mb-4 animate-pulse"></div>
    <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
  </div>
));

QuizSkeleton.displayName = 'QuizSkeleton';

export default function Quiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const response = await quizService.getQuizzes();
        if (response.success && response.data) {
          setQuizzes(response.data.quizzes || []);
        }
      } catch (error) {
        console.error('Failed to load quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  // Memoized filtered quizzes
  const filteredQuizzes = useMemo(() => {
    if (filter === 'all') return quizzes;
    return quizzes.filter(quiz => quiz.difficulty === filter);
  }, [quizzes, filter]);

  // Memoized filter handler
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <QuizSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Test Your Knowledge</h1>
          <p className="text-muted-foreground">
            Interactive quizzes to help you learn about elections and voting
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() => handleFilterChange(level)}
              className={`px-4 py-2 rounded-md capitalize transition-colors ${
                filter === level
                  ? 'bg-primary text-white'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz._id} quiz={quiz} />
          ))}
        </div>

        {filteredQuizzes.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No quizzes available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
