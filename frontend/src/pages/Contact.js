// frontend/src/pages/Contact.js
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, ChevronRight, Building, Globe } from 'lucide-react';
import { toast } from 'sonner';
import ContactForm from '../components/ContactForm';
import SEO from '../components/SEO';

// ─── Contact Info sidebar ─────────────────────────────────────────────────────
const ContactInfo = () => {
  const [showMap, setShowMap] = useState(false);

  return (
    <div>
      <h2 className="font-serif text-3xl font-semibold text-primary mb-8">
        Contact Information
      </h2>
      
      <div className="space-y-8">
        {/* Location */}
        <div className="flex items-start space-x-4 group">
          <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
            <MapPin size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary text-lg mb-2">Our Location</h3>
            <p className="text-muted-foreground leading-relaxed">
              Juba City<br />
              Central Equatoria State<br />
              South Sudan
            </p>
            <button
              onClick={() => setShowMap(!showMap)}
              className="text-primary text-sm mt-2 hover:underline flex items-center gap-1"
            >
              {showMap ? 'Hide Map' : 'View Map'}
              <ChevronRight size={14} className={showMap ? 'rotate-90' : ''} />
            </button>
            
            {showMap && (
              <div className="mt-4 rounded-xl overflow-hidden shadow-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.123456789!2d31.6!3d4.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwNTEnMzYuMCJOIDMxwrAzNicsMC4wIkU!5e0!3m2!1sen!2s!4v1234567890!5m2!1sen!2s"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="School Location"
                ></iframe>
              </div>
            )}
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="flex items-start space-x-4 group">
          <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Phone size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary text-lg mb-2">Phone Numbers</h3>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                <a 
                  href="tel:+211922273334" 
                  className="hover:text-primary transition-colors flex items-center gap-2"
                  data-testid="contact-phone-link"
                >
                  <Phone size={14} />
                  +211 922 273 334
                </a>
              </p>
              <p className="text-muted-foreground">
                <a 
                  href="https://wa.me/211926006202" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-2"
                  data-testid="contact-whatsapp-link"
                >
                  <MessageCircle size={14} />
                  +211 926 006 202 (WhatsApp)
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Email Address */}
        <div className="flex items-start space-x-4 group">
          <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Mail size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary text-lg mb-2">Email Address</h3>
            <p className="text-muted-foreground">
              <a 
                href="mailto:info@heavenlynatureschools.com" 
                className="hover:text-primary transition-colors flex items-center gap-2"
                data-testid="contact-email-link"
              >
                <Mail size={14} />
                info@heavenlynatureschools.com
              </a>
            </p>
          </div>
        </div>

        {/* Office Hours */}
        <div className="flex items-start space-x-4 group">
          <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Clock size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary text-lg mb-2">Office Hours</h3>
            <div className="space-y-1 text-muted-foreground">
              <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
              <p>Saturday: 9:00 AM - 1:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visit Us Card */}
      <div className="mt-12 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 shadow-lg border border-primary/10">
        <Building size={32} className="text-primary mb-4" />
        <h3 className="font-serif text-2xl font-semibold text-primary mb-4">Visit Us</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We welcome visitors to our school. Please contact us in advance to schedule a visit and learn more
          about our programs and how you can get involved.
        </p>
        <div className="flex items-center gap-2 text-sm text-primary/80">
          <Clock size={14} />
          <span>Office Hours: Monday - Friday, 8:00 AM - 5:00 PM</span>
        </div>
      </div>

      {/* Social/Additional Info */}
      <div className="mt-8 pt-6 border-t">
        <h4 className="font-medium text-primary mb-3">Connect With Us</h4>
        <div className="flex gap-3">
          <a 
            href="https://www.facebook.com/share/1CPEyYC14f/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary/10 p-2 rounded-lg hover:bg-primary/20 transition-colors"
            aria-label="Facebook"
          >
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
            </svg>
          </a>
          <a 
            href="https://youtube.com/@heavenlynatureschools"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary/10 p-2 rounded-lg hover:bg-primary/20 transition-colors"
            aria-label="YouTube"
          >
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 00.502 6.186C0 8.066 0 12 0 12s0 3.934.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 002.122-2.136C24 15.934 24 12 24 12s0-3.934-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <a 
            href="https://wa.me/211926006202"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary/10 p-2 rounded-lg hover:bg-primary/20 transition-colors"
            aria-label="WhatsApp"
          >
            <MessageCircle size={20} className="text-primary" />
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── Main Contact Page ─────────────────────────────────────────────────────
const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSuccess = () => {
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-gray-50 to-white" data-testid="contact-page">
      <SEO
        path="/contact"
        title="Contact Us | Heavenly Nature Schools"
        description="Get in touch with Heavenly Nature Schools. Phone: +211 922 273 334. WhatsApp: +211 926 006 202. Email: info@heavenlynatureschools.com. Located in Juba City, South Sudan."
        keywords="contact, school contact, Heavenly Nature Schools, Juba, South Sudan, admissions"
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/90 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Contact Us
          </h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Banner */}
          {formSubmitted && (
            <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg animate-slide-down">
              <div className="flex items-center gap-3">
                <Send size={20} className="text-green-500" />
                <div>
                  <p className="text-green-700 font-medium">Message Sent Successfully!</p>
                  <p className="text-green-600 text-sm">We'll respond within 24-48 hours.</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form Section */}
            <div>
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-semibold text-primary mb-4">
                  Send Us a Message
                </h2>
                <p className="text-muted-foreground">
                  Have questions about admissions, programs, or anything else? Fill out the form and we'll get back to you promptly.
                </p>
              </div>
              <ContactForm onSuccess={handleFormSuccess} />
            </div>
            
            {/* Contact Info Section */}
            <ContactInfo />
          </div>

          {/* Emergency Contact Banner */}
          <div className="mt-16 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Phone size={28} className="text-red-600" />
                <div className="text-left">
                  <h4 className="font-semibold text-red-800">Emergency Contact</h4>
                  <p className="text-sm text-red-600">For urgent matters outside office hours</p>
                </div>
              </div>
              <a 
                href="tel:+211922273334"
                className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition flex items-center gap-2"
              >
                <Phone size={18} />
                +211 922 273 334
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Add custom animations */}
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
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Contact;
