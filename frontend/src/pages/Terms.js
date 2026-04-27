// frontend/src/pages/Terms.js
import React from 'react';
import SEO from '../components/SEO';

const Terms = () => {
  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-gray-50 to-white">
      <SEO
        path="/terms"
        title="Terms of Service | Heavenly Nature Schools"
        description="Terms of Service for Heavenly Nature Nursery & Primary School website. Please read our terms and conditions carefully."
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-primary mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last Updated: April 2026</p>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using the Heavenly Nature Nursery & Primary School website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">2. Use of Website</h2>
            <p>You agree to use our website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the website.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">3. Donations and Support</h2>
            <p>All donations made to Heavenly Nature Nursery & Primary School are voluntary and non-refundable. Donations will be used to support our educational programs and mission.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">4. Intellectual Property</h2>
            <p>All content on this website, including text, graphics, logos, and images, is the property of Heavenly Nature Nursery & Primary School and is protected by copyright laws.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">5. Limitation of Liability</h2>
            <p>Heavenly Nature Nursery & Primary School shall not be liable for any damages arising from the use or inability to use our website, to the fullest extent permitted by law.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">6. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to this page.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">7. Contact Us</h2>
            <p>If you have any questions about these Terms of Service, please contact us at:</p>
            <p className="mt-2">📧 info@heavenlynatureschools.com<br />📞 +211 922 273 334</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
