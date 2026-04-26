/**
 * Animated Navbar Component
 * Premium navbar with smooth animations and scroll effects
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ChevronDown, Sparkles, User, 
  Settings, LogOut, Bell, Search 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollNavbar } from '@/animations/hooks/useScrollAnimation';
import { useAnimationConfig } from '@/animations/hooks/useReducedMotion';
import { AnimatedButton, IconButton } from '@/animations/motion-components/AnimatedButton';
import { navSlide, mobileMenuSlide, fadeIn } from '@/animations/variants';
import { transitions } from '@/animations/transitions';

// ─── Navigation Items ───
const navigationItems = [
  { name: 'Home', href: '/', exact: true },
  { name: 'Learn', href: '/learn' },
  { name: 'Quiz', href: '/quiz' },
  { name: 'Timeline', href: '/timeline' },
  { name: 'Chat', href: '/chat' },
  { name: 'FAQ', href: '/faq' }
];

const userMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Sign Out', href: '/logout', icon: LogOut }
];

// ─── Animated Navbar ───
export const AnimatedNavbar: React.FC = () => {
  const location = useLocation();
  const { isVisible, isAtTop } = useScrollNavbar();
  const { shouldAnimate } = useAnimationConfig();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Close menus on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isActiveRoute = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const navbarVariants = shouldAnimate ? {
    visible: {
      y: 0,
      opacity: 1,
      transition: transitions.navbar
    },
    hidden: {
      y: -100,
      opacity: 0,
      transition: transitions.navbar
    }
  } : {};

  const logoVariants = shouldAnimate ? {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  } : {};

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        initial="visible"
        animate={isVisible ? "visible" : "hidden"}
        variants={navbarVariants}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isAtTop 
            ? 'bg-background/80 backdrop-blur-md border-b border-transparent' 
            : 'bg-background/95 backdrop-blur-lg border-b border-border shadow-lg'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              variants={logoVariants}
              whileHover="hover"
              initial="rest"
            >
              <Link to="/" className="flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"
                  whileHover={shouldAnimate ? { rotate: 5 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                <span className="text-xl font-bold gradient-text">ElectEdu</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link to={item.href}>
                    <motion.div
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors relative',
                        isActiveRoute(item.href, item.exact)
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                      whileHover={shouldAnimate ? { scale: 1.02 } : {}}
                      whileTap={shouldAnimate ? { scale: 0.98 } : {}}
                    >
                      {item.name}
                      
                      {/* Active indicator */}
                      {isActiveRoute(item.href, item.exact) && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search */}
              <IconButton
                icon={<Search className="w-4 h-4" />}
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
              />

              {/* Notifications */}
              <IconButton
                icon={<Bell className="w-4 h-4" />}
                variant="ghost"
                size="sm"
              />

              {/* User Menu */}
              <div className="relative">
                <IconButton
                  icon={<User className="w-4 h-4" />}
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                />

                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={transitions.dropdown}
                      className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl p-2 shadow-xl"
                    >
                      {userMenuItems.map((item) => (
                        <Link key={item.name} to={item.href}>
                          <motion.div
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                            whileHover={shouldAnimate ? { x: 4 } : {}}
                          >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                          </motion.div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA Button */}
              <AnimatedButton variant="primary" size="sm">
                Get Started
              </AnimatedButton>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <IconButton
                icon={isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transitions.modal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial="hidden"
              animate="show"
              exit="exit"
              variants={shouldAnimate ? mobileMenuSlide : {}}
              transition={transitions.mobileMenu}
              className="fixed top-16 right-0 bottom-0 w-80 max-w-[90vw] bg-background border-l border-border z-50 md:hidden"
            >
              <div className="p-6 space-y-6">
                {/* Navigation Links */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Navigation
                  </h3>
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={item.href}>
                        <div
                          className={cn(
                            'flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors',
                            isActiveRoute(item.href, item.exact)
                              ? 'text-primary bg-primary/10'
                              : 'text-foreground hover:bg-accent'
                          )}
                        >
                          {item.name}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* User Menu */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Account
                  </h3>
                  {userMenuItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navigationItems.length + index) * 0.1 }}
                    >
                      <Link to={item.href}>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-accent transition-colors">
                          <item.icon className="w-5 h-5" />
                          {item.name}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <AnimatedButton variant="primary" className="w-full">
                    Get Started Free
                  </AnimatedButton>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transitions.modal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsSearchOpen(false)}
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={transitions.modal}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-4 glass-card rounded-2xl p-6 z-50"
            >
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for topics, questions, or content..."
                  className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground"
                  autoFocus
                />
                <IconButton
                  icon={<X className="w-4 h-4" />}
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                Try searching for "voting process", "election timeline", or "voter registration"
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};