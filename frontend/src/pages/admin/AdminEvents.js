import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    imageUrl: ''
  });

  // Load events from API
  useEffect(() => {
    if (window.netlifyIdentity) {
      const currentUser = window.netlifyIdentity.currentUser();
      if (!currentUser) navigate('/admin/login');
    }
    fetchEvents();
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events'); // GET /api/events
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events', error);
      toast.error('Failed to load events');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, formData); // PUT /api/events/:id
        toast.success('Event updated successfully');
      } else {
        await api.post('/events', formData); // POST /api/events
        toast.success('Event created successfully');
      }
      fetchEvents();
      setShowForm(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        location: '',
        imageUrl: ''
      });
    } catch (error) {
      console.error('Failed to save event', error);
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      location: event.location,
      imageUrl: event.imageUrl
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`); // DELETE /api/events/:id
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event', error);
      toast.error('Failed to delete event');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <div className="min-h-screen bg-background" data-testid="admin-events-page">
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="hover:text-white/80" data-testid="back-to-dashboard">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex items-center space-x-3">
              <Calendar size={32} />
              <h1 className="font-serif text-2xl font-bold">Manage Events</h1>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-secondary text-primary hover:bg-secondary/90 px-4 py-2 rounded-full transition-colors"
            data-testid="add-event-btn"
          >
            <Plus size={20} />
            <span>New Event</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showForm && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8" data-testid="event-form">
            <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {['title', 'description', 'eventDate', 'location', 'imageUrl'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {field === 'eventDate' ? 'Event Date & Time *' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {field === 'description' ? (
                    <textarea
                      name={field}
                      required
                      rows={6}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                      data-testid={`event-${field}-input`}
                    />
                  ) : (
                    <input
                      type={field === 'eventDate' ? 'datetime-local' : 'text'}
                      name={field}
                      required={field !== 'location' && field !== 'imageUrl'}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                      data-testid={`event-${field}-input`}
                    />
                  )}
                </div>
              ))}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-3 font-medium transition-colors"
                  data-testid="event-submit-btn"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                    setFormData({
                      title: '',
                      description: '',
                      eventDate: '',
                      location: '',
                      imageUrl: ''
                    });
                  }}
                  className="border border-gray-300 text-muted-foreground hover:bg-gray-50 rounded-full px-8 py-3 font-medium transition-colors"
                  data-testid="event-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl" data-testid="no-events">
            <Calendar size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No events yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl p-6 shadow-lg flex justify-between items-start"
                data-testid={`event-${event.id}`}
              >
                <div className="flex-1">
                  <h3 className="font-serif text-2xl font-semibold text-primary mb-2">{event.title}</h3>
                  <p className="text-muted-foreground mb-2">{event.description}</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Date:</strong> {formatDate(event.eventDate)}</p>
                    {event.location && <p><strong>Location:</strong> {event.location}</p>}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                    data-testid={`edit-event-${event.id}`}
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                    data-testid={`delete-event-${event.id}`}
                  >
                    <Trash2 size={20} />
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
