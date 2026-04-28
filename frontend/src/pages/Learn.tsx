import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, User, AlertCircle } from 'lucide-react';
import { contentService } from '../services/content.service';
import { ComponentErrorBoundary } from '../components/ErrorBoundary';
import { useDebounce } from '../hooks/useDebounce';

// Memoized Article Card Component
const ArticleCard = React.memo(({ article }) => {
  return (
    <Link
      to={`/learn/${article.slug}`}
      className="card p-6 hover:shadow-lg transition-all group"
    >
      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {article.title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
        {article.excerpt}
      </p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {article.readTime} min read
        </div>
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {article.author?.name || 'ElectEdu Team'}
        </div>
      </div>
    </Link>
  );
});

ArticleCard.displayName = 'ArticleCard';

// Loading Skeleton Component
const ArticleSkeleton = React.memo(() => (
  <div className="card p-6">
    <div className="h-4 bg-muted rounded mb-2 animate-pulse"></div>
    <div className="h-3 bg-muted rounded w-3/4 mb-4 animate-pulse"></div>
    <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
  </div>
));

ArticleSkeleton.displayName = 'ArticleSkeleton';

function LearnContent() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await contentService.getContents({ 
          search: debouncedSearch,
        });
        if (response.success && response.data) {
          setContent(response.data.contents || []);
        }
      } catch (error) {
        console.error('Failed to load content:', error);
        setError(error.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [debouncedSearch]);

  // Memoized search handler
  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <ArticleSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to Load Articles</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Learn About Elections</h1>
          <p className="text-muted-foreground">
            Comprehensive articles and guides on voting, elections, and democracy
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={handleSearchChange}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>

        {content.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found.</p>
          </div>
        )}
      </div>
    </div>
  );
}


export default function Learn() {
  return (
    <ComponentErrorBoundary>
      <LearnContent />
    </ComponentErrorBoundary>
  );
}
