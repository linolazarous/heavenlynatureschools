import React, { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import ContactForm from '../components/ContactForm';
import SEO from '../components/SEO';

// ─── Contact Info sidebar ─────────────────────────────────────────────────────

const ContactInfo = () => (
  <div>
    <h2 className="font-serif text-3xl font-semibold text-primary mb-8">
      Contact Information
    </h2>
    <div className="space-y-8">
      <div className="flex items-start space-x-4">
        <MapPin size={28} className="text-secondary flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-primary text-lg mb-2">Our Location</h3>
          <p className="text-muted-foreground">
            Juba City<br />
            Central Equatoria State<br />
            South Sudan
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-4">
        <Phone size={28} className="text-secondary flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-primary text-lg mb-2">Phone Numbers</h3>
          <p className="text-muted-foreground mb-1">
            <a href="tel:+211922273334" className="hover:text-primary" data-testid="contact-phone-link">
              +211 922 273 334
            </a>
          </p>
          <p className="text-muted-foreground">
            <a href="https://wa.me/211926006202" className="hover:text-primary" data-testid="contact-whatsapp-link">
              +211 926 006 202 (WhatsApp)
            </a>
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-4">
        <Mail size={28} className="text-secondary flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-primary text-lg mb-2">Email Address</h3>
          <p className="text-muted-foreground">
            <a href="mailto:info@heavenlynatureschools.com" className="hover:text-primary" data-testid="contact-email-link">
              info@heavenlynatureschools.com
            </a>
          </p>
        </div>
      </div>
    </div>

    <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-primary/5">
      <h3 className="font-serif text-2xl font-semibold text-primary mb-4">Visit Us</h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        We welcome visitors to our school. Please contact us in advance to schedule a visit and learn more
        about our programs and how you can get involved.
      </p>
      <p className="text-sm text-muted-foreground italic">
        Office Hours: Monday - Friday, 8:00 AM - 5:00 PM
      </p>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const Contact = () => (
  <div className="min-h-screen pt-24" data-testid="contact-page">
    <SEO
      path="/contact"
      title="Contact Us"
      description="Get in touch with Heavenly Nature Schools. Phone: +211 922 273 334. WhatsApp: +211 926 006 202. Email: info@heavenlynatureschools.com. Located in Juba City, South Sudan."
    />
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-primary mb-8">
              Send Us a Message
            </h2>
            <ContactForm />
          </div>
          <ContactInfo />
        </div>
      </div>
    </section>
  </div>
);

export default Contact;
