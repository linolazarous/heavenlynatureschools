// frontend/src/pages/EventDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, Clock, Share2, Heart, Bookmark, Users, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { publicApi } from '../utils/api';

// Max length (characters) for the SEO description snippet
const SEO_DESCRIPTION_MAX_LENGTH = 160;

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [interested, setInterested] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState([]);

  useEffect(() => {
    loadEvent();
    // Check local storage for interested/saved status
    const interestedEvents = JSON.parse(localStorage.getItem('interested_events') || '[]');
    const savedEvents = JSON.parse(localStorage.getItem('saved_events') || '[]');
    setInterested(interestedEvents.includes(id));
    setSaved(savedEvents.includes(id));
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const data = await publicApi.getEvent(id);
      if (!data) {
        setNotFound(true);
      } else {
        setEvent(data);
        // Load related events (same month or similar)
        await loadRelatedEvents(data);
      }
    } catch (err) {
      console.error('Failed to load event:', err);
      if (err.message === '404' || err.message.includes('not found')) {
        setNotFound(true);
      } else {
        toast.error('Failed to load event details');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedEvents = async (currentEvent) => {
    try {
      const allEvents = await publicApi.getEvents();
      const related = allEvents
        .filter(e => (e._id || e.id) !== (currentEvent._id || currentEvent.id))
        .filter(e => {
          // Show events from same month or upcoming events
          const currentDate = new Date(currentEvent.eventDate);
          const eventDate = new Date(e.eventDate);
          return eventDate.getMonth() === currentDate.getMonth() || 
                 eventDate > new Date();
        })
        .slice(0, 3);
      setRelatedEvents(related);
    } catch (err) {
      console.error('Failed to load related events:', err);
    }
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

  const formatShortDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date();
  };

  const getDaysUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past event';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  // Handle share functionality
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = encodeURIComponent(event.title);
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${title}`,
      email: `mailto:?subject=${title}&body=Check out this event: ${url}`
    };
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Event link copied to clipboard!');
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  // Handle interested
  const handleInterested = () => {
    const newInterested = !interested;
    setInterested(newInterested);
    const interestedEvents = JSON.parse(localStorage.getItem('interested_events') || '[]');
    if (newInterested) {
      interestedEvents.push(id);
      toast.success(`You're interested in this event! We'll remind you closer to the date. 🎉`);
    } else {
      const index = interestedEvents.indexOf(id);
      if (index > -1) interestedEvents.splice(index, 1);
      toast.info('Removed from your interested events');
    }
    localStorage.setItem('interested_events', JSON.stringify(interestedEvents));
  };

  // Handle save for later
  const handleSave = () => {
    const newSaved = !saved;
    setSaved(newSaved);
    const savedEvents = JSON.parse(localStorage.getItem('saved_events') || '[]');
    if (newSaved) {
      savedEvents.push(id);
      toast.success('Event saved to your calendar! 📅');
    } else {
      const index = savedEvents.indexOf(id);
      if (index > -1) savedEvents.splice(index, 1);
      toast.info('Removed from saved events');
    }
    localStorage.setItem('saved_events', JSON.stringify(savedEvents));
  };

  // Add to Google Calendar
  const addToGoogleCalendar = () => {
    const startDate = new Date(event.eventDate);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hours duration
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/-|:|\./g, '')}/${endDate.toISOString().replace(/-|:|\./g, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location || '')}`;
    window.open(url, '_blank');
    toast.success('Opening Google Calendar...');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-4">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center" data-testid="event-not-found">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-gray-400 mb-6">
            <CalendarIcon size={64} className="mx-auto" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-primary mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-x-4">
            <Link
              to="/events"
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition inline-block"
              data-testid="back-to-events-link"
            >
              Browse All Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const upcoming = isUpcoming(event.eventDate);
  const daysUntil = getDaysUntil(event.eventDate);

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-gray-50 to-white" data-testid="event-detail-page">
      <SEO
        path={`/events/${id}`}
        title={`${event.title} | Heavenly Nature Schools Events`}
        description={event.description ? event.description.substring(0, SEO_DESCRIPTION_MAX_LENGTH) : event.title}
        keywords="school event, educational event, Heavenly Nature Schools, upcoming event"
      />
      
      <article>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-primary to-primary/90 text-white py-16">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link 
              to="/events" 
              className="inline-flex items-center text-white/90 hover:text-white mb-6 transition"
              data-testid="back-to-events-btn"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Events
            </Link>
            
            {event.imageUrl && (
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl mb-8"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/1200x600?text=Event';
                }}
              />
            )}
            
            <div className="flex flex-wrap gap-4 text-white/80 text-sm mb-4">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                {formatDate(event.eventDate)}
              </div>
              {event.location && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  {event.location}
                </div>
              )}
            </div>
            
            <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
              {event.title}
            </h1>
            
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                upcoming 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}>
                {upcoming ? daysUntil : 'Past Event'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between mb-8 pb-4 border-b gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleInterested}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                    interested ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Users size={18} />
                  <span>{interested ? 'Interested' : 'Mark Interested'}</span>
                </button>
                
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                    saved ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark size={18} className={saved ? 'fill-blue-500' : ''} />
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
                
                {upcoming && (
                  <button
                    onClick={addToGoogleCalendar}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Calendar size={18} />
                    <span>Add to Calendar</span>
                  </button>
                )}
                
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  >
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                  
                  {showShareMenu && (
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border p-2 z-10 min-w-[200px]">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      >
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      >
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      >
                        LinkedIn
                      </button>
                      <button
                        onClick={() => handleShare('email')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      >
                        Email
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      >
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="prose prose-lg max-w-none mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-primary mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Event Details Card */}
            <div className="bg-primary/5 rounded-2xl p-8 mb-12">
              <h3 className="font-serif text-xl font-bold text-primary mb-4">Event Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-muted-foreground">{formatDate(event.eventDate)}</p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">Approximately 2 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <div>
                <h3 className="font-serif text-2xl font-bold text-primary mb-6">Related Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedEvents.map((relatedEvent) => {
                    const relatedId = relatedEvent._id || relatedEvent.id;
                    return (
                      <Link
                        key={relatedId}
                        to={`/events/${relatedId}`}
                        className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
                      >
                        {relatedEvent.imageUrl && (
                          <div className="h-32 overflow-hidden">
                            <img
                              src={relatedEvent.imageUrl}
                              alt={relatedEvent.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <p className="text-sm text-primary font-medium mb-1">
                            {formatShortDate(relatedEvent.eventDate)}
                          </p>
                          <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                            {relatedEvent.title}
                          </h4>
                          <div className="flex items-center text-primary text-sm group-hover:underline">
                            Learn More
                            <ChevronRight size={14} className="ml-1" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="mt-12 pt-8 border-t text-center">
              <h3 className="font-serif text-2xl font-bold text-primary mb-3">
                Interested in attending?
              </h3>
              <p className="text-muted-foreground mb-6">
                Contact us for more information or to register for this event
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 transition"
              >
                Contact Us
                <ArrowLeft className="ml-2 rotate-180" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default EventDetail;
