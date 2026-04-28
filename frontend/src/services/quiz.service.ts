/**
 * Quiz Service
 * Handles all quiz-related API operations including fetching quizzes,
 * submitting answers, and retrieving quiz attempts
 * @extends BaseApiService
 */
import BaseApiService from './base-api.service';
import { ApiResponse, Quiz, QuizAttempt, Pagination } from '../types';

interface QuizListResponse {
  quizzes: Quiz[];
  pagination: Pagination;
}

interface QuizDetailResponse {
  quiz: Quiz;
}

interface QuizAttemptResponse {
  attempt: QuizAttempt;
  score: number;
  passed: boolean;
}

interface QuizAttemptsResponse {
  attempts: QuizAttempt[];
  pagination: Pagination;
}

interface SubmitQuizRequest {
  quizId: string;
  answers: number[];
  timeSpent?: number;
}

/**
 * Quiz Service
 * Handles all quiz-related API operations including fetching quizzes,
 * submitting answers, and retrieving quiz attempts
 * @extends BaseApiService
 */
class QuizService extends BaseApiService {
  private readonly endpoint = '/quiz';

  /**
   * Get all quizzes with optional filters
   * @param params - Optional filter parameters
   * @param params.category - Filter by quiz category
   * @param params.difficulty - Filter by difficulty level
   * @param params.page - Page number for pagination
   * @param params.limit - Number of items per page
   * @returns Promise resolving to quiz list with pagination
   */
  async getQuizzes(params?: {
    category?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<QuizListResponse>> {
    return this.get<QuizListResponse>(this.endpoint, {
      params,
    });
  }

  /**
   * Get a specific quiz by ID
   */
  async getQuizById(quizId: string): Promise<ApiResponse<QuizDetailResponse>> {
    return this.get<QuizDetailResponse>(`${this.endpoint}/${quizId}`);
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(data: SubmitQuizRequest): Promise<ApiResponse<QuizAttemptResponse>> {
    return this.post<QuizAttemptResponse>(`${this.endpoint}/submit`, data);
  }

  /**
   * Get user's quiz attempts
   */
  async getMyAttempts(params?: {
    quizId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<QuizAttemptsResponse>> {
    return this.get<QuizAttemptsResponse>(`${this.endpoint}/attempts`, {
      params,
    });
  }

  /**
   * Get a specific quiz attempt
   */
  async getAttemptById(attemptId: string): Promise<ApiResponse<{ attempt: QuizAttempt }>> {
    return this.get<{ attempt: QuizAttempt }>(`${this.endpoint}/attempts/${attemptId}`);
  }

  /**
   * Get quiz statistics
   */
  async getQuizStats(quizId: string): Promise<ApiResponse<{
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    userBestScore?: number;
  }>> {
    return this.get(`${this.endpoint}/${quizId}/stats`);
  }

  /**
   * Get quiz categories
   */
  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.get<{ categories: string[] }>(`${this.endpoint}/categories`);
  }
}

export const quizService = new QuizService();
export default quizService;
