import { quizService } from '../quiz.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('QuizService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuizzes', () => {
    it('should fetch quizzes successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            quizzes: [
              { id: '1', title: 'Test Quiz', difficulty: 'beginner' },
            ],
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
          },
        },
      };

      mockedAxios.request.mockResolvedValueOnce(mockResponse);

      const result = await quizService.getQuizzes();

      expect(result.success).toBe(true);
      expect(result.data?.quizzes).toHaveLength(1);
    });

    it('should handle errors', async () => {
      mockedAxios.request.mockRejectedValueOnce(new Error('Network error'));

      await expect(quizService.getQuizzes()).rejects.toThrow();
    });
  });

  describe('getQuizById', () => {
    it('should fetch quiz by id', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { quiz: { id: '1', title: 'Test Quiz' } },
        },
      };

      mockedAxios.request.mockResolvedValueOnce(mockResponse);

      const result = await quizService.getQuizById('1');

      expect(result.success).toBe(true);
      expect(result.data?.quiz.id).toBe('1');
    });
  });

  describe('submitQuiz', () => {
    it('should submit quiz answers', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            attempt: { id: '1', score: 80 },
            score: 80,
            passed: true,
          },
        },
      };

      mockedAxios.request.mockResolvedValueOnce(mockResponse);

      const result = await quizService.submitQuiz({
        quizId: '1',
        answers: [0, 1, 2],
      });

      expect(result.success).toBe(true);
      expect(result.data?.score).toBe(80);
    });
  });
});
