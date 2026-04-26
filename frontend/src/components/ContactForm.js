import React, { useState } from 'react';
import { toast } from 'sonner';

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', message: '' };

const ContactForm = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Submission failed');
      }
      toast.success("Thank you for contacting us! We'll get back to you soon.");
      setFormData(EMPTY_FORM);
    } catch (err) {
      toast.error(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      name="contact"
      method="POST"
      onSubmit={handleSubmit}
      className="space-y-6"
      data-testid="contact-form"
    >
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
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 disabled:opacity-60"
        data-testid="contact-submit-btn"
      >
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactForm;
