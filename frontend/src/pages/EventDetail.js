import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import api from "../services/api";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (error) {
        console.error("Failed to load event:", error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-primary mb-4">
            Event Not Found
          </h1>
          <Link to="/events" className="text-primary hover:underline">
            Return to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <article className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/events"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-8"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Events
          </Link>

          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-96 object-cover rounded-2xl mb-8 shadow-lg"
            />
          )}

          <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-6">
            <div className="flex items-center text-primary mb-2 md:mb-0">
              <Calendar size={24} className="mr-2" />
              <span className="font-medium text-lg">
                {formatDate(event.eventDate)}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center text-muted-foreground">
                <MapPin size={24} className="mr-2" />
                <span className="text-lg">{event.location}</span>
              </div>
            )}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-8">
            {event.title}
          </h1>

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
            <p>{event.description}</p>
          </div>
        </div>
      </article>
    </div>
  );
};

export default EventDetail;
