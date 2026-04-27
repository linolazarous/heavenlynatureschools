// frontend/src/pages/Privacy.js
import React from 'react';
import SEO from '../components/SEO';

const Privacy = () => {
  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-gray-50 to-white">
      <SEO
        path="/privacy"
        title="Privacy Policy | Heavenly Nature Schools"
        description="Privacy Policy for Heavenly Nature Nursery & Primary School. Learn how we collect, use, and protect your personal information."
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-primary mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last Updated: April 2026</p>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you fill out our contact form, subscribe to our newsletter, or communicate with us. This may include your name, email address, phone number, and message content.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Respond to your inquiries and questions</li>
              <li>Send you newsletters and updates (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Process donations and support contributions</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">3. Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our website and conducting our mission, subject to confidentiality agreements.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">4. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. You may also opt out of receiving marketing communications at any time by clicking the unsubscribe link in our emails.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-2">📧 info@heavenlynatureschools.com<br />📞 +211 922 273 334</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
