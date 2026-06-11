// frontend/src/pages/admin/AdminContacts.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Mail, MailOpen, Eye, CheckCircle, Inbox, RefreshCw, Reply, Send, X, History } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../utils/api';

const API_BASE = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureschools.com';

// ─── Reply Modal Component ──────────────────────────────────
const ReplyModal = ({ contact, isOpen, onClose, onSend, sending }) => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (contact && isOpen) {
      setSubject(`Re: ${contact.subject || 'Contact Form'}`);
      setMessage('');
    }
  }, [contact, isOpen]);

  if (!isOpen || !contact) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    onSend({
      to_email: contact.email,
      to_name: contact.name,
      subject: subject,
      message: message,
      reply_to_original: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Reply size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Reply to Contact</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Recipient Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">To:</p>
            </div>
            <p className="font-semibold text-gray-800 dark:text-white">{contact.name}</p>
            <p className="text-sm text-gray-500">{contact.email}</p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your Reply
            </label>
            <div className="mb-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-500">
              <p className="font-medium text-gray-600 dark:text-gray-400">Original message from {contact.name}:</p>
              <p className="mt-1 text-gray-500 dark:text-gray-400 line-clamp-2 italic">"{contact.message}"</p>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="Type your reply here..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="flex-1 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Reply
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Email History Modal ────────────────────────────────────
const HistoryModal = ({ contact, isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contact) {
      fetchHistory();
    }
  }, [isOpen, contact]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const contactId = contact._id || contact.id;
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/api/admin/contacts/${contactId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.emails || []);
      }
    } catch (err) {
      console.error('Failed to load email history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !contact) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <History size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Email History</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <Mail size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No replies sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((email, index) => (
                <div key={email.id || index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{email.subject}</p>
                    <span className="text-xs text-gray-400">{formatDate(email.sent_at)}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">To: {email.to_name} ({email.to_email})</p>
                  <div className="mt-2 p-2 bg-white dark:bg-gray-600 rounded text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {email.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────
const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState('all');
  const [replyModal, setReplyModal] = useState({ isOpen: false, contact: null });
  const [historyModal, setHistoryModal] = useState({ isOpen: false, contact: null });
  const [sending, setSending] = useState(false);

  // ✅ Load contacts
  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getContacts();
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
      toast.success('Contact message deleted! 🗑️');
      await loadContacts();
      if (selectedContact?._id === contactId || selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
    } catch (err) {
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
      setContacts(prevContacts => 
        prevContacts.map(c => 
          (c._id === contactId || c.id === contactId) ? { ...c, read: newReadStatus } : c
        ).sort((a, b) => {
          if (a.read !== b.read) return a.read ? 1 : -1;
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
        })
      );
      if (selectedContact && (selectedContact._id === contactId || selectedContact.id === contactId)) {
        setSelectedContact({ ...selectedContact, read: newReadStatus });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark all as read
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
        unreadContacts.map(contact => adminApi.toggleContactRead(contact._id || contact.id, true))
      );
      toast.success(`${unreadContacts.length} message(s) marked as read`);
      await loadContacts();
    } catch (err) {
      toast.error('Failed to mark all as read');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Send reply
  const handleSendReply = async (data) => {
    setSending(true);
    try {
      const contactId = replyModal.contact?._id || replyModal.contact?.id;
      const token = localStorage.getItem('access_token');
      
      const res = await fetch(`${API_BASE}/api/admin/contacts/${contactId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to send reply');
      }

      toast.success(`Reply sent to ${data.to_name}! ✉️`);
      setReplyModal({ isOpen: false, contact: null });
      await loadContacts();
    } catch (err) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = () => {
    loadContacts();
    toast.info('Refreshing messages...');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

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
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage and respond to contact form submissions</p>
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRefresh} disabled={loading} className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition" title="Refresh">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition" disabled={loading}>
                  <CheckCircle size={16} /> Mark all as read
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
            <button onClick={() => setFilter('all')} className={`px-4 py-3 font-medium transition ${filter === 'all' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>
              All ({contacts.length})
            </button>
            <button onClick={() => setFilter('unread')} className={`px-4 py-3 font-medium transition ${filter === 'unread' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>
              Unread ({unreadCount})
            </button>
            <button onClick={() => setFilter('read')} className={`px-4 py-3 font-medium transition ${filter === 'read' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>
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
              {filter === 'all' ? 'No contact messages yet' : filter === 'unread' ? 'No unread messages' : 'No read messages'}
            </p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="mt-4 text-primary hover:underline">View all messages</button>
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
                const hasReplied = contact.replied || contact.status === 'replied';

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
                          {isUnread && <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">New</span>}
                          {hasReplied && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Replied</span>}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2">{contact.message.substring(0, 100)}...</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{formatDate(contact.createdAt || contact.date)}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleToggleRead(contact); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title={isUnread ? 'Mark as read' : 'Mark as unread'}>
                          {isUnread ? <MailOpen size={18} /> : <Mail size={18} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(contact); }} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition" title="Delete">
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
                      {selectedContact.phone && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">📞 {selectedContact.phone}</p>}
                      {selectedContact.replied && (
                        <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Replied</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleRead(selectedContact)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title={!selectedContact.read ? 'Mark as read' : 'Mark as unread'}>
                        {!selectedContact.read ? <MailOpen size={20} /> : <Mail size={20} />}
                      </button>
                      <button onClick={() => handleDelete(selectedContact)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition" title="Delete">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject</h3>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedContact.subject}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Message</h3>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{selectedContact.message}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
                      Received: {formatDate(selectedContact.createdAt || selectedContact.date)}
                    </div>
                  </div>

                  {/* ✅ Reply & History Buttons */}
                  <div className="flex gap-3 mt-6 pt-4 border-t dark:border-gray-700">
                    <button
                      onClick={() => setReplyModal({ isOpen: true, contact: selectedContact })}
                      className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
                    >
                      <Reply size={16} />
                      Reply via Email
                    </button>
                    <button
                      onClick={() => setHistoryModal({ isOpen: true, contact: selectedContact })}
                      className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                      title="View email history"
                    >
                      <History size={16} />
                    </button>
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

      {/* Reply Modal */}
      <ReplyModal
        contact={replyModal.contact}
        isOpen={replyModal.isOpen}
        onClose={() => setReplyModal({ isOpen: false, contact: null })}
        onSend={handleSendReply}
        sending={sending}
      />

      {/* History Modal */}
      <HistoryModal
        contact={historyModal.contact}
        isOpen={historyModal.isOpen}
        onClose={() => setHistoryModal({ isOpen: false, contact: null })}
      />
    </div>
  );
};

export default AdminContacts;
