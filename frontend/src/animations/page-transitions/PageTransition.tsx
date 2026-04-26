/**
 * Page Transition Components
 * Smooth transitions between routes and pages
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAnimationConfig } from '../hooks/useReducedMotion';
import { pageTransition, slideTransition, fadeIn } from '../variants';
import { transitions } from '../transitions';

// ─── Page Transition Wrapper ───
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade' | 'slide' | 'scale';
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className,
  variant = 'fade'
}) => {
  const { fadeIn: safeFadeIn, slideUp: safeSlideUp } = useAnimationConfig();
  
  const getVariants = () => {
    switch (variant) {
      case 'slide':
        return safeSlideUp(slideTransition);
      case 'scale':
        return safeFadeIn({
          hidden: { opacity: 0, scale: 0.95 },
          show: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 }
        });
      case 'fade':
      default:
        return safeFadeIn(pageTransition);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="exit"
      variants={getVariants()}
      transition={transitions.page}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Route Transition Manager ───
interface RouteTransitionProps {
  children: React.ReactNode;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const location = useLocation();
  const { shouldAnimate } = useAnimationConfig();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="hidden"
        animate="show"
        exit="exit"
        variants={shouldAnimate ? pageTransition : {}}
        transition={transitions.page}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Section Transition ───
interface SectionTransitionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({ 
  children, 
  delay = 0,
  className 
}) => {
  const { slideUp: safeSlideUp } = useAnimationConfig();
  
  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={safeSlideUp(fadeIn)}
      transition={{ ...transitions.fadeIn, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// ─── Modal Transition ───
interface ModalTransitionProps {
  isOpen: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const ModalTransition: React.FC<ModalTransitionProps> = ({ 
  isOpen, 
  children, 
  onClose,
  className 
}) => {
  const { shouldAnimate } = useAnimationConfig();

  const backdropVariants = shouldAnimate ? {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
    exit: { opacity: 0 }
  } : {};

  const modalVariants = shouldAnimate ? {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    show: { 
      opacity: 1, 
      scale: 1,
      y: 0
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      y: 10
    }
  } : {};

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial="hidden"
            animate="show"
            exit="exit"
            variants={backdropVariants}
            transition={transitions.modal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial="hidden"
            animate="show"
            exit="exit"
            variants={modalVariants}
            transition={transitions.modal}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              className
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Drawer Transition ───
interface DrawerTransitionProps {
  isOpen: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export const DrawerTransition: React.FC<DrawerTransitionProps> = ({ 
  isOpen, 
  children, 
  onClose,
  side = 'right',
  className 
}) => {
  const { shouldAnimate } = useAnimationConfig();

  const getDrawerVariants = () => {
    if (!shouldAnimate) return {};
    
    const variants = {
      left: {
        hidden: { x: '-100%' },
        show: { x: 0 },
        exit: { x: '-100%' }
      },
      right: {
        hidden: { x: '100%' },
        show: { x: 0 },
        exit: { x: '100%' }
      },
      top: {
        hidden: { y: '-100%' },
        show: { y: 0 },
        exit: { y: '-100%' }
      },
      bottom: {
        hidden: { y: '100%' },
        show: { y: 0 },
        exit: { y: '100%' }
      }
    };
    
    return variants[side];
  };

  const backdropVariants = shouldAnimate ? {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
    exit: { opacity: 0 }
  } : {};

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial="hidden"
            animate="show"
            exit="exit"
            variants={backdropVariants}
            transition={transitions.modal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial="hidden"
            animate="show"
            exit="exit"
            variants={getDrawerVariants()}
            transition={transitions.modal}
            className={cn(
              'fixed z-50 bg-background shadow-xl',
              {
                'left-0 top-0 bottom-0': side === 'left',
                'right-0 top-0 bottom-0': side === 'right',
                'top-0 left-0 right-0': side === 'top',
                'bottom-0 left-0 right-0': side === 'bottom'
              },
              className
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Tab Transition ───
interface TabTransitionProps {
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export const TabTransition: React.FC<TabTransitionProps> = ({ 
  activeTab, 
  children, 
  className 
}) => {
  const { slideUp: safeSlideUp } = useAnimationConfig();

  const tabVariants = safeSlideUp({
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial="hidden"
        animate="show"
        exit="exit"
        variants={tabVariants}
        transition={transitions.fadeIn}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Accordion Transition ───
interface AccordionTransitionProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AccordionTransition: React.FC<AccordionTransitionProps> = ({ 
  isOpen, 
  children, 
  className 
}) => {
  const { shouldAnimate } = useAnimationConfig();

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={shouldAnimate ? { height: 0, opacity: 0 } : {}}
          animate={shouldAnimate ? { height: 'auto', opacity: 1 } : {}}
          exit={shouldAnimate ? { height: 0, opacity: 0 } : {}}
          transition={transitions.dropdown}
          className={cn('overflow-hidden', className)}
        >
          <motion.div
            initial={shouldAnimate ? { y: -10 } : {}}
            animate={shouldAnimate ? { y: 0 } : {}}
            exit={shouldAnimate ? { y: -10 } : {}}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};