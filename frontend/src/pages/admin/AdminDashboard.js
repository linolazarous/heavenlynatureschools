// frontend/src/pages/admin/AdminDashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, FileText, Calendar, Users, Eye, TrendingUp,
  Bell, RefreshCw, Settings, School, MessageCircle,
  Star, Shield, UserPlus, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { adminApi, publicApi, apiFetch } from '../../utils/api';
import AdminIDCard from './AdminIDCard';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    contacts: 0, unreadContacts: 0, blogPosts: 0, events: 0,
    upcomingEvents: 0, admins: 0, recentContacts: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [settings, setSettings] = useState({
    darkMode: localStorage.getItem('theme') === 'dark',
    emailNotifications: true, pushNotifications: false,
    notifyNewContacts: true, notifyNewBlogPosts: false,
    itemsPerPage: 10, dateFormat: 'MM/DD/YYYY', sessionTimeout: 30,
    twoFactorAuth: false, siteName: 'Heavenly Nature Schools',
    siteEmail: 'info@heavenlynatureschools.com', contactPhone: '+211 922 273 334',
    contactAddress: 'Juba City, Central Equatoria State, South Sudan',
    facebook: 'https://www.facebook.com/share/1CPEyYC14f/', twitter: '', instagram: '', linkedin: ''
  });

  useEffect(() => {
    const adminInfo = adminApi.getCurrentAdmin();
    setIsSuperAdmin(adminInfo?.role === 'super_admin');
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [contacts, blogPosts, events, statsData] = await Promise.all([
        adminApi.getContacts().catch(() => []),
        publicApi.getBlogs().catch(() => []),
        publicApi.getEvents().catch(() => []),
        apiFetch('/api/admin/stats').catch(() => null)
      ]);
      const unreadCount = contacts.filter(c => !c.read).length;
      const upcomingEvents = events.filter(e => new Date(e.eventDate) > new Date()).length;
      const recentContacts = contacts.filter(c => !c.read).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).slice(0, 5);
      setStats({ contacts: contacts.length, unreadContacts: unreadCount, blogPosts: blogPosts.length, events: events.length, upcomingEvents: upcomingEvents, admins: statsData?.admins || 0, recentContacts });
      setLastUpdated(new Date());
    } catch (error) { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await apiFetch('/api/admin/settings').catch(() => null);
      if (savedSettings) setSettings(prev => ({ ...prev, ...savedSettings }));
      if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');
    } catch (error) {}
  }, []);

  useEffect(() => { fetchStats(); loadSettings(); const interval = setInterval(fetchStats, 30000); return () => clearInterval(interval); }, [fetchStats, loadSettings]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      if (settings.darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
      else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
      await apiFetch('/api/admin/settings', { method: 'POST', body: JSON.stringify(settings) }).catch(() => { localStorage.setItem('admin_settings', JSON.stringify(settings)); });
      toast.success('Settings saved! ✅'); setShowSettings(false);
    } catch (error) { toast.error('Failed to save settings'); }
    finally { setSavingSettings(false); }
  };

  const formatDate = (d) => { if (!d) return 'N/A'; return new Date(d).toLocaleDateString(); };
  const getRelativeTime = (d) => {
    if (!d) return ''; const date = new Date(d); const now = new Date(); const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000); const diffHours = Math.floor(diffMs / 3600000); const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'just now'; if (diffMins < 60) return `${diffMins} min ago`; if (diffHours < 24) return `${diffHours}h ago`; return `${diffDays}d ago`;
  };

  const TAB_COMPONENTS = { dashboard: null, 'id-cards': AdminIDCard };

  const renderTab = () => {
    if (activeTab === 'dashboard') {
      return (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl"><Mail size={24} className="text-blue-600 dark:text-blue-400" /></div>
                {stats.unreadContacts > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">{stats.unreadContacts} new</span>}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{loading ? '...' : stats.contacts}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Messages</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl mb-3"><FileText size={24} className="text-green-600 dark:text-green-400" /></div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{loading ? '...' : stats.blogPosts}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Blog Posts</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl mb-3"><Calendar size={24} className="text-purple-600 dark:text-purple-400" /></div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{loading ? '...' : stats.events}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Events</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl"><Users size={24} className="text-purple-600 dark:text-purple-400" /></div>
                {isSuperAdmin && <Link to="/admin/manage-admins" className="text-xs text-purple-600 hover:underline">Manage</Link>}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{loading ? '...' : stats.admins || 1}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Admin Accounts</p>
            </div>
          </div>

          {/* Recent Messages */}
          {stats.recentContacts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Bell size={20} className="text-primary" /><h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Unread Messages</h2></div>
                <Link to="/admin/contacts" className="text-primary text-sm hover:underline flex items-center gap-1">View all <Eye size={14} /></Link>
              </div>
              <div className="space-y-3">
                {stats.recentContacts.map((contact, index) => (
                  <div key={contact._id || contact.id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1"><div className="flex items-center gap-2"><p className="font-medium text-gray-800 dark:text-white">{contact.name}</p><span className="text-xs text-gray-400">{contact.email}</span></div><p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{contact.subject}</p></div>
                    <div className="text-right"><p className="text-xs text-gray-400">{getRelativeTime(contact.createdAt || contact.date)}</p><Link to="/admin/contacts" className="text-primary text-xs hover:underline">View</Link></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Link to="/admin/blog" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><FileText size={32} className="text-green-600 dark:text-green-400" /></div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Manage Blog</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Create and edit posts</p>
            </Link>
            <Link to="/admin/events" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><Calendar size={32} className="text-purple-600 dark:text-purple-400" /></div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Manage Events</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Schedule and manage events</p>
            </Link>
            <Link to="/admin/contacts" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><Mail size={32} className="text-blue-600 dark:text-blue-400" /></div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">View Contacts</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Read messages</p>
            </Link>
            {/* ✅ School ID Cards */}
            <button onClick={() => setActiveTab('id-cards')} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group text-center border-2 border-accent/20">
              <div className="bg-accent/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><CreditCard size={32} className="text-accent" /></div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">School ID Cards</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Create and manage IDs</p>
            </button>
            {isSuperAdmin ? (
              <Link to="/admin/manage-admins" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group text-center border-2 border-purple-200 dark:border-purple-800">
                <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><Shield size={32} className="text-purple-600 dark:text-purple-400" /></div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Manage Admins</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Add admin accounts</p>
              </Link>
            ) : (
              <button onClick={() => setShowSettings(true)} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group text-center">
                <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><Settings size={32} className="text-gray-600 dark:text-gray-400" /></div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Settings</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Configure dashboard</p>
              </button>
            )}
          </div>
        </>
      );
    }
    const Component = TAB_COMPONENTS[activeTab];
    return Component ? <Component /> : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {activeTab !== 'dashboard' && (
                <button onClick={() => setActiveTab('dashboard')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {activeTab === 'dashboard' ? `Welcome back, ${user?.name || user?.email?.split('@')[0] || 'Admin'}! 👋` : 'School ID Cards'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {activeTab === 'dashboard' ? "Here's what's happening with your school today." : 'Create and manage staff/student identification cards'}
                </p>
              </div>
            </div>
            {isSuperAdmin && activeTab === 'dashboard' && (
              <Link to="/admin/manage-admins" className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all">
                <Shield size={20} /><span className="font-medium">Manage Admins</span><UserPlus size={16} />
              </Link>
            )}
          </div>
        </div>

        {renderTab()}

        {activeTab === 'dashboard' && (
          <div className="mt-8 text-center text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
            <button onClick={fetchStats} className="ml-2 text-primary hover:underline"><RefreshCw className="h-3 w-3 inline mr-1" />Refresh</button>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3"><Settings size={24} className="text-primary" /><h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Settings</h2></div>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-6">
              <div><h3 className="text-lg font-semibold mb-3">Appearance</h3><div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"><span>Dark Mode</span><button onClick={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))} className={`px-4 py-2 rounded-lg transition ${settings.darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>{settings.darkMode ? '🌙' : '☀️'}</button></div></div>
              <div><h3 className="text-lg font-semibold mb-3">Notifications</h3><label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"><span>Email Notifications</span><input type="checkbox" checked={settings.emailNotifications} onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))} className="w-5 h-5" /></label><label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-2"><span>New Contact Alerts</span><input type="checkbox" checked={settings.notifyNewContacts} onChange={(e) => setSettings(prev => ({ ...prev, notifyNewContacts: e.target.checked }))} className="w-5 h-5" /></label></div>
              <div className="flex gap-3 pt-4 border-t"><button onClick={handleSaveSettings} disabled={savingSettings} className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-50">{savingSettings ? 'Saving...' : 'Save Settings'}</button><button onClick={() => setShowSettings(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition">Cancel</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
