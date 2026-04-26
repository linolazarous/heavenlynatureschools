// frontend/src/pages/admin/AdminDashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mail, 
  FileText, 
  Calendar, 
  LogOut, 
  Users, 
  Eye, 
  TrendingUp,
  Bell,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { adminApi, publicApi, isAuthenticated } from '../../utils/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ 
    contacts: 0, 
    unreadContacts: 0, 
    blogPosts: 0, 
    events: 0,
    upcomingEvents: 0,
    recentContacts: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ✅ Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel for better performance
      const [contacts, blogPosts, events] = await Promise.all([
        adminApi.getContacts().catch(() => []),
        publicApi.getBlogs().catch(() => []),
        publicApi.getEvents().catch(() => [])
      ]);

      // Calculate statistics
      const unreadCount = contacts.filter(c => !c.read).length;
      const upcomingEvents = events.filter(e => new Date(e.eventDate) > new Date()).length;

      // Get recent unread contacts (last 5)
      const recentContacts = contacts
        .filter(c => !c.read)
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 5);

      setStats({
        contacts: contacts.length,
        unreadContacts: unreadCount,
        blogPosts: blogPosts.length,
        events: events.length,
        upcomingEvents: upcomingEvents,
        recentContacts: recentContacts
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully 👋');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleRefresh = () => {
    fetchStats();
    toast.info('Refreshing dashboard data...');
  };

  // Format relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <LayoutDashboard size={28} />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold">Admin Dashboard</h1>
                {user && (
                  <p className="text-sm text-white/80">
                    Welcome back, {user.name || user.email?.split('@')[0] || 'Admin'}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Last updated indicator */}
              <div className="text-xs text-white/70 hidden sm:block">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                data-testid="admin-logout-btn"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Contacts Stat Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Mail size={28} className="text-blue-600" />
              </div>
              {stats.unreadContacts > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                  {stats.unreadContacts} new
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
              {loading ? '...' : stats.contacts}
            </h3>
            <p className="text-gray-500 text-sm">Total Messages</p>
            {stats.unreadContacts > 0 && (
              <p className="text-primary text-xs font-medium mt-2 flex items-center gap-1">
                <Bell size={12} />
                {stats.unreadContacts} unread
              </p>
            )}
          </div>

          {/* Blog Stat Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-green-100 p-3 rounded-xl mb-3">
              <FileText size={28} className="text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
              {loading ? '...' : stats.blogPosts}
            </h3>
            <p className="text-gray-500">Blog Posts</p>
            {stats.blogPosts > 0 && (
              <p className="text-green-600 text-xs mt-2">Published content</p>
            )}
          </div>

          {/* Events Stat Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-purple-100 p-3 rounded-xl mb-3">
              <Calendar size={28} className="text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
              {loading ? '...' : stats.events}
            </h3>
            <p className="text-gray-500">Total Events</p>
            {stats.upcomingEvents > 0 && (
              <p className="text-purple-600 text-xs mt-2">
                {stats.upcomingEvents} upcoming
              </p>
            )}
          </div>

          {/* Overview Stat Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-orange-100 p-3 rounded-xl mb-3">
              <TrendingUp size={28} className="text-orange-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
              {loading ? '...' : stats.contacts + stats.blogPosts + stats.events}
            </h3>
            <p className="text-gray-500">Total Content</p>
            <p className="text-gray-400 text-xs mt-2">All time</p>
          </div>
        </div>

        {/* Recent Unread Messages Section */}
        {stats.recentContacts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                <h2 className="text-xl font-semibold text-gray-800">Recent Unread Messages</h2>
              </div>
              <Link 
                to="/admin/contacts" 
                className="text-primary text-sm hover:underline flex items-center gap-1"
              >
                View all <Eye size={14} />
              </Link>
            </div>
            
            <div className="space-y-3">
              {stats.recentContacts.map((contact, index) => (
                <div 
                  key={contact._id || contact.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{contact.name}</p>
                      <span className="text-xs text-gray-400">{contact.email}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">{contact.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {getRelativeTime(contact.createdAt || contact.date)}
                    </p>
                    <Link 
                      to="/admin/contacts"
                      className="text-primary text-xs hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/contacts"
            className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
            data-testid="admin-nav-contacts"
          >
            {stats.unreadContacts > 0 && (
              <div className="absolute top-4 right-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
            )}
            <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail size={32} className="text-blue-600" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-gray-800 mb-2">Manage Contacts</h3>
            <p className="text-gray-500">
              {stats.unreadContacts > 0
                ? `${stats.unreadContacts} unread message${stats.unreadContacts > 1 ? 's' : ''} waiting`
                : 'View and manage contact form submissions'}
            </p>
          </Link>

          <Link
            to="/admin/blog"
            className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            data-testid="admin-nav-blog"
          >
            <div className="bg-green-50 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText size={32} className="text-green-600" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-gray-800 mb-2">Manage Blog</h3>
            <p className="text-gray-500">
              {stats.blogPosts > 0 
                ? `${stats.blogPosts} post${stats.blogPosts > 1 ? 's' : ''} published`
                : 'Create and edit blog posts'}
            </p>
          </Link>

          <Link
            to="/admin/events"
            className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            data-testid="admin-nav-events"
          >
            <div className="bg-purple-50 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar size={32} className="text-purple-600" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-gray-800 mb-2">Manage Events</h3>
            <p className="text-gray-500">
              {stats.upcomingEvents > 0
                ? `${stats.upcomingEvents} upcoming event${stats.upcomingEvents > 1 ? 's' : ''}`
                : 'Create and manage school events'}
            </p>
          </Link>
        </div>

        {/* Quick Tips Footer */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} />
            <p>
              💡 <strong>Quick Tips:</strong> Use the navigation cards above to manage your content. 
              New messages will appear with a red notification badge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
