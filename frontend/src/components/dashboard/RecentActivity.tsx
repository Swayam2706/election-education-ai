/**
 * RecentActivity Component
 * Displays user's recent learning activities
 */

import React from 'react';
import { motion } from 'framer-motion';

interface Activity {
  id: string;
  type: 'quiz' | 'article' | 'chat';
  title: string;
  timestamp: string;
  score?: number;
}

interface RecentActivityProps {
  activities: Activity[];
}

/**
 * RecentActivity - Shows list of recent user activities
 * @param props - Component props
 * @returns Rendered activity list
 */
export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
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
        {activities && activities.length > 0 ? (
          <div className="space-y-2">
            {activities.map((activity, index) => (
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
  );
};

export default RecentActivity;
