// frontend/src/pages/admin/AdminContacts.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Mail, MailOpen, Eye, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../utils/api';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  // ✅ Load contacts from MongoDB
  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getContacts();
      
      // Sort: unread first, then newest first
      const sorted = [...data].sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      });

      setContacts(sorted);
    } catch (err) {
      console.error('Load contacts error:', err);
      toast.error(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // ✅ Delete contact
  const handleDelete = async (contact) => {
    const contactId = contact._id || contact.id;
    if (!window.confirm(`Delete message from "${contact.name}"? This action cannot be undone.`)) return;

    setLoading(true);
    try {
      await adminApi.deleteContact?.(contactId) || await apiFetch(`/api/admin/contacts/${contactId}`, { 
        method: 'DELETE' 
      });
      toast.success('Contact message deleted successfully! 🗑️');
      await loadContacts();
      if (selectedContact?._id === contactId) setSelectedContact(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete contact message');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle read/unread
  const handleToggleRead = async (contact) => {
    const contactId = contact._id || contact.id;
    const newReadStatus = !contact.read;
    
    setLoading(true);
    try {
      await adminApi.toggleContactRead?.(contactId, newReadStatus) || await apiFetch(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        body: JSON.stringify({ read: newReadStatus }),
      });
      
      toast.success(newReadStatus ? 'Marked as read ✅' : 'Marked as unread 📧');
      
      // Update local state immediately for better UX
      setContacts(prevContacts => 
        prevContacts.map(c => 
          (c._id === contactId || c.id === contactId) 
            ? { ...c, read: newReadStatus } 
            : c
        ).sort((a, b) => {
          if (a.read !== b.read) return a.read ? 1 : -1;
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
        })
      );
      
      if (selectedContact && (selectedContact._id === contactId || selectedContact.id === contactId)) {
        setSelectedContact({ ...selectedContact, read: newReadStatus });
      }
    } catch (err) {
      console.error('Toggle read error:', err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark multiple as read
  const handleMarkAllAsRead = async () => {
    const unreadContacts = contacts.filter(c => !c.read);
    if (unreadContacts.length === 0) {
      toast.info('No unread messages');
      return;
    }

    if (!window.confirm(`Mark ${unreadContacts.length} message(s) as read?`)) return;

    setLoading(true);
    try {
      await Promise.all(
        unreadContacts.map(contact => 
          adminApi.toggleContactRead?.(contact._id || contact.id, true) || 
          fetch(`/api/admin/contacts/${contact._id || contact.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ read: true }),
          })
        )
      );
      
      toast.success(`${unreadContacts.length} message(s) marked as read`);
      await loadContacts();
    } catch (err) {
      console.error('Mark all error:', err);
      toast.error('Failed to mark all as read');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ✅ Filter contacts
  const filteredContacts = contacts.filter(contact => {
    if (filter === 'unread') return !contact.read;
    if (filter === 'read') return contact.read;
    return true;
  });

  const unreadCount = contacts.filter(c => !c.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="hover:text-white/80 transition">
                <ArrowLeft size={24} />
              </Link>
              <div className="flex items-center space-x-3">
                <Mail size={32} />
                <h1 className="text-2xl font-bold">Contact Messages</h1>
              </div>
              {unreadCount > 0 && (
                <span className="bg-white text-primary text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  {unreadCount} unread
                </span>
              )}
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm flex items-center gap-2 transition"
                disabled={loading}
              >
                <CheckCircle size={16} />
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-3 font-medium transition ${
                filter === 'all' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All ({contacts.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-3 font-medium transition ${
                filter === 'unread' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-3 font-medium transition ${
                filter === 'read' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Read ({contacts.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading && contacts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading messages...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <Mail size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl text-gray-500">
              {filter === 'all' 
                ? 'No contact messages yet' 
                : filter === 'unread' 
                  ? 'No unread messages' 
                  : 'No read messages'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-4 text-primary hover:underline"
              >
                View all messages
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Messages List */}
            <div className="space-y-4 lg:col-span-1">
              {filteredContacts.map((contact) => {
                const isUnread = !contact.read;
                const contactId = contact._id || contact.id;
                const isSelected = selectedContact && (selectedContact._id === contactId);

                return (
                  <div
                    key={contactId}
                    onClick={() => setSelectedContact(contact)}
                    className={`bg-white p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md ${
                      isUnread ? 'border-l-4 border-primary' : 'border-l-4 border-transparent'
                    } ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{contact.name}</h3>
                          {isUnread && (
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                          {contact.message.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(contact.createdAt || contact.date)}
                        </p>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRead(contact);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title={isUnread ? 'Mark as read' : 'Mark as unread'}
                        >
                          {isUnread ? <MailOpen size={18} /> : <Mail size={18} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(contact);
                          }}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Message Detail */}
            <div className="lg:col-span-1">
              {selectedContact ? (
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-primary">{selectedContact.name}</h2>
                      <p className="text-gray-500 mt-1">{selectedContact.email}</p>
                      {selectedContact.phone && (
                        <p className="text-gray-500 text-sm mt-1">📞 {selectedContact.phone}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleRead(selectedContact)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        {!selectedContact.read ? <MailOpen size={20} /> : <Mail size={20} />}
                      </button>
                      <button
                        onClick={() => handleDelete(selectedContact)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Subject</h3>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedContact.subject}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Message</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {selectedContact.message}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 pt-4 border-t">
                      Received: {formatDate(selectedContact.createdAt || selectedContact.date)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Eye size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Select a message to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContacts;
