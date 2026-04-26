import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

const emptyForm = {
  title: '',
  description: '',
  eventDate: '',
  location: '',
  imageUrl: '',
};

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  // ✅ Load events
  const loadEvents = useCallback(async () => {
    try {
      const data = await apiFetch('/api/events');

      // Sort newest first
      const sorted = [...data].sort(
        (a, b) => new Date(b.eventDate) - new Date(a.eventDate)
      );

      setEvents(sorted);
    } catch (err) {
      toast.error(err.message || 'Failed to load events');
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

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingEvent) {
        await apiFetch(`/api/admin/events/${editingEvent.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        toast.success('Event updated successfully');
      } else {
        await apiFetch('/api/admin/events', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toast.success('Event created successfully');
      }

      await loadEvents(); // 🔄 always sync with backend
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save event');
    }
  };

  // ✅ Edit
  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      location: event.location || '',
      imageUrl: event.imageUrl || '',
    });
    setShowForm(true);
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await apiFetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      toast.success('Event deleted');

      await loadEvents(); // 🔄 always sync
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  // ✅ Change
  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ✅ Format date
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/admin">
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
              setEditingEvent(null);
              setFormData(emptyForm);
            }}
            className="flex items-center gap-2 bg-secondary text-primary px-4 py-2 rounded-full"
          >
            <Plus size={20} />
            New Event
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-2xl shadow mb-8">
            <h2 className="text-2xl font-semibold mb-6">
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Event Title"
                required
                className="w-full p-3 border rounded"
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                required
                rows="5"
                className="w-full p-3 border rounded"
              />

              <input
                type="datetime-local"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded"
              />

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                className="w-full p-3 border rounded"
              />

              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Image URL"
                className="w-full p-3 border rounded"
              />

              <div className="flex gap-4">
                <button className="bg-primary text-white px-6 py-2 rounded-full">
                  {editingEvent ? 'Update' : 'Create'}
                </button>

                <button type="button" onClick={resetForm} className="border px-6 py-2 rounded-full">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-500">No events yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="bg-white p-6 rounded-2xl shadow flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <p>{event.description}</p>
                  <p className="text-sm text-gray-500">{formatDate(event.eventDate)}</p>
                  {event.location && <p className="text-sm">{event.location}</p>}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleEdit(event)}>
                    <Edit />
                  </button>
                  <button onClick={() => handleDelete(event.id)}>
                    <Trash2 />
                  </button>
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
