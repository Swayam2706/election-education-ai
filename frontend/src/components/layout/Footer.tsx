'use client';

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, Twitter, Github, Linkedin, Mail,
  ArrowRight, Shield, Globe, Heart,
} from 'lucide-react';

const footerLinks = {
  platform: [
    { label: 'AI Assistant', href: '/chat' },
    { label: 'Election Timeline', href: '/timeline' },
    { label: 'Eligibility Checker', href: '/eligibility' },
    { label: 'Learning Dashboard', href: '/learn' },
    { label: 'Quiz System', href: '/quiz' },
  ],
  resources: [
    { label: 'How to Vote', href: '/learn' },
    { label: 'Election Calendar', href: '/timeline' },
    { label: 'Voter Rights', href: '/learn' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Glossary', href: '/learn' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'Contact', href: '/contact' },
  ],
};

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: '#', label: 'Email' },
];

export function Footer() {
  return (
    <footer className="relative bg-foreground/[0.03] border-t border-border mt-24" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                <span className="gradient-text">Elect</span>
                <span className="text-foreground">Edu</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-6">
              Empowering citizens with knowledge about democratic processes. 
              Free, accessible, and available in multiple languages.
            </p>

            {/* Newsletter */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email for newsletter"
                className="flex-1 input-premium text-sm"
              />
              <button
                aria-label="Subscribe to newsletter"
                className="btn-premium px-4 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-1.5 whitespace-nowrap"
              >
                Subscribe <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2 mt-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-4">
                {section === 'platform' ? 'Platform' : section === 'resources' ? 'Resources' : 'Company'}
              </h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                    >
                      <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="section-divider mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for democratic education
            &nbsp;·&nbsp; © {new Date().getFullYear()} ElectEdu
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              WCAG 2.1 AA
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              3 Languages
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
