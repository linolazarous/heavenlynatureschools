// frontend/src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, School, BookOpen, Calendar, Home, Info, Target, Briefcase, Mail, Heart } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location]);

  const isAdmin = location.pathname.startsWith('/admin');
  
  if (isAdmin) return null;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/about', label: 'About Us', icon: Info },
    { path: '/vision', label: 'Vision & Mission', icon: Target },
    { path: '/programs', label: 'Our Programs', icon: Briefcase },
    { path: '/blog', label: 'Blog', icon: BookOpen },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/contact', label: 'Contact', icon: Mail },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-0' 
          : 'bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm py-0'
      }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group" 
            data-testid="logo-link"
          >
            <div className="bg-gradient-to-br from-primary to-secondary rounded-full p-2 shadow-md group-hover:scale-105 transition-transform duration-300">
              <School size={32} className="text-white" />
            </div>
            <div>
              <h1 className="font-serif text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
                HEAVENLY NATURE SCHOOLS
              </h1>
              <p className="text-xs text-muted-foreground">Nurturing Right Leaders</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                      : 'text-primary hover:bg-primary/5 hover:scale-105'
                  }`}
                  data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
            
            {/* Support CTA Button */}
            <Link
              to="/support"
              className="ml-4 bg-gradient-to-r from-secondary to-secondary/80 text-primary hover:shadow-lg rounded-full px-6 py-2 font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105"
              data-testid="nav-support-cta"
            >
              <Heart size={16} />
              Support Us
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-primary p-2 hover:bg-primary/5 rounded-lg transition-colors"
            data-testid="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden bg-white border-t border-gray-200 shadow-xl animate-slide-down"
          data-testid="mobile-menu"
        >
          <nav className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                      : 'text-primary hover:bg-primary/5'
                  }`}
                  data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
            
            <Link
              to="/support"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-secondary to-secondary/80 text-primary hover:shadow-lg rounded-lg px-4 py-3 font-medium text-center mt-4"
              data-testid="mobile-nav-support"
            >
              <Heart size={18} />
              Support Us
            </Link>
          </nav>
        </div>
      )}

      {/* Add custom animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;
