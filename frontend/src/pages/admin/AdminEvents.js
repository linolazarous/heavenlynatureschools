// frontend/src/pages/admin/AdminEvents.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/events');
      setEvents(response.data || []);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to load events';
      console.error('Fetch error:', err);
      toast.error(msg);
      setError(msg);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        eventDate: new Date(formData.eventDate).toISOString(),
      };

      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, payload);
        toast.success('Event updated successfully');
      } else {
        await api.post('/events', payload);
        toast.success('Event created successfully');
      }

      setShowForm(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save event';
      toast.error(msg);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/admin/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      eventDate: event.eventDate
        ? new Date(event.eventDate).toISOString().slice(0, 16)
        : '',
      location: event.location || '',
      imageUrl: event.imageUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event permanently?')) return;

    // Optimistic update
    const oldEvents = [...events];
    setEvents(events.filter((ev) => ev.id !== id));

    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
    } catch (err) {
      toast.error('Failed to delete event');
      setEvents(oldEvents); // rollback
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/admin/login');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      location: '',
      imageUrl: '',
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-events-page">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="hover:text-white/80 transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex items-center space-x-3">
              <Calendar size={32} />
              <h1 className="font-serif text-2xl font-bold">Manage Events</h1>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={showForm}
            className="flex items-center space-x-2 bg-white text-primary hover:bg-white/90 px-5 py-2.5 rounded-full font-medium transition-colors disabled:opacity-50"
          >
            <Plus size={20} />
            <span>New Event</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-8 text-center">
            {error}
            <button
              onClick={fetchEvents}
              className="ml-3 underline hover:no-underline font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-gray-100">
            <h2 className="font-serif text-2xl font-bold text-primary mb-8">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (optional)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/event-poster.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-full font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-full font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Calendar size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No events scheduled yet</h3>
            <p className="text-gray-500">Add your first school event using the button above.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-primary mb-3 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                  <div className="space-y-1 text-sm text-gray-500 mb-4">
                    <p><strong>Date:</strong> {formatDate(event.eventDate)}</p>
                    {event.location && <p><strong>Location:</strong> {event.location}</p>}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
