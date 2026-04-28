/**
 * Recommendations Component
 * Displays personalized content recommendations for the user
 */

import React from 'react';
import { motion } from 'framer-motion';

interface Recommendation {
  id: string;
  type: 'quiz' | 'article';
  title: string;
  description: string;
  difficulty?: string;
  estimatedTime: number;
}

interface RecommendationsProps {
  recommendations: Recommendation[];
}

/**
 * Recommendations - Shows personalized learning recommendations
 * @param props - Component props
 * @returns Rendered recommendations list
 */
export const Recommendations: React.FC<RecommendationsProps> = ({ recommendations }) => {
  return (
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
        {recommendations && recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
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
  );
};

export default Recommendations;
