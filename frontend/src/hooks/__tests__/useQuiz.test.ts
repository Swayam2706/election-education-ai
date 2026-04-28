import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuiz } from '../useQuiz';
import { quizService } from '../../services/quiz.service';

jest.mock('../../services/quiz.service');

describe('useQuiz', () => {
  const mockQuiz = {
    id: '1',
    title: 'Test Quiz',
    questions: [
      { question: 'Q1', options: ['A', 'B'], correctAnswer: 0, explanation: 'E1' },
      { question: 'Q2', options: ['C', 'D'], correctAnswer: 1, explanation: 'E2' },
    ],
    difficulty: 'beginner' as const,
    category: 'test',
    description: 'Test',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load quiz successfully', async () => {
    (quizService.getQuizById as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { quiz: mockQuiz },
    });

    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await result.current.loadQuiz('1');
    });

    await waitFor(() => {
      expect(result.current.quiz).toEqual(mockQuiz);
      expect(result.current.answers).toHaveLength(2);
    });
  });

  it('should select answer', async () => {
    (quizService.getQuizById as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { quiz: mockQuiz },
    });

    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await result.current.loadQuiz('1');
    });

    act(() => {
      result.current.selectAnswer(0, 1);
    });

    expect(result.current.answers[0]).toBe(1);
  });

  it('should navigate questions', async () => {
    (quizService.getQuizById as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { quiz: mockQuiz },
    });

    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await result.current.loadQuiz('1');
    });

    act(() => {
      result.current.nextQuestion();
    });

    expect(result.current.currentQuestion).toBe(1);

    act(() => {
      result.current.previousQuestion();
    });

    expect(result.current.currentQuestion).toBe(0);
  });

  it('should submit quiz', async () => {
    (quizService.getQuizById as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { quiz: mockQuiz },
    });

    (quizService.submitQuiz as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        score: 80,
        passed: true,
        attempt: { id: '1', score: 80 },
      },
    });

    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await result.current.loadQuiz('1');
    });

    await act(async () => {
      result.current.selectAnswer(0, 0);
      result.current.selectAnswer(1, 1);
    });

    await act(async () => {
      await result.current.submitQuiz();
    });

    await waitFor(() => {
      expect(result.current.score).toBe(80);
      expect(result.current.loading).toBe(false);
    });
  });
});
