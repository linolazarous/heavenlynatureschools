// frontend/src/pages/admin/AdminSettings.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  Mail, 
  Lock, 
  Globe, 
  Bell, 
  Shield, 
  User, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Share2  // ✅ Added missing Share2 import
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AdminSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true); // Changed to true initially
  const [saving, setSaving] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'admin'
  });
  
  // Site settings
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Heavenly Nature Schools',
    siteEmail: 'info@heavenlynature.com',
    sitePhone: '+211 922 273 334',
    siteAddress: 'Juba City, Central Equatoria State, South Sudan',
    siteDescription: 'Providing quality Christian-based education to children in South Sudan'
  });
  
  // Social media links
  const [socialLinks, setSocialLinks] = useState({
    facebook: 'https://www.facebook.com/share/1CPEyYC14f/',
    twitter: 'https://twitter.com/heavenlynature',
    instagram: 'https://www.instagram.com/heavenlynatureschools/',
    youtube: 'https://youtube.com/@heavenlynatureschools'
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newContactAlert: true,
    newBlogAlert: false,
    newEventAlert: false,
    weeklyDigest: true
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginNotifications: true
  });

  // Load settings from backend
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/settings').catch(() => null);
      if (data) {
        if (data.siteSettings) setSiteSettings(prev => ({ ...prev, ...data.siteSettings }));
        if (data.socialLinks) setSocialLinks(prev => ({ ...prev, ...data.socialLinks }));
        if (data.notificationSettings) setNotificationSettings(prev => ({ ...prev, ...data.notificationSettings }));
        if (data.securitySettings) setSecuritySettings(prev => ({ ...prev, ...data.securitySettings }));
      }
      
      // Load user profile
      if (user) {
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'admin'
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setSaving(true);
    try {
      await apiFetch('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      toast.success('Password changed successfully! ✅');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/admin/update-profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        })
      });
      
      // Update local storage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.name = profileData.name;
      userData.email = profileData.email;
      userData.phone = profileData.phone;
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Profile updated successfully! ✅');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle site settings update
  const handleSiteSettingsUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({
          siteSettings,
          socialLinks,
          notificationSettings,
          securitySettings
        })
      });
      
      toast.success('Settings saved successfully! ✅');
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and application settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Profile Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <User size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Profile Settings</h2>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Change Password</h2>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-2.5 text-gray-500"
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-2.5 text-gray-500"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-2.5 text-gray-500"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Site Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Site Settings</h2>
            </div>
            
            <form onSubmit={handleSiteSettingsUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteSettings.siteName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Email
                </label>
                <input
                  type="email"
                  value={siteSettings.siteEmail}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteEmail: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Phone
                </label>
                <input
                  type="text"
                  value={siteSettings.sitePhone}
                  onChange={(e) => setSiteSettings({ ...siteSettings, sitePhone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Address
                </label>
                <textarea
                  value={siteSettings.siteAddress}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteAddress: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Description
                </label>
                <textarea
                  value={siteSettings.siteDescription}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Site Settings'}
              </button>
            </form>
          </div>

          {/* Social Media Links */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Share2 size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Social Media Links</h2>
            </div>
            
            <form onSubmit={handleSiteSettingsUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Facebook size={16} className="inline mr-2" /> Facebook
                </label>
                <input
                  type="url"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Twitter size={16} className="inline mr-2" /> Twitter
                </label>
                <input
                  type="url"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Instagram size={16} className="inline mr-2" /> Instagram
                </label>
                <input
                  type="url"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Youtube size={16} className="inline mr-2" /> YouTube
                </label>
                <input
                  type="url"
                  value={socialLinks.youtube}
                  onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Social Links'}
              </button>
            </form>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Notification Settings</h2>
            </div>
            
            <form onSubmit={handleSiteSettingsUpdate} className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span>Email Notifications</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span>New Contact Form Submissions</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.newContactAlert}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, newContactAlert: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span>New Blog Posts</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.newBlogAlert}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, newBlogAlert: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span>New Events</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.newEventAlert}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, newEventAlert: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span>Weekly Digest</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.weeklyDigest}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyDigest: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </form>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Security Settings</h2>
            </div>
            
            <form onSubmit={handleSiteSettingsUpdate} className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span>Two-Factor Authentication</span>
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span>Login Notifications</span>
                <input
                  type="checkbox"
                  checked={securitySettings.loginNotifications}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, loginNotifications: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Security Settings'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
