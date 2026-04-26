// frontend/src/pages/admin/AdminEvents.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, MapPin, Clock, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, publicApi } from '../../utils/api';

const emptyForm = {
  title: '',
  description: '',
  eventDate: '',
  location: '',
  imageUrl: '',
};

// ─── Event Form Component ─────────────────────────────────────────
const EventForm = ({ formData, editingEvent, onChange, onSubmit, onCancel }) => (
  <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
    <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
      {editingEvent ? 'Edit Event' : 'Create New Event'}
    </h2>

    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Event Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onChange}
          placeholder="Enter event title"
          required
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Full event description"
          required
          rows="5"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Event Date & Time *</label>
        <input
          type="datetime-local"
          name="eventDate"
          value={formData.eventDate}
          onChange={onChange}
          required
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={onChange}
          placeholder="Event location (online or physical address)"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Image URL</label>
        <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={onChange}
          placeholder="https://example.com/event-image.jpg"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {formData.imageUrl && (
          <div className="mt-2">
            <img 
              src={formData.imageUrl} 
              alt="Preview" 
              className="h-32 w-auto object-cover rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
              }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition">
          {editingEvent ? 'Update Event' : 'Create Event'}
        </button>
        <button type="button" onClick={onCancel} className="border px-6 py-2 rounded-full hover:bg-gray-50 transition">
          Cancel
        </button>
      </div>
    </form>
  </div>
);

// ─── Main Component ─────────────────────────────────────────
const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  // ✅ Load events from MongoDB
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await publicApi.getEvents();
      
      // Sort by event date (upcoming first)
      const sorted = [...data].sort(
        (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
      );
      
      setEvents(sorted);
    } catch (err) {
      console.error('Load events error:', err);
      toast.error(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // ✅ Reset form
  const resetForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData(emptyForm);
  };

  // ✅ Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingEvent) {
        // Update existing event
        await adminApi.updateEvent(editingEvent._id || editingEvent.id, formData);
        toast.success('Event updated successfully! ✅');
      } else {
        // Create new event
        await adminApi.createEvent(formData);
        toast.success('Event created successfully! ✅');
      }

      await loadEvents(); // Refresh the list
      resetForm(); // Clear form
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit
  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventDate: event.eventDate?.slice(0, 16) || '', // Format for datetime-local
      location: event.location || '',
      imageUrl: event.imageUrl || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Delete
  const handleDelete = async (event) => {
    const eventId = event._id || event.id;
    if (!window.confirm(`Delete event "${event.title}"? This action cannot be undone.`)) return;

    setLoading(true);
    try {
      await adminApi.deleteEvent(eventId);
      toast.success('Event deleted successfully! 🗑️');
      await loadEvents();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Change handler
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ✅ Check if event is upcoming or past
  const isUpcoming = (eventDate) => {
    return new Date(eventDate) > new Date();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="hover:opacity-80 transition">
                <ArrowLeft size={24} />
              </Link>
              <div className="flex items-center space-x-3">
                <Calendar size={32} />
                <h1 className="text-2xl font-bold">Manage Events</h1>
              </div>
            </div>

            <button
              onClick={() => {
                setShowForm(!showForm);
                resetForm();
              }}
              className="flex items-center gap-2 bg-secondary text-primary px-4 py-2 rounded-full hover:bg-secondary/90 transition"
              disabled={loading}
            >
              <Plus size={20} />
              New Event
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading && !showForm && events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading events...</p>
          </div>
        ) : (
          <>
            {/* Form */}
            {showForm && (
              <EventForm
                formData={formData}
                editingEvent={editingEvent}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={resetForm}
              />
            )}

            {/* Events Grid */}
            {events.length === 0 && !showForm ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-xl text-gray-500 mb-4">No events scheduled yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition"
                >
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => {
                  const upcoming = isUpcoming(event.eventDate);
                  const eventId = event._id || event.id;
                  
                  return (
                    <div
                      key={eventId}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {event.imageUrl && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x200?text=Event+Image';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-primary flex-1">
                            {event.title}
                          </h3>
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={() => handleEdit(event)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(event)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {event.description}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock size={16} />
                            <span className={upcoming ? 'text-green-600 font-medium' : 'text-gray-400'}>
                              {formatDate(event.eventDate)}
                              {upcoming && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Upcoming</span>}
                            </span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <MapPin size={16} />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
