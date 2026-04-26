/**
 * Animated Container Components
 * Reusable containers with built-in animations
 */

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAnimationConfig } from '../hooks/useReducedMotion';
import { fadeUp, fadeIn, slideLeft, slideRight, scaleIn, staggerContainer } from '../variants';
import { transitions } from '../transitions';

// ─── Base Animated Container ───
interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
  variant?: 'fadeIn' | 'fadeUp' | 'slideLeft' | 'slideRight' | 'scaleIn';
  delay?: number;
  stagger?: boolean;
  children: React.ReactNode;
}

export const AnimatedContainer = forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ variant = 'fadeUp', delay = 0, stagger = false, className, children, ...props }, ref) => {
    const { fadeIn: safeFadeIn, slideUp: safeSlideUp } = useAnimationConfig();
    
    const getVariants = () => {
      switch (variant) {
        case 'fadeIn':
          return safeFadeIn(fadeIn);
        case 'fadeUp':
          return safeSlideUp(fadeUp);
        case 'slideLeft':
          return safeSlideUp(slideLeft);
        case 'slideRight':
          return safeSlideUp(slideRight);
        case 'scaleIn':
          return safeFadeIn(scaleIn);
        default:
          return safeSlideUp(fadeUp);
      }
    };

    const containerVariants = stagger ? staggerContainer : getVariants();

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="show"
        variants={containerVariants}
        transition={{ ...transitions.fadeIn, delay }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedContainer.displayName = 'AnimatedContainer';

// ─── Fade In Container ───
interface FadeInContainerProps extends HTMLMotionProps<'div'> {
  delay?: number;
  children: React.ReactNode;
}

export const FadeInContainer = forwardRef<HTMLDivElement, FadeInContainerProps>(
  ({ delay = 0, className, children, ...props }, ref) => {
    const { fadeIn: safeFadeIn } = useAnimationConfig();
    
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="show"
        variants={safeFadeIn(fadeIn)}
        transition={{ ...transitions.fadeIn, delay }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

FadeInContainer.displayName = 'FadeInContainer';

// ─── Slide Up Container ───
interface SlideUpContainerProps extends HTMLMotionProps<'div'> {
  delay?: number;
  children: React.ReactNode;
}

export const SlideUpContainer = forwardRef<HTMLDivElement, SlideUpContainerProps>(
  ({ delay = 0, className, children, ...props }, ref) => {
    const { slideUp: safeSlideUp } = useAnimationConfig();
    
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="show"
        variants={safeSlideUp(fadeUp)}
        transition={{ ...transitions.slideUp, delay }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

SlideUpContainer.displayName = 'SlideUpContainer';

// ─── Stagger Container ───
interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
  childDelay?: number;
  children: React.ReactNode;
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ staggerDelay = 0.1, childDelay = 0.1, className, children, ...props }, ref) => {
    const { shouldAnimate } = useAnimationConfig();
    
    const variants = shouldAnimate ? {
      hidden: {},
      show: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: childDelay
        }
      }
    } : {};

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="show"
        variants={variants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerContainer.displayName = 'StaggerContainer';

// ─── Grid Container with Stagger ───
interface AnimatedGridProps extends HTMLMotionProps<'div'> {
  cols?: number;
  gap?: number;
  staggerDelay?: number;
  children: React.ReactNode;
}

export const AnimatedGrid = forwardRef<HTMLDivElement, AnimatedGridProps>(
  ({ cols = 3, gap = 6, staggerDelay = 0.1, className, children, ...props }, ref) => {
    const { shouldAnimate } = useAnimationConfig();
    
    const gridClass = cn(
      `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-${gap}`,
      className
    );

    const variants = shouldAnimate ? staggerContainer : {};

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="show"
        variants={variants}
        className={gridClass}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedGrid.displayName = 'AnimatedGrid';

// ─── Section Container ───
interface AnimatedSectionProps extends HTMLMotionProps<'section'> {
  variant?: 'fadeIn' | 'fadeUp' | 'slideLeft' | 'slideRight';
  delay?: number;
  children: React.ReactNode;
}

export const AnimatedSection = forwardRef<HTMLElement, AnimatedSectionProps>(
  ({ variant = 'fadeUp', delay = 0, className, children, ...props }, ref) => {
    const { fadeIn: safeFadeIn, slideUp: safeSlideUp } = useAnimationConfig();
    
    const getVariants = () => {
      switch (variant) {
        case 'fadeIn':
          return safeFadeIn(fadeIn);
        case 'fadeUp':
          return safeSlideUp(fadeUp);
        case 'slideLeft':
          return safeSlideUp(slideLeft);
        case 'slideRight':
          return safeSlideUp(slideRight);
        default:
          return safeSlideUp(fadeUp);
      }
    };

    return (
      <motion.section
        ref={ref}
        initial="hidden"
        animate="show"
        variants={getVariants()}
        transition={{ ...transitions.fadeIn, delay }}
        className={className}
        {...props}
      >
        {children}
      </motion.section>
    );
  }
);

AnimatedSection.displayName = 'AnimatedSection';

// ─── List Container ───
interface AnimatedListProps extends HTMLMotionProps<'ul'> {
  staggerDelay?: number;
  children: React.ReactNode;
}

export const AnimatedList = forwardRef<HTMLUListElement, AnimatedListProps>(
  ({ staggerDelay = 0.1, className, children, ...props }, ref) => {
    const { shouldAnimate } = useAnimationConfig();
    
    const variants = shouldAnimate ? staggerContainer : {};

    return (
      <motion.ul
        ref={ref}
        initial="hidden"
        animate="show"
        variants={variants}
        className={className}
        {...props}
      >
        {children}
      </motion.ul>
    );
  }
);

AnimatedList.displayName = 'AnimatedList';

// ─── List Item ───
interface AnimatedListItemProps extends HTMLMotionProps<'li'> {
  index?: number;
  children: React.ReactNode;
}

export const AnimatedListItem = forwardRef<HTMLLIElement, AnimatedListItemProps>(
  ({ index = 0, className, children, ...props }, ref) => {
    const { slideUp: safeSlideUp } = useAnimationConfig();
    
    return (
      <motion.li
        ref={ref}
        custom={index}
        variants={safeSlideUp(fadeUp)}
        className={className}
        {...props}
      >
        {children}
      </motion.li>
    );
  }
);

AnimatedListItem.displayName = 'AnimatedListItem';

// ─── Page Container ───
interface PageContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, children, ...props }, ref) => {
    const { fadeIn: safeFadeIn } = useAnimationConfig();

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="show"
        variants={safeFadeIn(fadeIn)}
        transition={transitions.page}
        className={cn('min-h-screen', className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

PageContainer.displayName = 'PageContainer';
