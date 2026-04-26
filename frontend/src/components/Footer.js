import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <img
              src="https://customer-assets.emergentagent.com/job_hopeschool/artifacts/2y5jbpbx_logo.png"
              alt="Heavenly Nature Schools Logo"
              className="h-16 w-16 mb-4 bg-white rounded-lg p-2"
            />
            <h3 className="font-serif text-xl font-bold mb-2">HEAVENLY NATURE SCHOOLS</h3>
            <p className="text-sm text-white/80 italic">"Nurturing Right Leaders"</p>
            <p className="text-sm text-white/80 mt-4">
              "Train up a child in the way he should go; even when he is old he will not depart from it."
              <br />
              <span className="font-medium">- Proverbs 22:6</span>
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-white/80 hover:text-white transition-colors" data-testid="footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/vision" className="text-white/80 hover:text-white transition-colors" data-testid="footer-vision">
                  Vision & Mission
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-white/80 hover:text-white transition-colors" data-testid="footer-programs">
                  Our Programs
                </Link>
              </li>
              <li>
                <Link to="/governance" className="text-white/80 hover:text-white transition-colors" data-testid="footer-governance">
                  Governance
                </Link>
              </li>
              <li>
                <Link to="/partnerships" className="text-white/80 hover:text-white transition-colors" data-testid="footer-partnerships">
                  Partnerships
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Get Involved</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/support" className="text-white/80 hover:text-white transition-colors" data-testid="footer-support">
                  Support Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/80 hover:text-white transition-colors" data-testid="footer-blog">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-white/80 hover:text-white transition-colors" data-testid="footer-events">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/80 hover:text-white transition-colors" data-testid="footer-contact">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contact Information</h4>
            <div className="space-y-3 text-white/80">
              <div className="flex items-start space-x-3">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <p className="text-sm">Juba City, Central Equatoria State, South Sudan</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={20} className="flex-shrink-0" />
                <a href="tel:+211922273334" className="text-sm hover:text-white" data-testid="footer-phone">
                  +211 922 273 334
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={20} className="flex-shrink-0" />
                <a href="https://wa.me/211926006202" className="text-sm hover:text-white" data-testid="footer-whatsapp">
                  +211 926 006 202 (WhatsApp)
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={20} className="flex-shrink-0" />
                <a href="mailto:info@heavenlynatureschools.com" className="text-sm hover:text-white" data-testid="footer-email">
                  info@heavenlynatureschools.com
                </a>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="font-medium mb-3">Follow Us</h5>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/share/1CPEyYC14f/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-200"
                  data-testid="footer-facebook"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://youtube.com/@heavenlynatureschools?si=M2xhve8UicCDq6jx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-200"
                  data-testid="footer-youtube"
                  aria-label="YouTube"
                >
                  <Youtube size={20} />
                </a>
                <a
                  href="https://wa.me/211926006202"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-200"
                  data-testid="footer-whatsapp-link"
                  aria-label="WhatsApp"
                >
                  <Phone size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-white/70 text-sm">
            &copy; {new Date().getFullYear()} Heavenly Nature Nursery & Primary School. All rights reserved.
          </p>
          <p className="text-white/50 text-xs mt-2">
            A ministry of Heavenly Nature Ministry | Founded February 2023
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;