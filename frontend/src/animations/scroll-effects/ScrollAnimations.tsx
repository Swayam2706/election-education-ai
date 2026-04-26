/**
 * Scroll Animation Components
 * Reveal animations triggered by scroll position
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAnimationConfig } from '../hooks/useReducedMotion';
import { fadeUp, fadeIn, slideLeft, slideRight, scaleIn } from '../variants';
import { transitions } from '../transitions';

// ─── Scroll Reveal ───
interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scaleIn';
  delay?: number;
  threshold?: number;
  margin?: string;
  className?: string;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fadeUp',
  delay = 0,
  threshold = 0.1,
  margin = '-100px',
  className,
  once = true
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once, 
    margin,
    amount: threshold 
  });
  const { fadeIn: safeFadeIn, slideUp: safeSlideUp } = useAnimationConfig();

  const getVariants = () => {
    switch (variant) {
      case 'fadeIn':
        return safeFadeIn(fadeIn);
      case 'slideLeft':
        return safeSlideUp(slideLeft);
      case 'slideRight':
        return safeSlideUp(slideRight);
      case 'scaleIn':
        return safeFadeIn(scaleIn);
      case 'fadeUp':
      default:
        return safeSlideUp(fadeUp);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      variants={getVariants()}
      transition={{ ...transitions.fadeIn, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Stagger Scroll Reveal ───
interface StaggerScrollRevealProps {
  children: React.ReactNode;
  staggerDelay?: number;
  childDelay?: number;
  className?: string;
  once?: boolean;
}

export const StaggerScrollReveal: React.FC<StaggerScrollRevealProps> = ({
  children,
  staggerDelay = 0.1,
  childDelay = 0.1,
  className,
  once = true
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-100px' });
  const { shouldAnimate } = useAnimationConfig();

  const containerVariants = shouldAnimate ? {
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
      animate={isInView ? "show" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Parallax Scroll ───
interface ParallaxScrollProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}

export const ParallaxScroll: React.FC<ParallaxScrollProps> = ({
  children,
  offset = 50,
  className
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const { shouldAnimate } = useAnimationConfig();
  
  const y = useTransform(scrollYProgress, [0, 1], [0, shouldAnimate ? offset : 0]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Scroll Progress ───
interface ScrollProgressProps {
  className?: string;
  color?: string;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  className,
  color = 'bg-primary'
}) => {
  const { scrollYProgress } = useScroll();
  const { shouldAnimate } = useAnimationConfig();

  if (!shouldAnimate) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        'fixed top-0 left-0 right-0 h-1 z-50 origin-left',
        color,
        className
      )}
      style={{ scaleX: scrollYProgress }}
    />
  );
};

// ─── Scroll Triggered Counter ───
interface ScrollCounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export const ScrollCounter: React.FC<ScrollCounterProps> = ({
  from,
  to,
  duration = 2,
  className,
  suffix = '',
  prefix = ''
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [count, setCount] = useState(from);
  const { shouldAnimate } = useAnimationConfig();

  useEffect(() => {
    if (!isInView || !shouldAnimate) {
      setCount(to);
      return;
    }

    let startTime: number;
    const startValue = from;
    const endValue = to;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.round(startValue + (endValue - startValue) * easeOut);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, from, to, duration, shouldAnimate]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] }}
      className={className}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
};

// ─── Scroll Fade ───
interface ScrollFadeProps {
  children: React.ReactNode;
  direction?: 'up' | 'down';
  className?: string;
}

export const ScrollFade: React.FC<ScrollFadeProps> = ({
  children,
  direction = 'up',
  className
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const { shouldAnimate } = useAnimationConfig();

  const opacity = useTransform(
    scrollYProgress,
    direction === 'up' ? [0, 0.2, 0.8, 1] : [0, 0.2, 0.8, 1],
    direction === 'up' ? [0, 1, 1, 0] : [0, 1, 1, 0]
  );

  return (
    <motion.div
      ref={ref}
      style={{ opacity: shouldAnimate ? opacity : 1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Scroll Scale ───
interface ScrollScaleProps {
  children: React.ReactNode;
  scaleRange?: [number, number];
  className?: string;
}

export const ScrollScale: React.FC<ScrollScaleProps> = ({
  children,
  scaleRange = [0.8, 1],
  className
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const { shouldAnimate } = useAnimationConfig();

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [scaleRange[0], 1, scaleRange[1]]);

  return (
    <motion.div
      ref={ref}
      style={{ scale: shouldAnimate ? scale : 1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Scroll Rotate ───
interface ScrollRotateProps {
  children: React.ReactNode;
  rotateRange?: [number, number];
  className?: string;
}

export const ScrollRotate: React.FC<ScrollRotateProps> = ({
  children,
  rotateRange = [0, 360],
  className
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const { shouldAnimate } = useAnimationConfig();

  const rotate = useTransform(scrollYProgress, [0, 1], rotateRange);

  return (
    <motion.div
      ref={ref}
      style={{ rotate: shouldAnimate ? rotate : 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Scroll Timeline ───
interface ScrollTimelineProps {
  items: Array<{
    id: string;
    title: string;
    description: string;
    date?: string;
  }>;
  className?: string;
}

export const ScrollTimeline: React.FC<ScrollTimelineProps> = ({
  items,
  className
}) => {
  const { shouldAnimate } = useAnimationConfig();

  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      
      {items.map((item, index) => (
        <ScrollReveal
          key={item.id}
          variant="slideLeft"
          delay={index * 0.1}
          className="relative flex items-start gap-6 pb-8 last:pb-0"
        >
          {/* Timeline dot */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (index * 0.1) + 0.3, duration: 0.3 }}
            className="relative z-10 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg"
          >
            <div className="w-3 h-3 bg-white rounded-full" />
          </motion.div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {item.date && (
              <div className="text-sm text-muted-foreground mb-1">
                {item.date}
              </div>
            )}
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {item.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
};

// ─── Scroll Reveal Text ───
interface ScrollRevealTextProps {
  text: string;
  className?: string;
  staggerDelay?: number;
}

export const ScrollRevealText: React.FC<ScrollRevealTextProps> = ({
  text,
  className,
  staggerDelay = 0.05
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { shouldAnimate } = useAnimationConfig();

  const words = text.split(' ');

  const containerVariants = shouldAnimate ? {
    hidden: {},
    show: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  } : {};

  const wordVariants = shouldAnimate ? {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  } : {};

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      variants={containerVariants}
      className={cn('overflow-hidden', className)}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};