import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Mail, FileText, Calendar, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ contacts: 0, blogPosts: 0, events: 0 });

  const loadStats = () => {
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const events = JSON.parse(localStorage.getItem('schoolEvents') || '[]');
    setStats({ contacts: contacts.length, blogPosts: blogPosts.length, events: events.length });
  };

  useEffect(() => {
    if (window.netlifyIdentity) {
      const currentUser = window.netlifyIdentity.currentUser();
      if (!currentUser) {
        navigate('/admin/login');
      } else {
        setUser(currentUser);
      }
      window.netlifyIdentity.on('logout', () => navigate('/admin/login'));
    }

    loadStats();
    const onStorageChange = () => loadStats();
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <LayoutDashboard size={32} />
            <div>
              <h1 className="font-serif text-2xl font-bold">Admin Dashboard</h1>
              {user && <p className="text-sm text-white/80">Welcome, {user?.email || 'Admin'}</p>}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard icon={<Mail size={32} className="text-secondary mb-3" />} value={stats.contacts} label="Contact Messages" />
          <StatCard icon={<FileText size={32} className="text-secondary mb-3" />} value={stats.blogPosts} label="Blog Posts" />
          <StatCard icon={<Calendar size={32} className="text-secondary mb-3" />} value={stats.events} label="Events" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminNavCard to="/admin/contacts" icon={<Mail size={48} className="text-primary mb-4" />} title="Manage Contacts" desc="View and manage contact form submissions" />
          <AdminNavCard to="/admin/blog" icon={<FileText size={48} className="text-primary mb-4" />} title="Manage Blog" desc="Create and edit blog posts" />
          <AdminNavCard to="/admin/events" icon={<Calendar size={48} className="text-primary mb-4" />} title="Manage Events" desc="Create and manage school events" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
    {icon}
    <h3 className="text-3xl font-bold text-primary mb-2">{value}</h3>
    <p className="text-muted-foreground">{label}</p>
  </div>
);

const AdminNavCard = ({ to, icon, title, desc }) => (
  <Link to={to} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
    {React.cloneElement(icon, { className: icon.props.className + ' group-hover:scale-110 transition-transform' })}
    <h3 className="font-serif text-2xl font-semibold text-primary mb-2">{title}</h3>
    <p className="text-muted-foreground">{desc}</p>
  </Link>
);

export default AdminDashboard;
