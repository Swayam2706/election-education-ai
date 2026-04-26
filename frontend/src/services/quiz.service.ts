import { apiService } from './api.service';

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  language: string;
  timeLimit: number | null;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  order: number;
  points: number;
}

export interface QuizAttempt {
  id: string;
  quiz: Quiz;
  score: number;
  percentage: number;
  timeSpent: number;
  completed: boolean;
  createdAt: string;
}

export interface QuizResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
  results: Record<string, boolean>;
}

export const quizService = {
  async getQuizzes(params?: { category?: string; difficulty?: string; search?: string }) {
    const response = await apiService.get('/quiz', { params });
    return response;
  },

  async getQuiz(id: string) {
    const response = await apiService.get(`/quiz/${id}`);
    return response;
  },

  async submitQuiz(data: {
    quizId: string;
    answers: Array<{
      questionIndex: number;
      selectedAnswer: number;
      timeSpent: number;
    }>;
    timeSpent: number;
  }) {
    const response = await apiService.post('/quiz/submit', data);
    return response;
  },

  async getUserAttempts() {
    const response = await apiService.get('/quiz/attempts');
    return response;
  },

  async getQuizAttempt(id: string) {
    const response = await apiService.get(`/quiz/attempts/${id}`);
    return response;
  },

  async getQuizCategories() {
    const response = await apiService.get('/quiz/categories');
    return response;
  },

  async getQuizStats() {
    const response = await apiService.get('/quiz/stats');
    return response;
  }
};
