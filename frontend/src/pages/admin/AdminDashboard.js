import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Mail, FileText, Calendar, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ contacts: 0, unreadContacts: 0, blogPosts: 0, events: 0 });

  useEffect(() => {
    apiFetch('/api/admin/stats')
      .then(data => setStats(data))
      .catch(() => {});
    // apiFetch is a stable module import; setStats is a stable React state setter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard-page">
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <LayoutDashboard size={32} />
              <div>
                <h1 className="font-serif text-2xl font-bold">Admin Dashboard</h1>
                {user && <p className="text-sm text-white/80">Welcome, {user.email}</p>}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
              data-testid="admin-logout-btn"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          {/* Contacts stat card — shows unread badge when there are new messages */}
          <div className="bg-white rounded-2xl p-6 shadow-lg relative" data-testid="stat-card-contacts">
            <div className="flex items-start justify-between mb-3">
              <Mail size={32} className="text-secondary" />
              {stats.unreadContacts > 0 && (
                <span
                  className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full leading-none"
                  data-testid="unread-badge"
                >
                  {stats.unreadContacts} new
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-primary mb-1" data-testid="stat-contacts-total">
              {stats.contacts}
            </h3>
            <p className="text-muted-foreground text-sm">Contact Messages</p>
            {stats.unreadContacts > 0 && (
              <p className="text-primary text-xs font-medium mt-1" data-testid="stat-unread-label">
                {stats.unreadContacts} unread
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg" data-testid="stat-card-blog">
            <FileText size={32} className="text-secondary mb-3" />
            <h3 className="text-3xl font-bold text-primary mb-2">{stats.blogPosts}</h3>
            <p className="text-muted-foreground">Blog Posts</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg" data-testid="stat-card-events">
            <Calendar size={32} className="text-secondary mb-3" />
            <h3 className="text-3xl font-bold text-primary mb-2">{stats.events}</h3>
            <p className="text-muted-foreground">Events</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/contacts"
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group relative"
            data-testid="admin-nav-contacts"
          >
            {stats.unreadContacts > 0 && (
              <span className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full animate-pulse" />
            )}
            <Mail size={48} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif text-2xl font-semibold text-primary mb-2">Manage Contacts</h3>
            <p className="text-muted-foreground">
              {stats.unreadContacts > 0
                ? `${stats.unreadContacts} unread message${stats.unreadContacts > 1 ? 's' : ''}`
                : 'View and manage contact form submissions'}
            </p>
          </Link>

          <Link
            to="/admin/blog"
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
            data-testid="admin-nav-blog"
          >
            <FileText size={48} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif text-2xl font-semibold text-primary mb-2">Manage Blog</h3>
            <p className="text-muted-foreground">Create and edit blog posts</p>
          </Link>

          <Link
            to="/admin/events"
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
            data-testid="admin-nav-events"
          >
            <Calendar size={48} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif text-2xl font-semibold text-primary mb-2">Manage Events</h3>
            <p className="text-muted-foreground">Create and manage school events</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
