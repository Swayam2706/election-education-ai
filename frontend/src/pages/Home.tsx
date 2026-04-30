import React, { useRef, memo, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  MessageSquare, ArrowRight, Play, Sparkles, Shield,
  ChevronDown, Zap, Vote, TrendingUp
} from 'lucide-react';
import { useStatCards, useFeatureCards } from '../hooks/useSiteData';
import { analyticsService } from '../services/analytics.service';
import { siteService } from '../services/site.service';
import { logger } from '../utils/logger';

// Enhanced Animation Components
import { AnimatedContainer, StaggerContainer } from '../animations/motion-components/AnimatedContainer';
import { FeatureCard, StatCard } from '../animations/motion-components/AnimatedCard';
import { AnimatedButton, CTAButton } from '../animations/motion-components/AnimatedButton';
import { ScrollReveal, ScrollCounter } from '../animations/scroll-effects/ScrollAnimations';
import { Skeleton } from '../animations/loading-effects/LoadingAnimations';

/* ─── Animation helpers ─── */
const fadeUpVariant = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

const AnimatedSection = memo(({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={fadeUpVariant}
      className={className}
    >
      {children}
    </motion.div>
  );
});

AnimatedSection.displayName = 'AnimatedSection';

/* ─── Components ─── */
interface StatCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  index: number;
}

const EnhancedStatCard = memo(({ value, label, icon, index }: StatCardProps) => {
  // Check if value contains non-numeric characters (like ratings)
  const isNumericOnly = /^\d+\+?$/.test(value);
  
  return (
    <ScrollReveal delay={index * 0.1}>
      <StatCard
        value={isNumericOnly ? (
          <ScrollCounter from={0} to={parseInt(value)} suffix={value.replace(/\d+/g, '')} />
        ) : (
          value
        )}
        label={label}
        icon={<TrendingUp className="w-5 h-5 text-white" />}
        index={index}
      />
    </ScrollReveal>
  );
});

EnhancedStatCard.displayName = 'EnhancedStatCard';

interface FeatureCardProps {
  feature: {
    id: number;
    title: string;
    description: string;
    badge: string;
    href: string;
    color: string;
  };
  index: number;
}

const EnhancedFeatureCard = memo(({ feature, index }: FeatureCardProps) => {
  const handleClick = useCallback(() => {
    analyticsService.trackEvent('feature_card_click', { 
      feature: feature.title,
      href: feature.href 
    });
  }, [feature.title, feature.href]);
  
  return (
    <ScrollReveal delay={index * 0.1}>
      <FeatureCard
        title={feature.title}
        description={feature.description}
        icon={<Sparkles className="w-6 h-6 text-white" />}
        badge={feature.badge}
        href={feature.href}
        index={index}
        onClick={handleClick}
      />
    </ScrollReveal>
  );
});

EnhancedFeatureCard.displayName = 'EnhancedFeatureCard';

/* ─── Page ─── */
export default function Home() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dynamic stats from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await siteService.getStats();
        if (response.success && response.data) {
          setStats([
            { id: 1, value: `${response.data.totalUsers || 0}+`, label: 'Citizens Learning', icon: 'Users' },
            { id: 2, value: `${response.data.totalQuizzes || 0}`, label: 'Election Quizzes', icon: 'BookOpen' },
            { id: 3, value: `${response.data.totalContent || 0}`, label: 'Voting Guides', icon: 'FileText' },
            { id: 4, value: '4.9/5', label: 'Learner Rating', icon: 'Star' }
          ]);
        }
      } catch (error) {
        logger.error('Failed to load stats', error);
        // Fallback to default stats
        setStats([
          { id: 1, value: '10K+', label: 'Citizens Learning', icon: 'Users' },
          { id: 2, value: '50+', label: 'Election Quizzes', icon: 'BookOpen' },
          { id: 3, value: '100+', label: 'Voting Guides', icon: 'FileText' },
          { id: 4, value: '4.9/5', label: 'Learner Rating', icon: 'Star' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const features = [
    {
      id: 1,
      title: 'Step-by-Step Voting Guide',
      description: 'Learn the complete voting process from registration to casting your ballot',
      badge: 'Essential',
      href: '/learn',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 2,
      title: 'AI Election Mentor',
      description: 'Ask anything about elections, voting rights, and democratic processes',
      badge: 'AI-Powered',
      href: '/chat',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Election Timeline',
      description: 'Interactive timeline of election phases from announcement to results',
      badge: 'Interactive',
      href: '/timeline',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 4,
      title: 'Voting Knowledge Quiz',
      description: 'Test your understanding of election processes and civic duties',
      badge: 'Learn & Test',
      href: '/quiz',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 5,
      title: 'Voter Eligibility Check',
      description: 'Check if you meet voting requirements and learn registration steps',
      badge: 'Personalized',
      href: '/eligibility',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 6,
      title: 'Election FAQs',
      description: 'Common questions about voting procedures, rights, and responsibilities',
      badge: 'Quick Help',
      href: '/faq',
      color: 'from-pink-500 to-purple-500'
    }
  ];

  const trustBadges = [
    'Civic Education Certified',
    'WCAG 2.1 AA Accessible',
    'Privacy Protected',
    'Free for All Citizens',
  ];

  const handleCTAClick = useCallback((action) => {
    if (analyticsService && analyticsService.trackEvent) {
      analyticsService.trackEvent('cta_click', { action, page: 'home' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 dot-pattern opacity-40" />

        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl animate-float-delayed pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-cyan-500/8 rounded-full blur-2xl animate-float pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-sm font-medium text-primary mb-8">
              <Vote className="w-4 h-4" />
              Election Education Platform · Powered by Gemini AI
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-balance"
          >
            <span className="text-foreground">Master the</span>{' '}
            <span className="gradient-text-hero">Election Process</span>
            <br />
            <span className="text-foreground">Step by Step</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Your interactive AI-powered assistant to understand elections, voting procedures, and democratic processes 
            — from voter registration to ballot casting. Learn at your own pace with step-by-step guidance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/register" onClick={() => handleCTAClick('register')}>
              <CTAButton icon={<Vote className="w-4 h-4" />}>
                Start Election Education
                <ArrowRight className="w-4 h-4" />
              </CTAButton>
            </Link>
            <Link to="/chat" onClick={() => handleCTAClick('try_ai')}>
              <AnimatedButton variant="outline" size="lg" className="h-12 px-8 text-base gap-2 rounded-xl border-border hover:border-primary/40 hover:bg-accent">
                <MessageSquare className="w-4 h-4" />
                Ask Election Questions
              </AnimatedButton>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-16"
          >
            {trustBadges.map((badge) => (
              <span key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 border border-border text-xs text-muted-foreground">
                <Shield className="w-3 h-3 text-green-500" />
                {badge}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-lg mx-auto glass-card rounded-2xl p-4 text-left"
          >
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium">AI Election Assistant</span>
              <span className="ml-auto flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
            </div>
            <div className="space-y-2">
              <div className="chat-bubble-ai px-3 py-2 text-sm text-foreground max-w-[85%]">
                How do I register to vote? 🗳️
              </div>
              <div className="chat-bubble-user px-3 py-2 text-sm ml-auto max-w-[85%]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs font-medium opacity-80">AI Election Mentor</span>
                </div>
                To register to vote, you need to be 18+ years old, a citizen, and have valid identification. You can register online through the official election portal or visit your local election office. I can guide you through each step!
              </div>
              <div className="flex gap-1.5 mt-3">
                {['Voter Registration', 'Polling Locations', 'Election Dates', 'Voting Rights'].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-accent text-xs text-muted-foreground border border-border cursor-pointer hover:border-primary/40 hover:text-primary transition-colors">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground"
          >
            <span className="text-xs">Scroll to explore</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <EnhancedStatCard key={stat.id} {...stat} index={i} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              Everything you need
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Built for every <span className="gradient-text">citizen</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From first-time voters to civic educators — our platform covers every aspect of the democratic process.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <EnhancedFeatureCard key={feature.id} feature={feature} index={i} />
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 gradient-primary opacity-90" />
              <div className="absolute inset-0 dot-pattern opacity-20" />
              <div className="relative px-8 py-16 text-center text-white">
                <Vote className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Every Vote Matters in Democracy
                </h2>
                <p className="text-lg opacity-80 max-w-xl mx-auto mb-8">
                  Join thousands of citizens learning about their voting rights, election procedures, and democratic responsibilities through our interactive platform.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register" onClick={() => handleCTAClick('get_started_cta')}>
                    <AnimatedButton size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-xl font-semibold gap-2">
                      Begin Learning Journey <ArrowRight className="w-4 h-4" />
                    </AnimatedButton>
                  </Link>
                  <Link to="/chat" onClick={() => handleCTAClick('ask_ai_cta')}>
                    <AnimatedButton size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary h-12 px-8 rounded-xl gap-2 font-semibold transition-all">
                      <MessageSquare className="w-4 h-4" /> Ask Election Mentor
                    </AnimatedButton>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}