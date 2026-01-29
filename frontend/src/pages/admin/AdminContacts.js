import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);

  // Load contacts from localStorage
  const loadContacts = () => {
    const storedContacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    setContacts(storedContacts);
  };

  useEffect(() => {
    loadContacts();

    // Listen to localStorage changes for real-time updates
    const handleStorage = () => loadContacts();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      const updatedContacts = contacts.filter(c => c.id !== id);
      localStorage.setItem('contacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
      toast.success('Contact message deleted');
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

  return (
    <div className="min-h-screen bg-background" data-testid="admin-contacts-page">
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center space-x-4">
          <Link to="/admin" className="hover:text-white/80" data-testid="back-to-dashboard">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center space-x-3">
            <Mail size={32} />
            <h1 className="font-serif text-2xl font-bold">Manage Contacts</h1>
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
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-2xl p-6 shadow-lg"
                data-testid={`contact-${contact.id}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-primary mb-2">{contact.name}</h3>
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
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                    data-testid={`delete-contact-${contact.id}`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="border-t pt-4">
                  <p className="font-medium text-primary mb-2">
                    <strong>Subject:</strong> {contact.subject}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Message:</strong><br />
                    {contact.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContacts;
