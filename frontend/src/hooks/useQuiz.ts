// Custom hook for quiz functionality
import { useState, useCallback } from 'react';
import { quizService } from '../services/quiz.service';
import { Quiz, QuizAttempt } from '../types';
import toast from 'react-hot-toast';

interface UseQuizReturn {
  quiz: Quiz | null;
  loading: boolean;
  error: string | null;
  currentQuestion: number;
  answers: number[];
  score: number | null;
  attempt: QuizAttempt | null;
  loadQuiz: (quizId: string) => Promise<void>;
  selectAnswer: (questionIndex: number, answerIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => Promise<void>;
  resetQuiz: () => void;
}

export const useQuiz = (): UseQuizReturn => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

  const loadQuiz = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await quizService.getQuizById(quizId);
      
      if (response.success && response.data) {
        setQuiz(response.data.quiz);
        setAnswers(new Array(response.data.quiz.questions.length).fill(-1));
        setCurrentQuestion(0);
        setScore(null);
        setAttempt(null);
      } else {
        throw new Error(response.error?.message || 'Failed to load quiz');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load quiz';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectAnswer = useCallback((questionIndex: number, answerIndex: number) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = answerIndex;
      return newAnswers;
    });
  }, []);

  const nextQuestion = useCallback(() => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [quiz, currentQuestion]);

  const previousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const submitQuiz = useCallback(async () => {
    if (!quiz) return;

    // Check if all questions are answered
    const unanswered = answers.findIndex(a => a === -1);
    if (unanswered !== -1) {
      toast.error(`Please answer question ${unanswered + 1} before submitting`);
      setCurrentQuestion(unanswered);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await quizService.submitQuiz({
        quizId: quiz.id,
        answers,
      });

      if (response.success && response.data) {
        setScore(response.data.score);
        setAttempt(response.data.attempt);
        
        if (response.data.passed) {
          toast.success(`Congratulations! You scored ${response.data.score}%`);
        } else {
          toast.error(`You scored ${response.data.score}%. Try again!`);
        }
      } else {
        throw new Error(response.error?.message || 'Failed to submit quiz');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit quiz';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [quiz, answers]);

  const resetQuiz = useCallback(() => {
    if (quiz) {
      setAnswers(new Array(quiz.questions.length).fill(-1));
      setCurrentQuestion(0);
      setScore(null);
      setAttempt(null);
      setError(null);
    }
  }, [quiz]);

  return {
    quiz,
    loading,
    error,
    currentQuestion,
    answers,
    score,
    attempt,
    loadQuiz,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
  };
};

export default useQuiz;
