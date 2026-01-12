import React, { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you for contacting us! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen pt-24" data-testid="contact-page">
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
              <form
                name="contact"
                method="POST"
                data-netlify="true"
                onSubmit={handleSubmit}
                className="space-y-6"
                data-testid="contact-form"
              >
                <input type="hidden" name="form-name" value="contact" />
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    data-testid="contact-name-input"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    data-testid="contact-email-input"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    data-testid="contact-phone-input"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-primary mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    data-testid="contact-subject-input"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    data-testid="contact-message-input"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-medium transition-all duration-300"
                  data-testid="contact-submit-btn"
                >
                  Send Message
                </button>
              </form>
            </div>

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
                      <a href="https://wa.me/211922273334" className="hover:text-primary" data-testid="contact-whatsapp-link">
                        +211 922 273 334 (WhatsApp)
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
                <h3 className="font-serif text-2xl font-semibold text-primary mb-4">
                  Visit Us
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We welcome visitors to our school. Please contact us in advance to schedule a visit and learn more
                  about our programs and how you can get involved.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Office Hours: Monday - Friday, 8:00 AM - 5:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
