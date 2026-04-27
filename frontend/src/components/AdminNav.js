// frontend/src/components/AdminNav.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Calendar, Mail, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminNav = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/blog', label: 'Blog Posts', icon: FileText },
    { path: '/admin/events', label: 'Events', icon: Calendar },
    { path: '/admin/contacts', label: 'Contacts', icon: Mail },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/admin" className="flex items-center space-x-2 py-4">
              <LayoutDashboard size={24} className="text-primary" />
              <span className="font-serif font-bold text-xl text-primary dark:text-white">Admin Panel</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>

        {/* Mobile Navigation - Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNav;
