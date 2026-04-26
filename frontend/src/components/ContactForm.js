// frontend/src/components/ContactForm.js
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { publicApi } from '../utils/api';

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', message: '' };

const ContactForm = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      case 'subject':
        if (!value.trim()) return 'Subject is required';
        if (value.trim().length < 3) return 'Subject must be at least 3 characters';
        return '';
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        return '';
      case 'phone':
        if (value && value.trim() && !/^[\d\s\+\-\(\)]+$/.test(value)) {
          return 'Please enter a valid phone number';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Use the publicApi from your api.js
      await publicApi.submitContact(formData);
      
      setSubmitted(true);
      toast.success("Thank you for contacting us! We'll get back to you soon. 🙏");
      setFormData(EMPTY_FORM);
      setErrors({});
      setTouched({});
      
      // Reset submitted state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Contact form error:', err);
      const errorMessage = err.message || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
      
      // Specific error handling
      if (err.message.includes('network') || err.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] ? errors[fieldName] : null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
      {submitted && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-green-500" />
            <div>
              <p className="text-green-700 font-medium">Message Sent Successfully!</p>
              <p className="text-green-600 text-sm">We'll respond within 24-48 hours.</p>
            </div>
          </div>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
            getFieldError('name') 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 hover:border-primary'
          }`}
          placeholder="John Doe"
          data-testid="contact-name-input"
          disabled={submitting}
        />
        {getFieldError('name') && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={14} />
            {getFieldError('name')}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
            getFieldError('email') 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 hover:border-primary'
          }`}
          placeholder="john@example.com"
          data-testid="contact-email-input"
          disabled={submitting}
        />
        {getFieldError('email') && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={14} />
            {getFieldError('email')}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
          Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
            getFieldError('phone') 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 hover:border-primary'
          }`}
          placeholder="+1 234 567 8900"
          data-testid="contact-phone-input"
          disabled={submitting}
        />
        {getFieldError('phone') && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={14} />
            {getFieldError('phone')}
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-primary mb-2">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          value={formData.subject}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
            getFieldError('subject') 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 hover:border-primary'
          }`}
          placeholder="How can we help you?"
          data-testid="contact-subject-input"
          disabled={submitting}
        />
        {getFieldError('subject') && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={14} />
            {getFieldError('subject')}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows="6"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
            getFieldError('message') 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 hover:border-primary'
          }`}
          placeholder="Please provide details about your inquiry..."
          data-testid="contact-message-input"
          disabled={submitting}
        />
        {getFieldError('message') && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={14} />
            {getFieldError('message')}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Minimum 10 characters. We'll respond within 24-48 hours.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-2"
        data-testid="contact-submit-btn"
      >
        {submitting ? (
          <>
            <Loader size={20} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send size={20} />
            Send Message
          </>
        )}
      </button>

      {/* Privacy Note */}
      <p className="text-xs text-gray-400 text-center mt-4">
        By submitting this form, you agree to our privacy policy. We'll never share your information.
      </p>
    </form>
  );
};

export default ContactForm;
