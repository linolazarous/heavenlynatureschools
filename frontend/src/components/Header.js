import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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

  const isAdmin = location.pathname.startsWith('/admin');
  
  if (isAdmin) return null;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/vision', label: 'Vision & Mission' },
    { path: '/programs', label: 'Our Programs' },
    { path: '/blog', label: 'Blog' },
    { path: '/events', label: 'Events' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3" data-testid="logo-link">
            <img
              src="https://customer-assets.emergentagent.com/job_hopeschool/artifacts/2y5jbpbx_logo.png"
              alt="Heavenly Nature Schools Logo"
              className="h-14 w-14"
            />
            <div>
              <h1 className="font-serif text-lg md:text-xl font-bold text-primary leading-tight">
                HEAVENLY NATURE NURSERY & PRIMARY SCHOOL
              </h1>
              <p className="text-xs text-muted-foreground">Nurturing Right Leaders</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-primary text-white'
                    : 'text-primary hover:bg-primary/5'
                }`}
                data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/support"
              className="ml-4 bg-secondary text-primary hover:bg-secondary/90 rounded-full px-6 py-2 font-medium transition-all duration-200"
              data-testid="nav-support-cta"
            >
              Support Us
            </Link>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-primary p-2"
            data-testid="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200" data-testid="mobile-menu">
          <nav className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                  location.pathname === link.path
                    ? 'bg-primary text-white'
                    : 'text-primary hover:bg-primary/5'
                }`}
                data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/support"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block bg-secondary text-primary hover:bg-secondary/90 rounded-lg px-4 py-3 font-medium text-center"
              data-testid="mobile-nav-support"
            >
              Support Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
