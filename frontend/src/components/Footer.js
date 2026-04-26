import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Mail, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  const footerSections = [
    {
      title: 'Learn',
      links: [
        { label: 'Articles', href: '/learn' },
        { label: 'Quizzes', href: '/quiz' },
        { label: 'Timeline', href: '/timeline' },
        { label: 'FAQ', href: '/faq' }
      ]
    },
    {
      title: 'Tools',
      links: [
        { label: 'AI Assistant', href: '/chat' },
        { label: 'Eligibility Check', href: '/eligibility' },
        { label: 'Dashboard', href: '/dashboard' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact', href: '/contact' },
        { label: 'About', href: '/about' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' }
      ]
    }
  ];

  const socialLinks = [
    { platform: 'Twitter', url: 'https://twitter.com/electedu', icon: Twitter },
    { platform: 'Facebook', url: 'https://facebook.com/electedu', icon: Facebook },
    { platform: 'Instagram', url: 'https://instagram.com/electedu', icon: Instagram }
  ];

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                <span className="text-primary">Elect</span>
                <span className="text-foreground">Edu</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              Empowering citizens with knowledge about elections, voting, and democracy. 
              Learn, practice, and participate in the democratic process.
            </p>
            
            {/* Newsletter */}
            <div className="mb-4">
              <h4 className="font-semibold text-foreground mb-2">Stay Informed</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Get the latest election updates and civic education content.
              </p>
              <div className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-r-md hover:bg-primary/90 transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 ElectEdu. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex space-x-4 mt-4 sm:mt-0">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.platform}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}