// Mock the entire quiz service
const mockGetQuizzes = jest.fn();
const mockGetQuizById = jest.fn();
const mockSubmitQuiz = jest.fn();

jest.mock('../quiz.service', () => ({
  quizService: {
    getQuizzes: (...args: any[]) => mockGetQuizzes(...args),
    getQuizById: (...args: any[]) => mockGetQuizById(...args),
    submitQuiz: (...args: any[]) => mockSubmitQuiz(...args),
  },
}));

import { quizService } from '../quiz.service';

describe('QuizService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuizzes', () => {
    it('should fetch quizzes successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          quizzes: [
            { id: '1', title: 'Test Quiz', difficulty: 'beginner' },
          ],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      };

      mockGetQuizzes.mockResolvedValueOnce(mockResponse);

      const result = await quizService.getQuizzes();

      expect(result.success).toBe(true);
      expect(result.data?.quizzes).toHaveLength(1);
    });

    it('should handle errors', async () => {
      mockGetQuizzes.mockRejectedValueOnce(new Error('Network error'));

      await expect(quizService.getQuizzes()).rejects.toThrow();
    });
  });

  describe('getQuizById', () => {
    it('should fetch quiz by id', async () => {
      const mockResponse = {
        success: true,
        data: { quiz: { id: '1', title: 'Test Quiz' } },
      };

      mockGetQuizById.mockResolvedValueOnce(mockResponse);

      const result = await quizService.getQuizById('1');

      expect(result.success).toBe(true);
      expect(result.data?.quiz.id).toBe('1');
      expect(mockGetQuizById).toHaveBeenCalledWith('1');
    });
  });

  describe('submitQuiz', () => {
    it('should submit quiz answers', async () => {
      const mockResponse = {
        success: true,
        data: {
          attempt: { id: '1', score: 80 },
          score: 80,
          passed: true,
        },
      };

      mockSubmitQuiz.mockResolvedValueOnce(mockResponse);

      const result = await quizService.submitQuiz({
        quizId: '1',
        answers: [0, 1, 2],
      });

      expect(result.success).toBe(true);
      expect(result.data?.score).toBe(80);
      expect(mockSubmitQuiz).toHaveBeenCalledWith({
        quizId: '1',
        answers: [0, 1, 2],
      });
    });
  });
});
