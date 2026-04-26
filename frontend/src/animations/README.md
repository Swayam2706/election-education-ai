# Premium Animation System

A comprehensive, production-grade animation system built with Framer Motion for the Election Process Education Assistant application.

## 🎯 Overview

This animation system provides a complete set of reusable components, hooks, and utilities to create smooth, performant, and accessible animations throughout the application. Every animation is designed to enhance user experience while maintaining 60fps performance and respecting accessibility preferences.

## 🏗️ Architecture

```
animations/
├── variants.ts                 # Animation variant definitions
├── transitions.ts              # Transition configurations
├── index.ts                   # Main exports
├── hooks/
│   ├── useReducedMotion.ts    # Accessibility hooks
│   └── useScrollAnimation.ts  # Scroll-based animations
├── motion-components/
│   ├── AnimatedContainer.tsx  # Container components
│   ├── AnimatedCard.tsx       # Card animations
│   └── AnimatedButton.tsx     # Button interactions
├── page-transitions/
│   └── PageTransition.tsx     # Route transitions
├── loading-effects/
│   └── LoadingAnimations.tsx  # Loading states
└── scroll-effects/
    └── ScrollAnimations.tsx   # Scroll-triggered animations
```

## 🚀 Key Features

### Performance Optimized
- **60fps animations** using GPU-accelerated transforms
- **Lazy loading** of animation components
- **Efficient re-renders** with proper memoization
- **Hardware acceleration** for smooth performance

### Accessibility First
- **Reduced motion support** with `prefers-reduced-motion`
- **Keyboard navigation** friendly
- **Screen reader** compatible
- **Focus management** for interactive elements

### Developer Experience
- **TypeScript** support throughout
- **Consistent API** across all components
- **Flexible variants** for customization
- **Comprehensive documentation**

## 📦 Core Components

### Animation Variants

Pre-built animation variants for common patterns:

```typescript
import { fadeUp, slideLeft, scaleIn, staggerContainer } from '@/animations/variants';

// Usage in components
<motion.div variants={fadeUp} initial="hidden" animate="show">
  Content
</motion.div>
```

Available variants:
- `fadeIn`, `fadeUp`, `fadeDown`
- `slideLeft`, `slideRight`
- `scaleIn`, `hoverLift`, `hoverScale`
- `buttonTap`, `modalPop`
- `staggerContainer`, `pageTransition`

### Motion Components

Ready-to-use animated components:

#### AnimatedContainer
```typescript
import { AnimatedContainer, StaggerContainer } from '@/animations/motion-components/AnimatedContainer';

<AnimatedContainer variant="fadeUp" delay={0.2}>
  <h1>Animated Content</h1>
</AnimatedContainer>

<StaggerContainer staggerDelay={0.1}>
  {items.map((item, i) => (
    <AnimatedListItem key={i} index={i}>
      {item.content}
    </AnimatedListItem>
  ))}
</StaggerContainer>
```

#### AnimatedCard
```typescript
import { FeatureCard, StatCard } from '@/animations/motion-components/AnimatedCard';

<FeatureCard
  title="Feature Title"
  description="Feature description"
  icon={<Icon />}
  hoverEffect="lift"
  index={0}
/>

<StatCard
  value="10K+"
  label="Active Users"
  icon={<Users />}
  index={0}
/>
```

#### AnimatedButton
```typescript
import { AnimatedButton, CTAButton } from '@/animations/motion-components/AnimatedButton';

<AnimatedButton variant="primary" effect="pulse">
  Click Me
</AnimatedButton>

<CTAButton icon={<Rocket />} loading={isLoading}>
  Get Started
</CTAButton>
```

### Scroll Animations

Scroll-triggered animations with intersection observer:

```typescript
import { ScrollReveal, ScrollCounter, ScrollTimeline } from '@/animations/scroll-effects/ScrollAnimations';

<ScrollReveal variant="fadeUp" delay={0.2}>
  <h2>Revealed on scroll</h2>
</ScrollReveal>

<ScrollCounter from={0} to={1000} duration={2000} />

<ScrollTimeline items={timelineData} />
```

### Loading States

Elegant loading animations:

```typescript
import { Skeleton, Spinner, ProgressBar, TypingIndicator } from '@/animations/loading-effects/LoadingAnimations';

<Skeleton variant="text" lines={3} />
<Spinner size="lg" color="primary" />
<ProgressBar progress={65} animated />
<TypingIndicator />
```

### Page Transitions

Smooth route transitions:

```typescript
import { PageTransition, ModalTransition } from '@/animations/page-transitions/PageTransition';

<PageTransition variant="fade">
  <YourPageContent />
</PageTransition>

<ModalTransition isOpen={isOpen} onClose={handleClose}>
  <ModalContent />
</ModalTransition>
```

## 🎨 Form Animations

Enhanced form components with micro-interactions:

```typescript
import { AnimatedForm, AnimatedInput, AnimatedCheckbox } from '@/components/forms/AnimatedForm';

<AnimatedForm title="Contact Us" onSubmit={handleSubmit}>
  <AnimatedInput
    label="Email"
    type="email"
    icon={<Mail />}
    error={errors.email}
    success={isValid.email}
  />
  
  <AnimatedCheckbox
    label="Subscribe to newsletter"
    description="Get updates about new features"
  />
</AnimatedForm>
```

## 🔧 Hooks

### useReducedMotion
Respects user's motion preferences:

```typescript
import { useReducedMotion, useAnimationConfig } from '@/animations/hooks/useReducedMotion';

const prefersReducedMotion = useReducedMotion();
const { shouldAnimate, getVariants } = useAnimationConfig();

const variants = getVariants(normalVariants, reducedVariants);
```

### useScrollAnimation
Enhanced scroll-based animations:

```typescript
import { 
  useScrollNavbar, 
  useScrollProgress, 
  useScrollDirection 
} from '@/animations/hooks/useScrollAnimation';

const { isVisible, isAtTop } = useScrollNavbar();
const progress = useScrollProgress();
const direction = useScrollDirection();
```

## 🎯 Usage Examples

### Basic Animation
```typescript
import { motion } from 'framer-motion';
import { fadeUp } from '@/animations/variants';

<motion.div
  variants={fadeUp}
  initial="hidden"
  animate="show"
  custom={0} // Stagger delay multiplier
>
  Content
</motion.div>
```

### Staggered List
```typescript
import { StaggerContainer } from '@/animations/motion-components/AnimatedContainer';
import { fadeUp } from '@/animations/variants';

<StaggerContainer>
  {items.map((item, index) => (
    <motion.div key={item.id} variants={fadeUp} custom={index}>
      {item.content}
    </motion.div>
  ))}
</StaggerContainer>
```

### Scroll-Triggered Animation
```typescript
import { ScrollReveal } from '@/animations/scroll-effects/ScrollAnimations';

<ScrollReveal variant="slideLeft" threshold={0.2} once={true}>
  <YourComponent />
</ScrollReveal>
```

### Interactive Button
```typescript
import { AnimatedButton } from '@/animations/motion-components/AnimatedButton';

<AnimatedButton
  variant="primary"
  effect="pulse"
  loading={isLoading}
  onClick={handleClick}
>
  Submit
</AnimatedButton>
```

## 🎨 Customization

### Custom Variants
```typescript
import { Variants } from 'framer-motion';

const customVariant: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};
```

### Custom Transitions
```typescript
import { Transition } from 'framer-motion';

const customTransition: Transition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
  staggerChildren: 0.1
};
```

## 🔧 Configuration

### Animation Settings
```typescript
// animations/index.ts
export const animationConfig = {
  defaultDuration: 0.4,
  defaultEasing: [0.22, 1, 0.36, 1] as const,
  staggerDelay: 0.1,
  respectReducedMotion: true
};
```

### CSS Variables
```css
:root {
  --animation-duration-fast: 0.2s;
  --animation-duration-normal: 0.3s;
  --animation-duration-slow: 0.6s;
  --animation-easing-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --animation-easing-bouncy: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## 📱 Responsive Animations

Animations adapt to different screen sizes and device capabilities:

```typescript
const responsiveVariants = {
  hidden: { opacity: 0, y: isMobile ? 20 : 40 },
  show: { opacity: 1, y: 0 }
};
```

## ♿ Accessibility

### Reduced Motion Support
All animations respect `prefers-reduced-motion: reduce`:

```typescript
const { shouldAnimate } = useAnimationConfig();

<motion.div
  animate={shouldAnimate ? { x: 100 } : {}}
  transition={shouldAnimate ? { duration: 0.5 } : { duration: 0 }}
>
  Content
</motion.div>
```

### Focus Management
Interactive elements maintain proper focus states:

```typescript
<motion.button
  whileFocus={{ scale: 1.02 }}
  className="focus:outline-none focus:ring-2 focus:ring-primary"
>
  Button
</motion.button>
```

## 🚀 Performance Tips

1. **Use transform and opacity** for animations (GPU accelerated)
2. **Avoid animating layout properties** (width, height, padding)
3. **Use `will-change` sparingly** and remove after animation
4. **Implement lazy loading** for complex animations
5. **Debounce scroll events** for better performance

## 🧪 Testing

Test animations with different preferences:

```typescript
// Test with reduced motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
});
```

## 📚 Best Practices

1. **Keep animations subtle** - enhance, don't distract
2. **Maintain consistency** - use the same easing and timing
3. **Respect user preferences** - always support reduced motion
4. **Test on low-end devices** - ensure smooth performance
5. **Use semantic HTML** - animations should enhance, not replace accessibility
6. **Provide fallbacks** - graceful degradation for older browsers

## 🔗 Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [CSS Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)

---

Built with ❤️ for the Election Process Education Assistant