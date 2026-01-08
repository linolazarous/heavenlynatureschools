import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem('schoolEvents') || '[]');
    setEvents(storedEvents);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen pt-24" data-testid="events-page">
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
              Upcoming Events
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join us for our upcoming activities and programs
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-20" data-testid="events-empty-state">
              <p className="text-xl text-muted-foreground mb-8">
                No upcoming events at the moment. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  data-testid={`event-${event.id}`}
                >
                  <div className="md:flex">
                    {event.imageUrl && (
                      <div
                        className="md:w-1/3 h-64 md:h-auto bg-cover bg-center"
                        style={{ backgroundImage: `url(${event.imageUrl})` }}
                      ></div>
                    )}
                    <div className="p-8 md:w-2/3">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div className="flex items-center text-primary mb-2 md:mb-0">
                          <Calendar size={20} className="mr-2" />
                          <span className="font-medium">{formatDate(event.eventDate)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin size={20} className="mr-2" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                      <h2 className="font-serif text-3xl font-semibold text-primary mb-4">
                        {event.title}
                      </h2>
                      <p className="text-muted-foreground mb-6 line-clamp-3">
                        {event.description}
                      </p>
                      <Link
                        to={`/events/${event.id}`}
                        className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                        data-testid={`event-details-${event.id}`}
                      >
                        View Details
                        <ArrowRight className="ml-2" size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;