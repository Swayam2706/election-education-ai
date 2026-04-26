/**
 * Global Animation Variants
 * Production-grade animation variants for consistent motion design
 */

import { Variants } from 'framer-motion';

// ─── Core Animation Variants ───
export const fadeIn: Variants = {
  hidden: { 
    opacity: 0 
  },
  show: { 
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const fadeUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 32 
  },
  show: (i = 0) => ({ 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

export const fadeDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -32 
  },
  show: (i = 0) => ({ 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

export const slideLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: 48 
  },
  show: (i = 0) => ({ 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

export const slideRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: -48 
  },
  show: (i = 0) => ({ 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  show: (i = 0) => ({ 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

// ─── Container Variants ───
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

export const staggerSlow: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

// ─── Hover Effects ───
export const hoverLift: Variants = {
  rest: { 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  hover: { 
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const hoverScale: Variants = {
  rest: { 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const hoverGlow: Variants = {
  rest: { 
    boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  hover: { 
    boxShadow: '0 0 20px 4px rgba(59, 130, 246, 0.15)',
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// ─── Button Animations ───
export const buttonTap: Variants = {
  rest: { 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  hover: { 
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const buttonPulse: Variants = {
  rest: { 
    scale: 1,
    boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)',
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  hover: { 
    scale: 1.02,
    boxShadow: '0 0 0 8px rgba(59, 130, 246, 0)',
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// ─── Modal & Popup Variants ───
export const modalPop: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 20
  },
  show: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    y: 10,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const backdropFade: Variants = {
  hidden: { 
    opacity: 0 
  },
  show: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// ─── Page Transitions ───
export const pageTransition: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const slideTransition: Variants = {
  hidden: { 
    opacity: 0, 
    x: 100 
  },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    x: -100,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// ─── Loading Animations ───
export const pulseGlow: Variants = {
  pulse: {
    opacity: [0.6, 1, 0.6],
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const shimmer: Variants = {
  shimmer: {
    x: ['-100%', '100%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ─── Micro Interactions ───
export const iconBounce: Variants = {
  rest: { 
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  hover: { 
    y: -2,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const tooltipFade: Variants = {
  hidden: { 
    opacity: 0, 
    y: 8,
    scale: 0.95
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// ─── Form Animations ───
export const inputFocus: Variants = {
  rest: { 
    scale: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  focus: { 
    scale: 1.01,
    borderColor: 'rgba(59, 130, 246, 1)',
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const errorShake: Variants = {
  shake: {
    x: [-4, 4, -4, 4, 0],
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// ─── Success Animations ───
export const successPop: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5 
  },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.68, -0.55, 0.265, 1.55] // Bouncy ease
    }
  }
};

// ─── Navigation Animations ───
export const navSlide: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const mobileMenuSlide: Variants = {
  hidden: { 
    opacity: 0, 
    x: '100%' 
  },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    x: '100%',
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// ─── Progress Animations ───
export const progressFill: Variants = {
  hidden: { 
    scaleX: 0,
    originX: 0
  },
  show: (progress: number) => ({ 
    scaleX: progress / 100,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

// ─── Counter Animation ───
export const counterUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// ─── Aliases ───
export const slideUp = fadeUp;
