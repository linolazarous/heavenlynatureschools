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
  RefreshCw,
  Settings,
  Shield,
  Globe,
  Moon,
  Sun,
  BellOff,
  Save,
  X,
  UserCog,
  Lock,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { adminApi, publicApi, apiFetch } from '../../utils/api';

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
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    // Theme
    darkMode: localStorage.getItem('theme') === 'dark',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    notifyNewContacts: true,
    notifyNewBlogPosts: false,
    
    // Display
    itemsPerPage: 10,
    dateFormat: 'MM/DD/YYYY',
    
    // Security
    sessionTimeout: 30, // minutes
    twoFactorAuth: false,
    
    // Site Settings
    siteName: 'Heavenly Nature Schools',
    siteEmail: 'info@heavenlynature.com',
    contactPhone: '+1 234 567 8900',
    contactAddress: '123 School Street, City, State 12345',
    
    // Social Media
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  });

  // ✅ Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [contacts, blogPosts, events] = await Promise.all([
        adminApi.getContacts().catch(() => []),
        publicApi.getBlogs().catch(() => []),
        publicApi.getEvents().catch(() => [])
      ]);

      const unreadCount = contacts.filter(c => !c.read).length;
      const upcomingEvents = events.filter(e => new Date(e.eventDate) > new Date()).length;

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

  // ✅ Load saved settings from localStorage/backend
  const loadSettings = useCallback(async () => {
    try {
      // Try to load from backend first
      const savedSettings = await apiFetch('/api/admin/settings').catch(() => null);
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...savedSettings }));
      }
      
      // Load theme from localStorage
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    loadSettings();
    
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, loadSettings]);

  // ✅ Save settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // Save theme
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      
      // Save to backend
      await apiFetch('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      }).catch(() => {
        // If backend endpoint doesn't exist, save to localStorage
        localStorage.setItem('admin_settings', JSON.stringify(settings));
      });
      
      toast.success('Settings saved successfully! ✅');
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

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

  // Settings Modal Component
  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings size={24} className="text-primary" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Settings</h2>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Palette size={20} /> Appearance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                  className={`px-4 py-2 rounded-lg transition ${settings.darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {settings.darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Items Per Page
                </label>
                <select
                  value={settings.itemsPerPage}
                  onChange={(e) => setSettings(prev => ({ ...prev, itemsPerPage: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Format
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Bell size={20} /> Notifications
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Notify on New Contact Messages</span>
                <input
                  type="checkbox"
                  checked={settings.notifyNewContacts}
                  onChange={(e) => setSettings(prev => ({ ...prev, notifyNewContacts: e.target.checked }))}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
            </div>
          </div>

          {/* Site Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Globe size={20} /> Site Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Email
                </label>
                <input
                  type="email"
                  value={settings.siteEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteEmail: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Address
                </label>
                <input
                  type="text"
                  value={settings.contactAddress}
                  onChange={(e) => setSettings(prev => ({ ...prev, contactAddress: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Shield size={20} /> Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Two-Factor Authentication</span>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => setSettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <LayoutDashboard size={28} />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold">{settings.siteName}</h1>
                {user && (
                  <p className="text-sm text-white/80">
                    Welcome back, {user.name || user.email?.split('@')[0] || 'Admin'}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-xs text-white/70 hidden sm:block">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Settings</span>
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your dashboard content (stats, navigation cards, etc.) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ... keep existing stat cards ... */}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ... keep existing navigation cards ... */}
        </div>

        {/* Add Settings Link Card */}
        <div className="mt-6">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Settings size={24} className="text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Dashboard Settings</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Configure appearance, notifications, site information, and security
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal />}
    </div>
  );
};

export default AdminDashboard;
