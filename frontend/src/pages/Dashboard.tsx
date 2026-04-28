// Enterprise Dashboard with Dynamic Data and Animations

import React, { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/dashboard.service';
import { queryKeys } from '../lib/react-query';
import { Loading, CardSkeleton, ListSkeleton } from '../components/Loading';
import { ComponentErrorBoundary } from '../components/ErrorBoundary';
import { useUI } from '../store/useAppStore';

// Import animation components and variants
import {
  AnimatedContainer,
  StaggerContainer
} from '../animations/motion-components/AnimatedContainer';
import {
  staggerContainer,
  fadeUp,
  hoverLift
} from '../animations/variants';
import { useReducedMotion } from '../animations/hooks/useReducedMotion';

// Types
interface DashboardStats {
  totalUsers: number;
  totalQuizzes: number;
  totalContent: number;
  totalViews: number;
  userProgress: {
    quizzesCompleted: number;
    articlesRead: number;
    totalScore: number;
    rank: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'quiz' | 'article' | 'chat';
    title: string;
    timestamp: string;
    score?: number;
  }>;
  recommendations: Array<{
    id: string;
    type: 'quiz' | 'article';
    title: string;
    description: string;
    difficulty?: string;
    estimatedTime: number;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    type: 'election' | 'deadline' | 'event';
    importance: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

// Dashboard API functions
const dashboardAPI = {
  getStats: async () => {
    const response = await dashboardService.getStats();
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to fetch dashboard stats');
  },
  
  getUserProgress: async () => {
    const response = await dashboardService.getUserProgress();
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to fetch user progress');
  },
};

// Stats Card Component with Animation
const StatsCard = ({ title, value, icon, trend = null, className = '', delay = 0 }: any) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}
      variants={prefersReducedMotion ? {} : hoverLift}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      custom={delay}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const { user } = useAuth();
  const { addNotification } = useUI();

  // Fetch dashboard data
  const { data: stats, isLoading, error } = useQuery({
    queryKey: queryKeys.analytics.dashboard(),
    queryFn: dashboardAPI.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  }) as { data: DashboardStats | undefined; isLoading: boolean; error: Error | null };

  // Show welcome notification for new users
  React.useEffect(() => {
    if (user && stats) {
      const isNewUser = stats.userProgress?.quizzesCompleted === 0 && stats.userProgress?.articlesRead === 0;
      
      if (isNewUser) {
        addNotification({
          type: 'info',
          title: 'Welcome to Election Education!',
          message: 'Start your civic education journey by taking a quiz or reading an article.',
        });
      }
    }
  }, [user, stats, addNotification]);

  if (isLoading) {
    return (
      <AnimatedContainer className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          </div>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </StaggerContainer>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ListSkeleton items={3} />
            <ListSkeleton items={3} />
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  if (error) {
    return (
      <AnimatedContainer className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Failed to load dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please try refreshing the page
            </p>
            <motion.button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Refresh Page
            </motion.button>
          </motion.div>
        </div>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.h1 
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Welcome back, {user?.name}!
          </motion.h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Continue your civic education journey
          </motion.p>
        </div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <ComponentErrorBoundary componentName="QuizzesCompletedCard">
            <StatsCard
              title="Quizzes Completed"
              value={stats?.userProgress?.quizzesCompleted || 0}
              icon={
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              delay={0}
            />
          </ComponentErrorBoundary>

          <ComponentErrorBoundary componentName="ArticlesReadCard">
            <StatsCard
              title="Articles Read"
              value={stats?.userProgress?.articlesRead || 0}
              icon={
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              delay={0.1}
            />
          </ComponentErrorBoundary>

          <ComponentErrorBoundary componentName="TotalScoreCard">
            <StatsCard
              title="Total Score"
              value={stats?.userProgress?.totalScore || 0}
              icon={
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              }
              delay={0.2}
            />
          </ComponentErrorBoundary>

          <ComponentErrorBoundary componentName="RankCard">
            <StatsCard
              title="Your Rank"
              value={`#${stats?.userProgress?.rank || 'N/A'}`}
              icon={
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              delay={0.3}
            />
          </ComponentErrorBoundary>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <ComponentErrorBoundary componentName="RecentActivity">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h2>
              </div>
              <div className="p-6">
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recentActivity.map((activity, index) => (
                      <motion.div 
                        key={activity.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (index * 0.1) }}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        {activity.score && (
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            {activity.score}%
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No recent activity. Start learning to see your progress here!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </ComponentErrorBoundary>

          {/* Recommendations */}
          <ComponentErrorBoundary componentName="Recommendations">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recommended for You
                </h2>
              </div>
              <div className="p-6">
                {stats?.recommendations && stats.recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recommendations.map((recommendation, index) => (
                      <motion.div 
                        key={recommendation.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + (index * 0.1) }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {recommendation.title}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            recommendation.type === 'quiz' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {recommendation.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {recommendation.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          {recommendation.difficulty && (
                            <span>Difficulty: {recommendation.difficulty}</span>
                          )}
                          <span>{recommendation.estimatedTime} min</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      Complete more activities to get personalized recommendations!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </ComponentErrorBoundary>
        </div>
      </div>
    </AnimatedContainer>
  );
}