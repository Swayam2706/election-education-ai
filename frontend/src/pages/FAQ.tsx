import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { faqService } from '../services/faq.service';
import { AnimatedContainer } from '../animations/motion-components/AnimatedContainer';
import { ScrollReveal } from '../animations/scroll-effects/ScrollAnimations';
import { logger } from '../utils/logger';

interface FAQItemType {
  _id: string;
  question: string;
  answer: string;
  tags?: string[];
  helpfulCount?: number;
  notHelpfulCount?: number;
}

interface FAQItemProps {
  faq: FAQItemType;
  index: number;
  onVote: (faqId: string, helpful: boolean) => Promise<void>;
}

const FAQItem: React.FC<FAQItemProps> = ({ faq, index, onVote }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [voting, setVoting] = useState(false);

  const handleVote = async (helpful) => {
    if (voting) return;
    
    setVoting(true);
    try {
      await onVote(faq._id, helpful);
    } finally {
      setVoting(false);
    }
  };

  return (
    <ScrollReveal delay={index * 0.05}>
      <div className="card p-6 border border-border hover:border-primary/20 transition-colors">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left flex items-center justify-between gap-4"
        >
          <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
        </button>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="prose prose-sm max-w-none text-foreground">
              <p>{faq.answer}</p>
            </div>
            
            {faq.tags && faq.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {faq.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Was this helpful?</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote(true)}
                  disabled={voting}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{faq.helpfulCount || 0}</span>
                </button>
                <button
                  onClick={() => handleVote(false)}
                  disabled={voting}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>{faq.notHelpfulCount || 0}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollReveal>
  );
};

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadFAQs();
    loadCategories();
  }, [search, category]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (category) params.category = category;
      
      const response = await faqService.getFAQs(params);
      setFaqs(response.data?.faqs || []);
    } catch (error) {
      logger.error('Failed to load FAQs', error);
      setError('Failed to load FAQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await faqService.getCategories();
      setCategories(response.data?.categories || []);
    } catch (error) {
      logger.error('Failed to load categories', error);
    }
  };

  const handleVote = async (faqId: string, helpful: boolean) => {
    try {
      await faqService.voteHelpful(faqId, helpful);
      
      // Update local state
      setFaqs(prev => prev.map(faq => {
        if (faq._id === faqId) {
          return {
            ...faq,
            helpfulCount: helpful ? (faq.helpfulCount || 0) + 1 : faq.helpfulCount,
            notHelpfulCount: !helpful ? (faq.notHelpfulCount || 0) + 1 : faq.notHelpfulCount
          };
        }
        return faq;
      }));
    } catch (error) {
      logger.error('Failed to vote', error);
    }
  };

  if (loading && faqs.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatedContainer>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about the election process
            </p>
          </div>

          {/* Search and Filters */}
          <div className="card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input w-full"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="card p-6 mb-8 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 text-red-800">
                <HelpCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
              <button
                onClick={loadFAQs}
                className="btn-primary mt-4"
              >
                Try Again
              </button>
            </div>
          )}

          {/* FAQ List */}
          {faqs.length > 0 ? (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={faq._id}
                  faq={faq}
                  index={index}
                  onVote={handleVote}
                />
              ))}
            </div>
          ) : !loading && !error && (
            <div className="card p-12 text-center">
              <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No FAQs Found</h3>
              <p className="text-muted-foreground">
                {search || category
                  ? "No FAQs match your search criteria. Try adjusting your search or category filter."
                  : "No FAQs are available at the moment. Please check back later."
                }
              </p>
            </div>
          )}
        </AnimatedContainer>
      </div>
    </div>
  );
}