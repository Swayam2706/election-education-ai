/**
 * Animated Layout Component
 * Main layout wrapper with page transitions and global animations
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { AnimatedNavbar } from '../AnimatedNavbar';
import Footer from '../Footer';
import { PageTransition } from '../../animations/page-transitions/PageTransition';
import { ScrollProgress } from '../../animations/scroll-effects/ScrollAnimations';
import { useAnimationConfig } from '../../animations/hooks/useReducedMotion';
import { cn } from '../../lib/utils';

interface AnimatedLayoutProps {
  children: React.ReactNode;
  className?: string;
  showNavbar?: boolean;
  showFooter?: boolean;
  showScrollProgress?: boolean;
  variant?: 'default' | 'minimal' | 'fullscreen';
}

export const AnimatedLayout: React.FC<AnimatedLayoutProps> = ({
  children,
  className,
  showNavbar = true,
  showFooter = true,
  showScrollProgress = true,
  variant = 'default'
}) => {
  const location = useLocation();
  const { shouldAnimate } = useAnimationConfig();

  const getLayoutClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'min-h-screen bg-background';
      case 'fullscreen':
        return 'h-screen overflow-hidden bg-background';
      case 'default':
      default:
        return 'min-h-screen bg-background flex flex-col';
    }
  };

  const layoutVariants = shouldAnimate ? {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  } : {};

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={layoutVariants}
      className={cn(getLayoutClasses(), className)}
    >
      {/* Scroll Progress Indicator */}
      {showScrollProgress && <ScrollProgress />}

      {/* Navigation */}
      {showNavbar && <AnimatedNavbar />}

      {/* Main Content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          className={cn(
            variant === 'fullscreen' ? 'flex-1 overflow-auto' : 'flex-1',
            showNavbar && 'pt-16'
          )}
        >
          <PageTransition variant="fade">
            {children}
          </PageTransition>
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      {showFooter && variant !== 'fullscreen' && <Footer />}

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={shouldAnimate ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          } : {}}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"
          animate={shouldAnimate ? {
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          } : {}}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <motion.div
          className="absolute top-1/2 right-1/3 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl"
          animate={shouldAnimate ? {
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          } : {}}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>
    </motion.div>
  );
};

// ─── Specialized Layout Variants ───

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AnimatedLayout variant="default" showScrollProgress={true}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  </AnimatedLayout>
);

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AnimatedLayout variant="minimal" showNavbar={false} showFooter={false}>
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {children}
      </motion.div>
    </div>
  </AnimatedLayout>
);

export const FullscreenLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AnimatedLayout variant="fullscreen" showNavbar={false} showFooter={false} showScrollProgress={false}>
    {children}
  </AnimatedLayout>
);

export const LandingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AnimatedLayout variant="default" showScrollProgress={true}>
    {children}
  </AnimatedLayout>
);