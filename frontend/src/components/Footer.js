// frontend/src/components/Footer.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Phone, Mail, MapPin, Heart, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Handle newsletter subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!subscriberEmail || !subscriberEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: subscriberEmail })
      });
      
      if (response.ok) {
        toast.success(`Thank you for subscribing! We'll send updates to ${subscriberEmail}`);
        setSubscriberEmail('');
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      const existingSubscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      if (!existingSubscribers.includes(subscriberEmail)) {
        existingSubscribers.push(subscriberEmail);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(existingSubscribers));
        toast.success(`Thank you for subscribing! We'll send updates to ${subscriberEmail}`);
        setSubscriberEmail('');
      } else {
        toast.info('This email is already subscribed');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-primary to-primary/90 text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/logo.webp" 
                alt="Heavenly Nature Schools Logo" 
                className="h-14 w-14 object-contain bg-white/10 rounded-xl p-2"
              />
              <h3 className="font-serif text-xl font-bold">HEAVENLY NATURE SCHOOLS</h3>
            </div>
            <p className="text-white/80 italic mb-3">"Nurturing Right Leaders"</p>
            <p className="text-sm text-white/70 mt-4 leading-relaxed">
              "Train up a child in the way he should go; even when he is old he will not depart from it."
              <br />
              <span className="font-medium mt-2 block">- Proverbs 22:6</span>
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Heart size={16} className="text-secondary" />
              <span className="text-xs text-white/60">Founded by Heavenly Nature Ministry - February 2023</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 relative inline-block">
              Quick Links
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-secondary mt-2"></div>
            </h4>
            <ul className="space-y-3 mt-4">
              <li>
                <Link to="/about" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group" data-testid="footer-about">
                  <span className="w-1 h-1 bg-secondary rounded-full group-hover:w-2 transition-all"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/vision" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group" data-testid="footer-vision">
                  <span className="w-1 h-1 bg-secondary rounded-full group-hover:w-2 transition-all"></span>
                  Vision & Mission
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group" data-testid="footer-programs">
                  <span className="w-1 h-1 bg-secondary rounded-full group-hover:w-2 transition-all"></span>
                  Our Programs
                </Link>
              </li>
              <li>
                <Link to="/governance" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group" data-testid="footer-governance">
                  <span className="w-1 h-1 bg-secondary rounded-full group-hover:w-2 transition-all"></span>
                  Governance
                </Link>
              </li>
              <li>
                <Link to="/partnerships" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group" data-testid="footer-partnerships">
                  <span className="w-1 h-1 bg-secondary rounded-full group-hover:w-2 transition-all"></span>
                  Partnerships
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 relative inline-block">
              Get Involved
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-secondary mt-2"></div>
            </h4>
            <ul className="space-y-3 mt-4">
              <li>
                <Link to="/support" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group" data-testid="footer-support">
                  <span className="w-1 h-1 bg-secondary rounded-full group-hover:w-2 transition-all"></span>
                  Support Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group" data-testid="footer-blog">
                  <span className="w-1 h-1 bg-secondary rounded-full group-hover:w-2 transition-all"></span>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group" data-testid="footer-events">
                  <span className="w-1 h-1 bg-secondary rounded-full group-hover:w-2 transition-all"></span>
                  Events
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group" data-testid="footer-contact">
                  <span className="w-1 h-1 bg-secondary rounded-full group-hover:w-2 transition-all"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group" data-testid="footer-volunteer">
                  <span className="w-1 h-1 bg-secondary rounded-full group-hover:w-2 transition-all"></span>
                  Volunteer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 relative inline-block">
              Contact Info
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-secondary mt-2"></div>
            </h4>
            <div className="space-y-4 mt-4">
              <div className="flex items-start space-x-3 group">
                <MapPin size={18} className="mt-1 flex-shrink-0 text-secondary group-hover:scale-110 transition-transform" />
                <p className="text-sm text-white/70 group-hover:text-white transition-colors">
                  Juba City, Central Equatoria State, South Sudan
                </p>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <Phone size={18} className="flex-shrink-0 text-secondary group-hover:scale-110 transition-transform" />
                <a href="tel:+211922273334" className="text-sm text-white/70 hover:text-white transition-colors" data-testid="footer-phone">
                  +211 922 273 334
                </a>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <Mail size={18} className="flex-shrink-0 text-secondary group-hover:scale-110 transition-transform" />
                <a href="mailto:info@heavenlynatureschools.com" className="text-sm text-white/70 hover:text-white transition-colors" data-testid="footer-email">
                  info@heavenlynatureschools.com
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h5 className="font-medium mb-3 text-white/90">Follow Us</h5>
              <div className="flex space-x-3">
                <a
                  href="https://www.facebook.com/share/1CPEyYC14f/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-200 hover:scale-110"
                  data-testid="footer-facebook"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://youtube.com/@heavenlynatureschools?si=M2xhve8UicCDq6jx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-200 hover:scale-110"
                  data-testid="footer-youtube"
                  aria-label="YouTube"
                >
                  <Youtube size={18} />
                </a>
                <a
                  href="https://wa.me/211926006202"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-200 hover:scale-110"
                  data-testid="footer-whatsapp"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-2">
                <Send size={18} className="text-secondary" />
                <p className="text-white/80 font-medium">Subscribe to our newsletter</p>
              </div>
              <p className="text-white/60 text-sm">
                Get updates about events, news, and opportunities
              </p>
            </div>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                required
                className="px-4 py-2 rounded-lg text-gray-800 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-secondary"
                disabled={isSubscribing}
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="bg-secondary text-primary px-6 py-2 rounded-lg hover:bg-secondary/90 transition flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Subscribe
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-white/40 text-xs">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60 text-sm">
            &copy; {currentYear} Heavenly Nature Nursery & Primary School. All rights reserved.
          </p>
          <p className="text-white/40 text-xs mt-2">
            Founded by Heavenly Nature Ministry - February 2023
          </p>
          <div className="flex justify-center space-x-4 mt-4 text-xs text-white/40">
            <Link to="/privacy" className="hover:text-white/60 transition">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-white/60 transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
