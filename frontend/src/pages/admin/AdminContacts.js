import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Mail, MailOpen } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);

  // ✅ Load contacts (centralized)
  const loadContacts = useCallback(async () => {
    try {
      const data = await apiFetch('/api/admin/contacts');

      // Sort: unread first, then newest first
      const sorted = [...data].sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return new Date(b.date) - new Date(a.date);
      });

      setContacts(sorted);
    } catch (err) {
      toast.error(err.message || 'Failed to load contacts');
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await apiFetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
      toast.success('Contact message deleted');

      await loadContacts(); // 🔄 always sync
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  // ✅ Toggle read/unread
  const handleToggleRead = async (id, currentRead) => {
    try {
      await apiFetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ read: !currentRead }),
      });

      toast.success(!currentRead ? 'Marked as read' : 'Marked as unread');

      await loadContacts(); // 🔄 always sync
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const unreadCount = contacts.filter(c => !c.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center space-x-4">
          <Link to="/admin" className="hover:text-white/80">
            <ArrowLeft size={24} />
          </Link>

          <div className="flex items-center space-x-3">
            <Mail size={32} />
            <h1 className="text-2xl font-bold">Manage Contacts</h1>
          </div>

          {unreadCount > 0 && (
            <span className="bg-white text-primary text-xs font-bold px-3 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {contacts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Mail size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-500">No contact messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => {
              const isUnread = !contact.read;

              return (
                <div
                  key={contact.id}
                  className={`bg-white p-6 rounded-2xl shadow ${
                    isUnread ? 'border-l-4 border-primary' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                      {contact.phone && (
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {formatDate(contact.date)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleRead(contact.id, contact.read)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        {isUnread ? <MailOpen size={20} /> : <Mail size={20} />}
                      </button>

                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="border-t pt-4">
                    <p className="font-medium">
                      <strong>Subject:</strong> {contact.subject}
                    </p>
                    <p className="text-gray-600 mt-2">
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
