// frontend/src/pages/admin/AdminContacts.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Mail, MailOpen, Eye, CheckCircle, Inbox, RefreshCw } from 'lucide-react';
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
      await adminApi.deleteContact(contactId);
      toast.success('Contact message deleted successfully! 🗑️');
      await loadContacts();
      if (selectedContact?._id === contactId || selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
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
      await adminApi.toggleContactRead(contactId, newReadStatus);
      
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
          adminApi.toggleContactRead(contact._id || contact.id, true)
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

  // ✅ Refresh contacts
  const handleRefresh = () => {
    loadContacts();
    toast.info('Refreshing messages...');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Mail size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Contact Messages</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage and respond to contact form submissions
                </p>
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {unreadCount} unread
                </span>
              )}
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
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
                  disabled={loading}
                >
                  <CheckCircle size={16} />
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-32 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-3 font-medium transition ${
                filter === 'all' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              All ({contacts.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-3 font-medium transition ${
                filter === 'unread' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-3 font-medium transition ${
                filter === 'read' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Read ({contacts.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && contacts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading messages...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <Inbox size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-xl text-gray-500 dark:text-gray-400">
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
                    className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md ${
                      isUnread ? 'border-l-4 border-primary' : 'border-l-4 border-transparent'
                    } ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-800 dark:text-white">{contact.name}</h3>
                          {isUnread && (
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2">
                          {contact.message.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {formatDate(contact.createdAt || contact.date)}
                        </p>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRead(contact);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                          title={isUnread ? 'Mark as read' : 'Mark as unread'}
                        >
                          {isUnread ? <MailOpen size={18} /> : <Mail size={18} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(contact);
                          }}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition"
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
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-40">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-primary">{selectedContact.name}</h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">{selectedContact.email}</p>
                      {selectedContact.phone && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">📞 {selectedContact.phone}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleRead(selectedContact)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        title={!selectedContact.read ? 'Mark as read' : 'Mark as unread'}
                      >
                        {!selectedContact.read ? <MailOpen size={20} /> : <Mail size={20} />}
                      </button>
                      <button
                        onClick={() => handleDelete(selectedContact)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject</h3>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {selectedContact.subject}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Message</h3>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {selectedContact.message}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
                      Received: {formatDate(selectedContact.createdAt || selectedContact.date)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                  <Eye size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">Select a message to view details</p>
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
