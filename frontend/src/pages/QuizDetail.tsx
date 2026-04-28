import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Trophy,
  Target,
  BookOpen,
  Timer,
  AlertCircle
} from 'lucide-react';
import { quizService } from '../services/quiz.service';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { QuizQuestion, QuizResults, QuizTimer, QuizProgress } from '../components/quiz';

/**
 * QuizDetail Component
 * Handles quiz taking, submission, and results display
 * @returns Rendered quiz detail page
 */
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

  // Load quiz data
  useEffect(() => {
    if (id) {
      loadQuiz();
    }
  }, [id]);

  // Timer effect
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

  /**
   * Load quiz data from API
   */
  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuiz(id);
      
      if (response.success && response.data) {
        setQuiz(response.data);
        if (response.data.timeLimit) {
          setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
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

  /**
   * Start the quiz
   */
  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
  };

  /**
   * Handle answer selection
   */
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  /**
   * Navigate to next question
   */
  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  /**
   * Navigate to previous question
   */
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  /**
   * Submit quiz and get results
   */
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

  /**
   * Format time in MM:SS format
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Calculate progress percentage
   */
  const getProgressPercentage = (): number => {
    return ((currentQuestion + 1) / quiz.questions.length) * 100;
  };

  /**
   * Get count of answered questions
   */
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
            <a href="/login" className="btn-primary">
              Sign In to Continue
            </a>
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

  if (!quiz) {
    return null;
  }

  // Quiz Results View
  if (quizCompleted && results) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 text-center mb-8"
          >
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-foreground mb-4">Quiz Completed!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-accent/50 p-6 rounded-xl">
                <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{results.score} / {results.questions?.length || quiz.questions.length}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div className="bg-accent/50 p-6 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{results.percentage}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="bg-accent/50 p-6 rounded-xl">
                <Timer className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{formatTime(results.timeSpent)}</div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/quiz')}
                className="btn-secondary"
              >
                More Quizzes
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>
            </div>
          </motion.div>

          {/* Detailed Results */}
          {results.questions && results.questions.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Review Your Answers</h2>
              
              {results.questions.map((questionResult, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-6"
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      questionResult.isCorrect 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {questionResult.isCorrect ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Question {index + 1}
                      </h3>
                      <p className="text-foreground">{questionResult.question}</p>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {questionResult.options.map((option, optionIndex) => {
                      const isCorrect = optionIndex === questionResult.correctAnswer;
                      const isUserAnswer = optionIndex === questionResult.userAnswer;
                      
                      let className = 'p-3 rounded-lg border-2 ';
                      if (isCorrect) {
                        className += 'border-green-500 bg-green-500/10 text-green-700';
                      } else if (isUserAnswer && !isCorrect) {
                        className += 'border-red-500 bg-red-500/10 text-red-700';
                      } else {
                        className += 'border-border bg-accent/30 text-muted-foreground';
                      }

                      return (
                        <div key={optionIndex} className={className}>
                          <div className="flex items-center gap-2">
                            {isCorrect && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                            <span>{option}</span>
                            {isCorrect && <span className="ml-auto text-xs font-semibold">Correct Answer</span>}
                            {isUserAnswer && !isCorrect && <span className="ml-auto text-xs font-semibold">Your Answer</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {questionResult.explanation && (
                    <div className="bg-blue-500/10 border-2 border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-1">Explanation</h4>
                          <p className="text-sm text-foreground">{questionResult.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz Start Screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-lg text-muted-foreground mb-6">{quiz.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-accent/50 p-6 rounded-xl text-center">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{quiz.questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="bg-accent/50 p-6 rounded-xl text-center">
                <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{quiz.difficulty}</div>
                <div className="text-sm text-muted-foreground">Difficulty</div>
              </div>
              <div className="bg-accent/50 p-6 rounded-xl text-center">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}
                </div>
                <div className="text-sm text-muted-foreground">Time Limit</div>
              </div>
              <div className="bg-accent/50 p-6 rounded-xl text-center">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{quiz.category}</div>
                <div className="text-sm text-muted-foreground">Category</div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={startQuiz}
                className="btn-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto"
              >
                Start Quiz
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Taking Interface
  const question = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft < 300 ? 'bg-destructive/10 text-destructive' : 'bg-accent/50 text-foreground'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <span>{getAnsweredCount()} answered</span>
            </div>
            <div className="w-full bg-accent/30 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card p-8 mb-6"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion, index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    answers[currentQuestion] === index
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === index
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}>
                      {answers[currentQuestion] === index && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-3">
              {currentQuestion === quiz.questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting || getAnsweredCount() === 0}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Quiz
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="btn-primary flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}