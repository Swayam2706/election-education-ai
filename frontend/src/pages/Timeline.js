import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { apiService } from '../services/api.service';
import { AnimatedContainer } from '../animations/motion-components/AnimatedContainer';
import { ScrollReveal } from '../animations/scroll-effects/ScrollAnimations';

const TimelineEvent = ({ event, index }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'current':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'upcoming':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'current':
        return 'border-orange-500 bg-orange-50';
      case 'upcoming':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <ScrollReveal delay={index * 0.1}>
      <div className={`card p-6 border-l-4 ${getStatusColor(event.status)}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getStatusIcon(event.status)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                event.status === 'completed' ? 'bg-green-100 text-green-800' :
                event.status === 'current' ? 'bg-orange-100 text-orange-800' :
                event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>
            
            <p className="text-muted-foreground mb-3">{event.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
            
            {event.details && (
              <div className="mt-3 p-3 bg-background rounded-lg">
                <p className="text-sm text-foreground">{event.details}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default function Timeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.year) params.year = filters.year;
      
      const response = await apiService.get('/timeline', { params });
      setEvents(response.data?.events || response.events || []);
    } catch (error) {
      console.error('Failed to load timeline events:', error);
      setError('Failed to load timeline events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['election', 'registration', 'voting', 'results'];
  const statuses = ['upcoming', 'current', 'completed'];
  const years = [2024, 2025, 2026, 2027];

  if (loading) {
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
            <h1 className="text-4xl font-bold text-foreground mb-4">Election Timeline</h1>
            <p className="text-xl text-muted-foreground">
              Stay informed about important election dates and deadlines
            </p>
          </div>

          {/* Filters */}
          <div className="card p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Filter Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="input w-full"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="card p-6 mb-8 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
              <button
                onClick={loadEvents}
                className="btn-primary mt-4"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Timeline Events */}
          {events.length > 0 ? (
            <div className="space-y-6">
              {events.map((event, index) => (
                <TimelineEvent key={event._id} event={event} index={index} />
              ))}
            </div>
          ) : !loading && !error && (
            <div className="card p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Events Found</h3>
              <p className="text-muted-foreground">
                No timeline events match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </AnimatedContainer>
      </div>
    </div>
  );
}