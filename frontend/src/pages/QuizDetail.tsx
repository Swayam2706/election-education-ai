/**
 * QuizDetail Component
 * Main quiz page that orchestrates quiz flow
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle } from 'lucide-react';
import { quizService } from '../services/quiz.service';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';
import { QuizStartScreen } from '../components/quiz/QuizStartScreen';
import { QuizTakingScreen } from '../components/quiz/QuizTakingScreen';
import { QuizResultsScreen } from '../components/quiz/QuizResultsScreen';

export default function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadQuiz();
  }, [id]);

  useEffect(() => {
    let timer;
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, timeLeft]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuiz(id);
      
      if (response.success && response.data) {
        setQuiz(response.data);
        if (response.data.timeLimit) {
          setTimeLeft(response.data.timeLimit * 60);
        }
      } else {
        setError('Quiz not found');
      }
    } catch (err) {
      logger.error('Failed to load quiz', err);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      const submissionData = {
        quizId: id,
        answers: Object.entries(answers).map(([questionIndex, answerIndex]) => ({
          questionIndex: parseInt(questionIndex),
          selectedAnswer: answerIndex,
          timeSpent: quiz.timeLimit ? (quiz.timeLimit * 60 - timeLeft) : 0
        })),
        timeSpent: quiz.timeLimit ? (quiz.timeLimit * 60 - timeLeft) : 0
      };

      const response = await quizService.submitQuiz(submissionData);
      
      if (response.success && response.data) {
        setResults(response.data);
        setQuizCompleted(true);
        toast.success('Quiz submitted successfully!');
      } else {
        throw new Error(response.error?.message || 'Failed to submit quiz');
      }
    } catch (err) {
      logger.error('Failed to submit quiz', err);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((currentQuestion + 1) / quiz.questions.length) * 100;
  };

  const getAnsweredCount = (): number => {
    return Object.keys(answers).length;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Quiz Access Required</h1>
            <p className="text-muted-foreground mb-6">
              Please log in to take this quiz and track your progress.
            </p>
            <a href="/login" className="btn-primary">Sign In to Continue</a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Quiz Not Found</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button onClick={() => navigate('/quiz')} className="btn-primary">
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  if (quizCompleted && results) {
    return (
      <QuizResultsScreen
        results={results}
        totalQuestions={quiz.questions.length}
        formatTime={formatTime}
      />
    );
  }

  if (!quizStarted) {
    return <QuizStartScreen quiz={quiz} onStart={startQuiz} />;
  }

  return (
    <QuizTakingScreen
      quiz={quiz}
      currentQuestion={currentQuestion}
      answers={answers}
      timeLeft={timeLeft}
      submitting={submitting}
      formatTime={formatTime}
      getProgressPercentage={getProgressPercentage}
      getAnsweredCount={getAnsweredCount}
      onAnswerSelect={handleAnswerSelect}
      onPrevious={prevQuestion}
      onNext={nextQuestion}
      onSubmit={handleSubmitQuiz}
    />
  );
}
