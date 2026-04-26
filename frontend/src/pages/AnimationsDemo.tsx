/**
 * Animation System Demo Page
 * Comprehensive showcase of all animation components and effects
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Heart, Star, Zap, Rocket, 
  Play, Pause, RotateCcw, Settings,
  User, Mail, Lock, MessageSquare
} from 'lucide-react';

// Animation Components
import { AnimatedContainer, StaggerContainer, AnimatedGrid } from '../animations/motion-components/AnimatedContainer';
import { AnimatedCard, FeatureCard, StatCard } from '../animations/motion-components/AnimatedCard';
import { AnimatedButton, CTAButton, IconButton } from '../animations/motion-components/AnimatedButton';
import { ScrollReveal, ScrollCounter, ScrollTimeline } from '../animations/scroll-effects/ScrollAnimations';
import { Skeleton, Spinner, DotsLoader, ProgressBar, TypingIndicator } from '../animations/loading-effects/LoadingAnimations';
import { AnimatedForm, AnimatedInput, AnimatedTextarea, AnimatedCheckbox } from '../components/forms/AnimatedForm';

// Layout
import { AnimatedLayout } from '../components/layout/AnimatedLayout';

const AnimationDemoPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(65);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subscribe: false
  });

  // Demo data
  const stats = [
    { value: '10K+', label: 'Active Users', icon: 'Users' },
    { value: '99.9%', label: 'Uptime', icon: 'Zap' },
    { value: '4.9/5', label: 'Rating', icon: 'Star' },
    { value: '24/7', label: 'Support', icon: 'MessageSquare' }
  ];

  const features = [
    {
      title: 'Lightning Fast',
      description: 'Optimized for performance with 60fps animations',
      icon: <Zap className="w-6 h-6 text-white" />,
      badge: 'Performance',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Accessible',
      description: 'Respects reduced motion preferences automatically',
      icon: <Heart className="w-6 h-6 text-white" />,
      badge: 'A11y',
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Customizable',
      description: 'Flexible variants and easy-to-use components',
      icon: <Settings className="w-6 h-6 text-white" />,
      badge: 'Flexible',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  const timelineItems = [
    {
      id: '1',
      title: 'Project Initialization',
      description: 'Set up the animation system architecture and core components',
      date: 'Week 1'
    },
    {
      id: '2',
      title: 'Component Development',
      description: 'Built reusable animated components with Framer Motion',
      date: 'Week 2'
    },
    {
      id: '3',
      title: 'Performance Optimization',
      description: 'Optimized animations for 60fps and reduced motion support',
      date: 'Week 3'
    },
    {
      id: '4',
      title: 'Integration & Testing',
      description: 'Integrated with the main application and comprehensive testing',
      date: 'Week 4'
    }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Form submitted successfully!');
    }, 2000);
  };

  return (
    <AnimatedLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 gradient-hero" />
          <div className="absolute inset-0 dot-pattern opacity-40" />
          
          <AnimatedContainer className="relative max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-sm font-medium text-primary mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Animation System Demo
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-foreground">Premium</span>{' '}
              <span className="gradient-text-hero">Animations</span>
              <br />
              <span className="text-foreground">Made Simple</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Experience our production-grade animation system with smooth transitions, 
              micro-interactions, and accessibility-first design.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <CTAButton icon={<Rocket className="w-4 h-4" />}>
                Explore Components
              </CTAButton>
              
              <AnimatedButton variant="outline" size="lg">
                <Play className="w-4 h-4" />
                Watch Demo
              </AnimatedButton>
            </div>
          </AnimatedContainer>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-center mb-12">
                Performance <span className="gradient-text">Metrics</span>
              </h2>
            </ScrollReveal>
            
            <AnimatedGrid cols={4} className="gap-6">
              {stats.map((stat, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <StatCard
                    value={<ScrollCounter from={0} to={parseInt(stat.value)} suffix={stat.value.replace(/\d+/g, '')} />}
                    label={stat.label}
                    icon={<Sparkles className="w-5 h-5 text-white" />}
                    index={index}
                  />
                </ScrollReveal>
              ))}
            </AnimatedGrid>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">
                  Built for <span className="gradient-text">Developers</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Every component is crafted with performance, accessibility, and developer experience in mind.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  badge={feature.badge}
                  index={index}
                />
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Loading States Demo */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/30">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-center mb-12">
                Loading <span className="gradient-text">States</span>
              </h2>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <ScrollReveal delay={0.1}>
                <div className="text-center">
                  <h3 className="font-semibold mb-4">Spinner</h3>
                  <Spinner size="lg" />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="text-center">
                  <h3 className="font-semibold mb-4">Dots Loader</h3>
                  <DotsLoader size="lg" />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="text-center">
                  <h3 className="font-semibold mb-4">Typing Indicator</h3>
                  <TypingIndicator />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <div className="text-center">
                  <h3 className="font-semibold mb-4">Progress Bar</h3>
                  <ProgressBar progress={progress} showLabel />
                  <div className="flex gap-2 mt-4 justify-center">
                    <IconButton
                      icon={<Play className="w-3 h-3" />}
                      size="sm"
                      onClick={() => setProgress(Math.min(100, progress + 10))}
                    />
                    <IconButton
                      icon={<Pause className="w-3 h-3" />}
                      size="sm"
                      onClick={() => setProgress(Math.max(0, progress - 10))}
                    />
                    <IconButton
                      icon={<RotateCcw className="w-3 h-3" />}
                      size="sm"
                      onClick={() => setProgress(0)}
                    />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Skeleton Demo */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-center mb-12">
                Skeleton <span className="gradient-text">Loaders</span>
              </h2>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 gap-8">
              <ScrollReveal delay={0.1}>
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1">
                      <Skeleton variant="text" width="60%" className="mb-2" />
                      <Skeleton variant="text" width="40%" />
                    </div>
                  </div>
                  <Skeleton variant="text" lines={3} className="mb-4" />
                  <div className="flex gap-2">
                    <Skeleton variant="rounded" width={80} height={32} />
                    <Skeleton variant="rounded" width={60} height={32} />
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="glass-card rounded-2xl p-6">
                  <Skeleton variant="rectangular" className="w-full h-32 mb-4" />
                  <Skeleton variant="text" width="80%" className="mb-2" />
                  <Skeleton variant="text" width="60%" className="mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton variant="text" width="30%" />
                    <Skeleton variant="rounded" width={100} height={36} />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Timeline Demo */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/30">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-center mb-12">
                Animated <span className="gradient-text">Timeline</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <ScrollTimeline items={timelineItems} />
            </ScrollReveal>
          </div>
        </section>

        {/* Form Demo */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-center mb-12">
                Animated <span className="gradient-text">Forms</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="glass-card rounded-2xl p-8">
                <AnimatedForm
                  title="Get in Touch"
                  description="Experience our premium form animations"
                  onSubmit={handleFormSubmit}
                >
                  <AnimatedInput
                    label="Full Name"
                    icon={<User className="w-4 h-4" />}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    success={formData.name.length > 2}
                  />

                  <AnimatedInput
                    label="Email Address"
                    type="email"
                    icon={<Mail className="w-4 h-4" />}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={formData.email && !formData.email.includes('@') ? 'Please enter a valid email' : ''}
                  />

                  <AnimatedTextarea
                    label="Message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    helperText="Tell us about your project"
                  />

                  <AnimatedCheckbox
                    label="Subscribe to newsletter"
                    description="Get updates about new features and releases"
                    checked={formData.subscribe}
                    onChange={(e) => setFormData({ ...formData, subscribe: e.target.checked })}
                  />

                  <AnimatedButton
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={isLoading}
                    effect="pulse"
                  >
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </AnimatedButton>
                </AnimatedForm>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 gradient-primary opacity-90" />
                <div className="absolute inset-0 dot-pattern opacity-20" />
                <div className="relative px-8 py-16 text-center text-white">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Ready to get started?
                  </h2>
                  <p className="text-lg opacity-80 max-w-xl mx-auto mb-8">
                    Integrate our animation system into your project and create delightful user experiences.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <CTAButton>
                      Get Started Free <Rocket className="w-4 h-4" />
                    </CTAButton>
                    <AnimatedButton variant="outline" className="border-white/40 text-white hover:bg-white/10">
                      <MessageSquare className="w-4 h-4" /> View Documentation
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </AnimatedLayout>
  );
};

export default AnimationDemoPage;