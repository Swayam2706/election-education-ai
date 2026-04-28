// Accessibility utilities for WCAG 2.1 AA compliance

// Focus management
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  firstFocusable?.focus();

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

// Announce to screen readers
export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcer = document.getElementById('aria-live-announcer') || createAnnouncer();
  announcer.setAttribute('aria-live', priority);
  announcer.textContent = message;
  
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
};

const createAnnouncer = () => {
  const announcer = document.createElement('div');
  announcer.id = 'aria-live-announcer';
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
  document.body.appendChild(announcer);
  return announcer;
};

// Check color contrast ratio
export const getContrastRatio = (foreground: string, background: string): number => {
  const getLuminance = (color: string) => {
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r, g, b] = rgb.map(val => {
      const sRGB = val / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

// Keyboard navigation helper
export const handleKeyboardNavigation = (
  e: React.KeyboardEvent,
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void
) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      onEnter?.();
      break;
    case 'Escape':
      e.preventDefault();
      onEscape?.();
      break;
    case 'ArrowUp':
      e.preventDefault();
      onArrowUp?.();
      break;
    case 'ArrowDown':
      e.preventDefault();
      onArrowDown?.();
      break;
  }
};

// Skip to content link
export const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded"
    >
      Skip to main content
    </a>
  );
};

// Validate ARIA labels
export const validateAriaLabels = (element: HTMLElement): string[] => {
  const errors: string[] = [];
  
  // Check for buttons without labels
  const buttons = element.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
  buttons.forEach((btn) => {
    if (!btn.textContent?.trim()) {
      errors.push(`Button without label: ${btn.outerHTML.substring(0, 50)}`);
    }
  });

  // Check for images without alt text
  const images = element.querySelectorAll('img:not([alt])');
  images.forEach((img) => {
    errors.push(`Image without alt text: ${img.outerHTML.substring(0, 50)}`);
  });

  // Check for form inputs without labels
  const inputs = element.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
  inputs.forEach((input) => {
    const id = input.getAttribute('id');
    if (!id || !element.querySelector(`label[for="${id}"]`)) {
      errors.push(`Input without label: ${input.outerHTML.substring(0, 50)}`);
    }
  });

  return errors;
};

// Focus visible utility
export const setupFocusVisible = () => {
  let hadKeyboardEvent = false;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      hadKeyboardEvent = true;
    }
  };

  const handleMouseDown = () => {
    hadKeyboardEvent = false;
  };

  const handleFocus = (e: FocusEvent) => {
    if (hadKeyboardEvent && e.target instanceof HTMLElement) {
      e.target.classList.add('focus-visible');
    }
  };

  const handleBlur = (e: FocusEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('focus-visible');
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('focus', handleFocus, true);
  document.addEventListener('blur', handleBlur, true);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('focus', handleFocus, true);
    document.removeEventListener('blur', handleBlur, true);
  };
};
