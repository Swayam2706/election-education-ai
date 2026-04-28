import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { SkipToContent } from '../utils/accessibility';

export default function Layout() {
  const location = useLocation();

  // Announce route changes to screen readers
  useEffect(() => {
    const pageTitle = document.title;
    const announcer = document.getElementById('route-announcer');
    if (announcer) {
      announcer.textContent = `Navigated to ${pageTitle}`;
    }
  }, [location]);

  return (
    <>
      {/* Skip to content link for keyboard users */}
      <SkipToContent />
      
      {/* Screen reader announcements */}
      <div
        id="route-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      <div className="min-h-screen flex flex-col">
        {/* Navigation landmark */}
        <Navbar />
        
        {/* Main content landmark */}
        <main id="main-content" role="main" className="flex-1" tabIndex={-1}>
          <Outlet />
        </main>
        
        {/* Footer landmark */}
        <Footer />
      </div>
    </>
  );
}