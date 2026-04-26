/**
 * Animated Card Components
 * Premium card animations with hover effects
 */

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAnimationConfig } from '../hooks/useReducedMotion';
import { fadeUp, hoverLift, hoverScale, hoverGlow } from '../variants';
import { transitions } from '../transitions';

// ─── Base Animated Card ───
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  delay?: number;
  index?: number;
  children: React.ReactNode;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ hoverEffect = 'lift', delay = 0, index = 0, className, children, ...props }, ref) => {
    const { slideUp: safeSlideUp, shouldAnimate } = useAnimationConfig();
    
    const getHoverVariants = () => {
      if (!shouldAnimate) return {};
      
      switch (hoverEffect) {
        case 'lift':
          return hoverLift;
        case 'scale':
          return hoverScale;
        case 'glow':
          return hoverGlow;
        case 'none':
        default:
          return {};
      }
    };

    const cardVariants = safeSlideUp(fadeUp);
    const hoverVariants = getHoverVariants();

    return (
      <motion.div
        ref={ref}
        custom={index}
        initial="hidden"
        animate="show"
        whileHover="hover"
        variants={{ ...cardVariants, ...hoverVariants }}
        transition={{ ...transitions.fadeIn, delay: delay + (index * 0.1) }}
        className={cn(
          'cursor-pointer transition-shadow duration-300',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// ─── Feature Card ───
interface FeatureCardProps extends HTMLMotionProps<'div'> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  href?: string;
  index?: number;
  onClick?: () => void;
}

export const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, badge, href, index = 0, onClick, className, ...props }, ref) => {
    const { slideUp: safeSlideUp, shouldAnimate } = useAnimationConfig();
    
    const cardVariants = safeSlideUp(fadeUp);
    const hoverVariants = shouldAnimate ? hoverLift : {};

    const CardContent = () => (
      <>
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
            {icon}
          </div>
        )}

        {badge && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
            {badge}
          </span>
        )}

        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {href && (
          <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-4">
            Explore
            <motion.svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ x: shouldAnimate ? [0, 4, 0] : 0 }}
              transition={{ duration: 0.3 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>
          </div>
        )}
      </>
    );

    return (
      <motion.div
        ref={ref}
        custom={index}
        initial="hidden"
        animate="show"
        whileHover="hover"
        variants={{ ...cardVariants, ...hoverVariants }}
        transition={{ ...transitions.fadeIn, delay: index * 0.1 }}
        className={cn(
          'glass-card rounded-2xl p-6 h-full cursor-pointer group',
          className
        )}
        onClick={onClick}
        {...props}
      >
        <CardContent />
      </motion.div>
    );
  }
);

FeatureCard.displayName = 'FeatureCard';

// ─── Stat Card ───
interface StatCardProps extends HTMLMotionProps<'div'> {
  value: string | number | React.ReactNode;
  label: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  index?: number;
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ value, label, icon, trend, trendValue, index = 0, className, ...props }, ref) => {
    const { slideUp: safeSlideUp, shouldAnimate } = useAnimationConfig();
    
    const cardVariants = safeSlideUp(fadeUp);
    const hoverVariants = shouldAnimate ? hoverScale : {};

    const getTrendColor = () => {
      switch (trend) {
        case 'up':
          return 'text-green-500';
        case 'down':
          return 'text-red-500';
        default:
          return 'text-muted-foreground';
      }
    };

    return (
      <motion.div
        ref={ref}
        custom={index}
        initial="hidden"
        animate="show"
        whileHover="hover"
        variants={{ ...cardVariants, ...hoverVariants }}
        transition={{ ...transitions.fadeIn, delay: index * 0.1 }}
        className={cn(
          'glass-card rounded-2xl p-6 text-center',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
            {icon}
          </div>
        )}
        
        <motion.div
          className="text-3xl font-bold gradient-text mb-1"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: (index * 0.1) + 0.3, duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] }}
        >
          {value}
        </motion.div>
        
        <div className="text-sm text-muted-foreground mb-2">{label}</div>
        
        {trend && trendValue && (
          <div className={cn('text-xs font-medium', getTrendColor())}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </div>
        )}
      </motion.div>
    );
  }
);

StatCard.displayName = 'StatCard';

// ─── Product Card ───
interface ProductCardProps extends HTMLMotionProps<'div'> {
  image?: string;
  title: string;
  description: string;
  price?: string;
  badge?: string;
  index?: number;
  onClick?: () => void;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ image, title, description, price, badge, index = 0, onClick, className, ...props }, ref) => {
    const { slideUp: safeSlideUp, shouldAnimate } = useAnimationConfig();
    
    const cardVariants = safeSlideUp(fadeUp);
    const hoverVariants = shouldAnimate ? hoverLift : {};

    return (
      <motion.div
        ref={ref}
        custom={index}
        initial="hidden"
        animate="show"
        whileHover="hover"
        variants={{ ...cardVariants, ...hoverVariants }}
        transition={{ ...transitions.fadeIn, delay: index * 0.1 }}
        className={cn(
          'glass-card rounded-2xl overflow-hidden cursor-pointer group',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {image && (
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {badge && (
              <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-primary">
                {badge}
              </span>
            )}
          </div>
        )}
        
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {description}
          </p>
          
          {price && (
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">{price}</span>
              <motion.button
                whileHover={{ scale: shouldAnimate ? 1.05 : 1 }}
                whileTap={{ scale: shouldAnimate ? 0.95 : 1 }}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Learn More
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

ProductCard.displayName = 'ProductCard';

// ─── Testimonial Card ───
interface TestimonialCardProps extends HTMLMotionProps<'div'> {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
  index?: number;
}

export const TestimonialCard = forwardRef<HTMLDivElement, TestimonialCardProps>(
  ({ quote, author, role, avatar, rating, index = 0, className, ...props }, ref) => {
    const { slideUp: safeSlideUp, shouldAnimate } = useAnimationConfig();
    
    const cardVariants = safeSlideUp(fadeUp);
    const hoverVariants = shouldAnimate ? hoverGlow : {};

    return (
      <motion.div
        ref={ref}
        custom={index}
        initial="hidden"
        animate="show"
        whileHover="hover"
        variants={{ ...cardVariants, ...hoverVariants }}
        transition={{ ...transitions.fadeIn, delay: index * 0.1 }}
        className={cn(
          'glass-card rounded-2xl p-6 relative',
          className
        )}
        {...props}
      >
        <div className="absolute top-4 left-4 text-4xl text-primary/20 font-serif">"</div>
        
        <div className="pt-8">
          <p className="text-foreground leading-relaxed mb-6 italic">
            {quote}
          </p>
          
          {rating && (
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.svg
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < rating ? 'text-yellow-400' : 'text-gray-300'
                  )}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (index * 0.1) + (i * 0.1) + 0.5 }}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </motion.svg>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {avatar && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold">
                {avatar}
              </div>
            )}
            <div>
              <div className="font-semibold text-foreground">{author}</div>
              {role && (
                <div className="text-sm text-muted-foreground">{role}</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

TestimonialCard.displayName = 'TestimonialCard';