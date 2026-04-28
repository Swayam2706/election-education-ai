// Dashboard Service - Domain-specific API abstraction
import BaseApiService from './base-api.service';
import { ApiResponse } from '../types';

interface DashboardStats {
  quizzesCompleted: number;
  articlesRead: number;
  chatMessages: number;
  totalScore: number;
}

interface UserProgress {
  recentQuizzes: Array<{
    id: string;
    title: string;
    score: number;
    completedAt: string;
  }>;
  recentContent: Array<{
    id: string;
    title: string;
    type: string;
    readAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

class DashboardService extends BaseApiService {
  private readonly endpoint = '/dashboard';

  async getStats(): Promise<ApiResponse<{ stats: DashboardStats }>> {
    return this.get<{ stats: DashboardStats }>(`${this.endpoint}/stats`);
  }

  async getUserProgress(): Promise<ApiResponse<UserProgress>> {
    return this.get<UserProgress>(`${this.endpoint}/progress`);
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
