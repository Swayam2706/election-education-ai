// Accessibility utilities - JavaScript version for immediate use
import React from 'react';

// Skip to content link
export const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-primary"
    >
      Skip to main content
    </a>
  );
};

// Announce to screen readers
export const announce = (message, priority = 'polite') => {
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

// Keyboard navigation helper
export const handleKeyboardNavigation = (e, handlers) => {
  const { onEnter, onEscape, onArrowUp, onArrowDown, onSpace } = handlers;
  
  switch (e.key) {
    case 'Enter':
      e.preventDefault();
      onEnter?.();
      break;
    case ' ':
      e.preventDefault();
      (onSpace || onEnter)?.();
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
