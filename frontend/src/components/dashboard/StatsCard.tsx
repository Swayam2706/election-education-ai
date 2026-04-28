/**
 * StatsCard Component
 * Displays a single statistic with icon, value, and optional trend indicator
 */

import React from 'react';
import { motion } from 'framer-motion';
import { hoverLift } from '../../animations/variants';
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  } | null;
  className?: string;
  delay?: number;
}

/**
 * StatsCard - Animated card component for displaying statistics
 * @param props - Component props
 * @returns Rendered stats card
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend = null,
  className = '',
  delay = 0,
}) => {
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

export default StatsCard;
