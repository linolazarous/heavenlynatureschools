import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Mail, FileText, Calendar, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    contacts: 0,
    blogPosts: 0,
    events: 0
  });

  useEffect(() => {
    if (window.netlifyIdentity) {
      const currentUser = window.netlifyIdentity.currentUser();
      if (!currentUser) {
        navigate('/admin/login');
      } else {
        setUser(currentUser);
      }
    }

    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const events = JSON.parse(localStorage.getItem('schoolEvents') || '[]');

    setStats({
      contacts: contacts.length,
      blogPosts: blogPosts.length,
      events: events.length
    });
  }, [navigate]);

  const handleLogout = () => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.logout();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    }
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
          <div className="bg-white rounded-2xl p-6 shadow-lg" data-testid="stat-card-contacts">
            <Mail size={32} className="text-secondary mb-3" />
            <h3 className="text-3xl font-bold text-primary mb-2">{stats.contacts}</h3>
            <p className="text-muted-foreground">Contact Messages</p>
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
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
            data-testid="admin-nav-contacts"
          >
            <Mail size={48} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif text-2xl font-semibold text-primary mb-2">Manage Contacts</h3>
            <p className="text-muted-foreground">View and manage contact form submissions</p>
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