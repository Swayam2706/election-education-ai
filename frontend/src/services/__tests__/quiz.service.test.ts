import { quizService } from '../quiz.service';

// Mock the base-api.service module properly as a class
jest.mock('../base-api.service', () => {
  return {
    BaseApiService: class MockBaseApiService {
      request = jest.fn();
    },
  };
});

describe('QuizService', () => {
  let mockRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mocked request function from the quizService instance
    mockRequest = (quizService as any).api.request as jest.Mock;
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

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await quizService.getQuizzes();

      expect(result.success).toBe(true);
      expect(result.data?.quizzes).toHaveLength(1);
    });

    it('should handle errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Network error'));

      await expect(quizService.getQuizzes()).rejects.toThrow();
    });
  });

  describe('getQuizById', () => {
    it('should fetch quiz by id', async () => {
      const mockResponse = {
        success: true,
        data: { quiz: { id: '1', title: 'Test Quiz' } },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await quizService.getQuizById('1');

      expect(result.success).toBe(true);
      expect(result.data?.quiz.id).toBe('1');
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

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await quizService.submitQuiz({
        quizId: '1',
        answers: [0, 1, 2],
      });

      expect(result.success).toBe(true);
      expect(result.data?.score).toBe(80);
    });
  });
});
