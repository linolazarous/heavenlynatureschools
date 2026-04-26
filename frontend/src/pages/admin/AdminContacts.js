import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Mail, MailOpen } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    apiFetch('/api/admin/contacts')
      .then(data => {
        // Sort: unread first, then by date descending
        const sorted = [...data].sort((a, b) => {
          if (a.read === b.read) return 0;
          return a.read ? 1 : -1;
        });
        setContacts(sorted);
      })
      .catch(() => toast.error('Failed to load contacts'));
    // apiFetch is a stable module import; state setters are stable React references
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await apiFetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contact message deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleToggleRead = async (id, currentRead) => {
    const newRead = !currentRead;
    try {
      await apiFetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ read: newRead }),
      });
      setContacts(prev => {
        const updated = prev.map(c => c.id === id ? { ...c, read: newRead } : c);
        // Re-sort: unread first
        return [...updated].sort((a, b) => {
          if (a.read === b.read) return 0;
          return a.read ? 1 : -1;
        });
      });
      toast.success(newRead ? 'Marked as read' : 'Marked as unread');
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const unreadCount = contacts.filter(c => !c.read).length;

  return (
    <div className="min-h-screen bg-background" data-testid="admin-contacts-page">
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="hover:text-white/80" data-testid="back-to-dashboard">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex items-center space-x-3">
              <Mail size={32} />
              <h1 className="font-serif text-2xl font-bold">Manage Contacts</h1>
            </div>
            {unreadCount > 0 && (
              <span
                className="bg-white text-primary text-xs font-bold px-2.5 py-1 rounded-full"
                data-testid="contacts-unread-count"
              >
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {contacts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl" data-testid="no-contacts">
            <Mail size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No contact messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => {
              const isUnread = !contact.read;
              return (
                <div
                  key={contact.id}
                  className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-200 ${
                    isUnread ? 'border-l-4 border-primary' : 'border-l-4 border-transparent'
                  }`}
                  data-testid={`contact-${contact.id}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-3">
                      {/* Unread dot indicator */}
                      <div className="mt-1.5 flex-shrink-0">
                        {isUnread ? (
                          <span
                            className="block w-2.5 h-2.5 rounded-full bg-primary"
                            data-testid={`unread-dot-${contact.id}`}
                          />
                        ) : (
                          <span className="block w-2.5 h-2.5 rounded-full bg-gray-200" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-serif text-xl font-semibold text-primary">
                            {contact.name}
                          </h3>
                          {isUnread && (
                            <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-1">
                          <strong>Email:</strong> {contact.email}
                        </p>
                        {contact.phone && (
                          <p className="text-muted-foreground text-sm mb-1">
                            <strong>Phone:</strong> {contact.phone}
                          </p>
                        )}
                        <p className="text-muted-foreground text-sm">
                          <strong>Date:</strong> {formatDate(contact.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Toggle read/unread button */}
                      <button
                        onClick={() => handleToggleRead(contact.id, contact.read)}
                        title={isUnread ? 'Mark as read' : 'Mark as unread'}
                        className={`p-2 rounded-lg transition-colors ${
                          isUnread
                            ? 'text-primary hover:bg-primary/10'
                            : 'text-muted-foreground hover:bg-gray-100'
                        }`}
                        data-testid={`toggle-read-${contact.id}`}
                      >
                        {isUnread ? <MailOpen size={20} /> : <Mail size={20} />}
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                        data-testid={`delete-contact-${contact.id}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className={`border-t pt-4 ${isUnread ? 'border-primary/20' : ''}`}>
                    <p className="font-medium text-primary mb-2">
                      <strong>Subject:</strong> {contact.subject}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Message:</strong>
                      <br />
                      {contact.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContacts;
