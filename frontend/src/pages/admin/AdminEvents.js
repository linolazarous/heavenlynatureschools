// frontend/src/pages/admin/AdminEvents.js
import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, RefreshCw } from 'lucide-react';
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
const EventForm = ({ formData, editingEvent, onChange, onSubmit, onCancel, loading }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
    <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
      {editingEvent ? 'Edit Event' : 'Create New Event'}
    </h2>

    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onChange}
          placeholder="Enter event title"
          required
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Full event description"
          required
          rows="5"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Date & Time *</label>
        <input
          type="datetime-local"
          name="eventDate"
          value={formData.eventDate}
          onChange={onChange}
          required
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={onChange}
          placeholder="Event location (online or physical address)"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
        <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={onChange}
          placeholder="https://example.com/event-image.jpg"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
        <button 
          type="submit" 
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition disabled:opacity-50"
        >
          {editingEvent ? 'Update Event' : 'Create Event'}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="border px-6 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
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
        await adminApi.updateEvent(editingEvent._id || editingEvent.id, formData);
        toast.success('Event updated successfully! ✅');
      } else {
        await adminApi.createEvent(formData);
        toast.success('Event created successfully! ✅');
      }
      await loadEvents();
      resetForm();
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
      eventDate: event.eventDate?.slice(0, 16) || '',
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

  // ✅ Refresh
  const handleRefresh = () => {
    loadEvents();
    toast.info('Refreshing events...');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Calendar size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Events</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create, edit, and manage school events
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  resetForm();
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition"
                disabled={loading}
              >
                <Plus size={18} /> New Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !showForm && events.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading events...</p>
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
                loading={loading}
              />
            )}

            {/* Empty State */}
            {events.length === 0 && !showForm && (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                <Calendar size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">No events scheduled yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition"
                >
                  Create Your First Event
                </button>
              </div>
            )}

            {/* Events Grid */}
            {events.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => {
                  const upcoming = isUpcoming(event.eventDate);
                  const eventId = event._id || event.id;
                  
                  return (
                    <div
                      key={eventId}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {event.imageUrl && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x200?text=Event+Image';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-primary flex-1 line-clamp-2">
                            {event.title}
                          </h3>
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={() => handleEdit(event)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(event)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                          {event.description}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Clock size={16} />
                            <span className={upcoming ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-400'}>
                              {formatDate(event.eventDate)}
                            </span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <MapPin size={16} />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          )}
                          
                          {upcoming && (
                            <span className="inline-block text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full mt-2">
                              Upcoming
                            </span>
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
