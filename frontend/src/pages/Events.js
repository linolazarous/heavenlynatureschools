// frontend/src/pages/Events.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Clock, Users, Filter, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { publicApi } from '../utils/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [viewMode, setViewMode] = useState('list'); // list, grid

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, filter]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await publicApi.getEvents();
      const eventsArray = Array.isArray(data) ? data : [];
      
      // Sort events by date (upcoming first)
      const sortedEvents = eventsArray.sort((a, b) => 
        new Date(a.eventDate) - new Date(b.eventDate)
      );
      
      setEvents(sortedEvents);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError(err.message || 'Failed to load events');
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    const now = new Date();
    let filtered = [...events];
    
    switch (filter) {
      case 'upcoming':
        filtered = events.filter(event => new Date(event.eventDate) >= now);
        break;
      case 'past':
        filtered = events.filter(event => new Date(event.eventDate) < now);
        break;
      default:
        break;
    }
    
    setFilteredEvents(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date();
  };

  const getEventStatus = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Past Event', color: 'text-gray-500', bg: 'bg-gray-100' };
    if (diffDays === 0) return { text: 'Today', color: 'text-red-600', bg: 'bg-red-50' };
    if (diffDays <= 7) return { text: `In ${diffDays} day${diffDays > 1 ? 's' : ''}`, color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: 'Upcoming', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const renderLoading = () => (
    <div className="text-center py-20">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground mt-4">Loading events...</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-20" data-testid="events-error-state">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-xl text-red-600 mb-4">{error}</p>
      <button
        onClick={loadEvents}
        className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition"
      >
        Try Again
      </button>
    </div>
  );

  const renderEmpty = () => (
    <div className="text-center py-20" data-testid="events-empty-state">
      <div className="text-gray-400 mb-4">
        <CalendarIcon size={64} className="mx-auto" />
      </div>
      <p className="text-xl text-muted-foreground mb-4">
        {filter === 'upcoming' 
          ? 'No upcoming events at the moment.' 
          : filter === 'past'
          ? 'No past events to display.'
          : 'No events scheduled yet.'}
      </p>
      <p className="text-muted-foreground">
        Check back soon for updates and new activities!
      </p>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-6">
      {filteredEvents.map((event) => {
        const eventId = event._id || event.id;
        const status = getEventStatus(event.eventDate);
        const upcoming = isUpcoming(event.eventDate);
        
        return (
          <article
            key={eventId}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            data-testid={`event-${eventId}`}
          >
            <div className="md:flex">
              {event.imageUrl && (
                <div className="md:w-1/3 relative overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Event';
                    }}
                  />
                  <div className={`absolute top-4 left-4 ${status.bg} ${status.color} px-3 py-1 rounded-full text-xs font-semibold`}>
                    {status.text}
                  </div>
                </div>
              )}
              <div className="p-8 md:w-2/3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                  <div className="flex items-center text-primary">
                    <Calendar size={20} className="mr-2" />
                    <span className="font-medium">{formatDate(event.eventDate)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin size={18} className="mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  )}
                </div>
                
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-4 group-hover:text-primary/80 transition-colors">
                  {event.title}
                </h2>
                
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  {event.description}
                </p>
                
                <Link
                  to={`/events/${eventId}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium group/link"
                  data-testid={`event-details-${eventId}`}
                >
                  View Details
                  <ArrowRight className="ml-2 group-hover/link:translate-x-1 transition-transform" size={16} />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredEvents.map((event) => {
        const eventId = event._id || event.id;
        const status = getEventStatus(event.eventDate);
        const upcoming = isUpcoming(event.eventDate);
        
        return (
          <article
            key={eventId}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
            data-testid={`event-${eventId}`}
          >
            {event.imageUrl && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x250?text=Event';
                  }}
                />
                <div className={`absolute top-4 left-4 ${status.bg} ${status.color} px-2 py-1 rounded-full text-xs font-semibold`}>
                  {status.text}
                </div>
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center text-primary text-sm mb-3">
                <Calendar size={16} className="mr-2" />
                <span>{formatDate(event.eventDate)}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center text-muted-foreground text-sm mb-3">
                  <MapPin size={14} className="mr-2" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
              
              <h3 className="font-serif text-xl font-semibold text-primary mb-3 line-clamp-2">
                {event.title}
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {event.description}
              </p>
              
              <Link
                to={`/events/${eventId}`}
                className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium group/link"
              >
                Learn More
                <ChevronRight className="ml-1 group-hover/link:translate-x-1 transition-transform" size={14} />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );

  const renderContent = () => {
    if (loading) return renderLoading();
    if (error) return renderError();
    if (filteredEvents.length === 0) return renderEmpty();
    
    return viewMode === 'list' ? renderListView() : renderGridView();
  };

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-gray-50 to-white" data-testid="events-page">
      <SEO
        path="/events"
        title="Events | Heavenly Nature Schools"
        description="Upcoming events, activities, and programmes at Heavenly Nature Nursery &amp; Primary School in Juba City, South Sudan. Join us and be part of the mission."
        keywords="school events, upcoming activities, Heavenly Nature Schools, Juba, South Sudan, educational events"
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/90 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Upcoming Events
          </h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Join us for our upcoming activities and programs
          </p>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter and View Controls */}
          {!loading && !error && events.length > 0 && (
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-full transition ${
                    filter === 'all' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Events ({events.length})
                </button>
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-4 py-2 rounded-full transition ${
                    filter === 'upcoming' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Upcoming ({events.filter(e => isUpcoming(e.eventDate)).length})
                </button>
                <button
                  onClick={() => setFilter('past')}
                  className={`px-4 py-2 rounded-full transition ${
                    filter === 'past' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Past ({events.filter(e => !isUpcoming(e.eventDate)).length})
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'list' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="List View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'grid' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Grid View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {renderContent()}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users size={48} className="mx-auto text-primary mb-4" />
          <h2 className="font-serif text-3xl font-bold text-primary mb-4">
            Want to participate?
          </h2>
          <p className="text-muted-foreground mb-6">
            Contact us to learn more about our events and how you can get involved
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 transition"
          >
            Contact Us
            <ArrowRight className="ml-2" size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Events;
