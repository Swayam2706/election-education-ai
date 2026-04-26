// Animated Navigation Bar Component

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useScrollNavbar } from '../animations/hooks/useScrollAnimation';
import { useReducedMotion } from '../animations/hooks/useReducedMotion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, ThemeToggle } from '../providers/ThemeProvider';
import { AnimatedButton } from '../animations/motion-components/AnimatedButton';
import { navSlide, mobileMenuSlide, fadeIn } from '../animations/variants';
import { transitions } from '../animations/transitions';

// ─── Local animation constants ───
const optimizedTransitions = {
  fast: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  hover: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

const navItem = {
  rest: { scale: 1, transition: optimizedTransitions.fast },
  hover: { scale: 1.02, transition: optimizedTransitions.fast },
  active: { scale: 1, transition: optimizedTransitions.fast },
};

const mobileMenu = {
  closed: { opacity: 0, height: 0, transition: optimizedTransitions.fast },
  open: { opacity: 1, height: 'auto', transition: optimizedTransitions.fast },
};

// Navigation items
const navigationItems = [
  { name: 'Home', href: '/', icon: '🏠' },
  { name: 'Dashboard', href: '/dashboard', icon: '📊', requiresAuth: true },
  { name: 'Learn', href: '/learn', icon: '📚' },
  { name: 'Quiz', href: '/quiz', icon: '🧠' },
  { name: 'Timeline', href: '/timeline', icon: '📅' },
  { name: 'Chat', href: '/chat', icon: '💬' },
  { name: 'FAQ', href: '/faq', icon: '❓' },
];

// Animated Navigation Item
const AnimatedNavItem: React.FC<{
  item: typeof navigationItems[0];
  isActive: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}> = ({ item, isActive, isMobile = false, onClick }) => {
  const prefersReducedMotion = useReducedMotion();
  const { isAuthenticated } = useAuth();

  // Don't show auth-required items if not authenticated
  if (item.requiresAuth && !isAuthenticated) {
    return null;
  }

  const itemVariants = prefersReducedMotion ? {
    rest: {},
    hover: {},
    active: {},
  } : {
    ...navItem,
    active: {
      ...navItem.active,
      scale: 1.05,
    },
  };

  const underlineVariants = prefersReducedMotion ? {
    inactive: { width: 0 },
    active: { width: '100%' },
  } : {
    inactive: { 
      width: 0,
      transition: optimizedTransitions.fast,
    },
    active: { 
      width: '100%',
      transition: optimizedTransitions.fast,
    },
  };

  return (
    <motion.div
      className="relative"
      variants={itemVariants}
      initial="rest"
      whileHover="hover"
      animate={isActive ? "active" : "rest"}
    >
      <Link
        to={item.href}
        onClick={onClick}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
          ${isActive 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
          }
          ${isMobile ? 'w-full justify-start' : ''}
        `}
      >
        <span className="text-lg">{item.icon}</span>
        <span>{item.name}</span>
      </Link>
      
      {/* Active indicator underline */}
      {!isMobile && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-blue-600 dark:bg-blue-400"
          variants={underlineVariants}
          animate={isActive ? "active" : "inactive"}
        />
      )}
    </motion.div>
  );
};

// Mobile Menu Button
const MobileMenuButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
}> = ({ isOpen, onClick }) => {
  const prefersReducedMotion = useReducedMotion();

  const lineVariants = prefersReducedMotion ? {
    closed: { rotate: 0, y: 0 },
    open: { rotate: 45, y: 0 },
  } : {
    closed: { 
      rotate: 0, 
      y: 0,
      transition: optimizedTransitions.fast,
    },
    open: { 
      rotate: 45, 
      y: 0,
      transition: optimizedTransitions.fast,
    },
  };

  const middleLineVariants = prefersReducedMotion ? {
    closed: { opacity: 1 },
    open: { opacity: 0 },
  } : {
    closed: { 
      opacity: 1,
      transition: optimizedTransitions.fast,
    },
    open: { 
      opacity: 0,
      transition: optimizedTransitions.fast,
    },
  };

  const bottomLineVariants = prefersReducedMotion ? {
    closed: { rotate: 0, y: 0 },
    open: { rotate: -45, y: -8 },
  } : {
    closed: { 
      rotate: 0, 
      y: 0,
      transition: optimizedTransitions.fast,
    },
    open: { 
      rotate: -45, 
      y: -8,
      transition: optimizedTransitions.fast,
    },
  };

  return (
    <motion.button
      onClick={onClick}
      className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Toggle mobile menu"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <motion.span
          className="w-6 h-0.5 bg-current block mb-1"
          variants={lineVariants}
          animate={isOpen ? "open" : "closed"}
        />
        <motion.span
          className="w-6 h-0.5 bg-current block mb-1"
          variants={middleLineVariants}
          animate={isOpen ? "open" : "closed"}
        />
        <motion.span
          className="w-6 h-0.5 bg-current block"
          variants={bottomLineVariants}
          animate={isOpen ? "open" : "closed"}
        />
      </div>
    </motion.button>
  );
};

// User Menu Dropdown
const UserMenuDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const dropdownVariants = prefersReducedMotion ? {
    closed: { opacity: 0, scale: 0.95 },
    open: { opacity: 1, scale: 1 },
  } : {
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: optimizedTransitions.fast,
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: optimizedTransitions.fast,
    },
  };

  const menuItems = [
    { name: 'Profile', href: '/profile', icon: '👤' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
    { name: 'Help', href: '/help', icon: '❓' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Dropdown */}
          <motion.div
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            variants={dropdownVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="py-2">
              {/* User info */}
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              
              {/* Menu items */}
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Main Animated Navbar Component
export const AnimatedNavbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { isVisible, isAtTop } = useScrollNavbar();
  const prefersReducedMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsUserMenuOpen(false);
    };

    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const navbarVariants = prefersReducedMotion ? {
    visible: { y: 0 },
    hidden: { y: 0 },
  } : {
    visible: {
      y: 0,
      transition: optimizedTransitions.fast,
    },
    hidden: {
      y: -100,
      transition: optimizedTransitions.fast,
    },
  };

  const backgroundVariants = prefersReducedMotion ? {
    top: { backgroundColor: 'rgba(255, 255, 255, 0)' },
    scrolled: { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
  } : {
    top: {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      backdropFilter: 'blur(0px)',
      transition: optimizedTransitions.fast,
    },
    scrolled: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      transition: optimizedTransitions.fast,
    },
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-700"
      variants={navbarVariants}
      animate={isVisible ? "visible" : "hidden"}
    >
      <motion.div
        className="dark:bg-gray-900/95"
        variants={backgroundVariants}
        animate={isAtTop ? "top" : "scrolled"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0"
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              transition={optimizedTransitions.hover}
            >
              <Link
                to="/"
                className="flex items-center space-x-2 text-xl font-bold text-blue-600 dark:text-blue-400"
              >
                <span className="text-2xl">🗳️</span>
                <span>ElectionEdu</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <AnimatedNavItem
                  key={item.name}
                  item={item}
                  isActive={location.pathname === item.href}
                />
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <ThemeToggle />

              {/* Auth buttons or user menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <motion.button
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  >
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.name}
                    </span>
                  </motion.button>
                  
                  <UserMenuDropdown
                    isOpen={isUserMenuOpen}
                    onClose={() => setIsUserMenuOpen(false)}
                  />
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link to="/login">
                    <AnimatedButton variant="ghost" size="sm">
                      Login
                    </AnimatedButton>
                  </Link>
                  <Link to="/register">
                    <AnimatedButton variant="primary" size="sm">
                      Sign Up
                    </AnimatedButton>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <MobileMenuButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-gray-200 dark:border-gray-700"
              variants={mobileMenu}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="px-4 py-2 space-y-1 bg-white dark:bg-gray-900">
                {navigationItems.map((item) => (
                  <AnimatedNavItem
                    key={item.name}
                    item={item}
                    isActive={location.pathname === item.href}
                    isMobile
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
                
                {/* Mobile auth buttons */}
                {!isAuthenticated && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full"
                    >
                      <AnimatedButton variant="ghost" fullWidth>
                        Login
                      </AnimatedButton>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full"
                    >
                      <AnimatedButton variant="primary" fullWidth>
                        Sign Up
                      </AnimatedButton>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.nav>
  );
};

export default AnimatedNavbar;