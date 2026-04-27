// frontend/src/pages/Support.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Users, Heart, Briefcase, ArrowRight, Copy, Check, Building, Landmark, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

const Support = () => {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen pt-24" data-testid="support-page">
      <SEO
        path="/support"
        title="Support Us | Heavenly Nature Schools"
        description="Support Heavenly Nature Schools and help provide free education to street children and orphans in Juba City. Donate, volunteer, or give in-kind — every contribution matters."
        keywords="donate, support, volunteer, bank details, Heavenly Nature Schools, Juba, South Sudan"
      />
      
      {/* Hero Section */}
      <section
        className="py-32 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,31,91,0.85), rgba(0,31,91,0.85)), url('/hero-bg.jpg')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Make a Difference
          </h1>
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto">
            Your support transforms lives and nurtures future leaders
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary mb-6">
              Ways to Get Involved
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every contribution, big or small, makes a lasting impact on a child's life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="support-donations">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <DollarSign size={36} className="text-primary" />
              </div>
              <h3 className="font-serif text-3xl font-medium text-primary mb-4">
                Financial Donations
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Your financial support directly funds our operations, providing free education, meals, and care to
                children in need.
              </p>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span><strong className="text-primary">$50</strong> provides school supplies for one child for a year</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span><strong className="text-primary">$100</strong> covers meals for one child for three months</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span><strong className="text-primary">$500</strong> sponsors a child's full education for one year</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="support-volunteer">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users size={36} className="text-primary" />
              </div>
              <h3 className="font-serif text-3xl font-medium text-primary mb-4">
                Volunteer Your Time
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Share your skills and passion by volunteering at our school. We welcome teachers, mentors, and support staff.
              </p>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Teaching and tutoring</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Mentorship and counseling</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Administrative support</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Skills training and workshops</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="support-inkind">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart size={36} className="text-primary" />
              </div>
              <h3 className="font-serif text-3xl font-medium text-primary mb-4">
                In-Kind Donations
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Donate books, school supplies, clothing, food items, or other resources that support our programs.
              </p>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Books and educational materials</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>School uniforms and clothing</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Sports equipment and supplies</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Computers and technology</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="support-partnerships">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Briefcase size={36} className="text-primary" />
              </div>
              <h3 className="font-serif text-3xl font-medium text-primary mb-4">
                Corporate Partnerships
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Partner with us as a corporate sponsor to create meaningful impact while fulfilling your CSR goals.
              </p>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Sponsorship programs</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Employee volunteer programs</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Matching gift programs</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Technical expertise and resources</span>
                </p>
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-10 md:p-12 mb-12" data-testid="bank-details">
            <div className="text-center mb-8">
              <Building size={48} className="mx-auto mb-4 text-secondary" />
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
                Bank Transfer Details
              </h2>
              <p className="text-xl text-white/95 max-w-3xl mx-auto">
                Make a direct bank transfer using the details below
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Information */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Landmark size={24} className="text-secondary" />
                  <h3 className="text-xl font-semibold">Account Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Account Name</p>
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <p className="font-mono text-sm">HEAVENLY NATURE NURSERY AND PRIMARY SCHOOL</p>
                      <button
                        onClick={() => copyToClipboard('HEAVENLY NATURE NURSERY AND PRIMARY SCHOOL', 'Account Name')}
                        className="p-1 hover:bg-white/10 rounded transition"
                      >
                        {copiedField === 'Account Name' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-white/70 text-sm mb-1">Account Number (SSP)</p>
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <p className="font-mono text-lg font-bold">641925</p>
                      <button
                        onClick={() => copyToClipboard('641925', 'SSP Account')}
                        className="p-1 hover:bg-white/10 rounded transition"
                      >
                        {copiedField === 'SSP Account' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-white/70 text-sm mb-1">Account Number (USD)</p>
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <p className="font-mono text-lg font-bold">641926</p>
                      <button
                        onClick={() => copyToClipboard('641926', 'USD Account')}
                        className="p-1 hover:bg-white/10 rounded transition"
                      >
                        {copiedField === 'USD Account' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Information */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={24} className="text-secondary" />
                  <h3 className="text-xl font-semibold">Bank Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Bank Name</p>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="font-semibold">EDEN COMMERCIAL BANK</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-white/70 text-sm mb-1">SWIFT Code</p>
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <p className="font-mono font-bold">EDBKSSJB</p>
                      <button
                        onClick={() => copyToClipboard('EDBKSSJB', 'SWIFT Code')}
                        className="p-1 hover:bg-white/10 rounded transition"
                      >
                        {copiedField === 'SWIFT Code' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-white/70 text-sm mb-1">Branch</p>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p>Gudele Branch, Juba, South Sudan</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-white/70 text-sm mb-1">Branch Address</p>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-sm">Gudele area Juba, South Sudan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/90">
                <strong className="text-yellow-300">Important:</strong> Please include your name and contact information in the transfer reference so we can acknowledge your donation. After making a transfer, please notify us at <a href="mailto:info@heavenlynatureschools.com" className="text-secondary underline">info@heavenlynatureschools.com</a> or call <a href="tel:+211922273334" className="text-secondary underline">+211 922 273 334</a>.
              </p>
            </div>
          </div>

          {/* Impact Section */}
          <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl p-10 md:p-12 text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-6">
              Your Impact Matters
            </h2>
            <p className="text-xl text-primary/90 max-w-3xl mx-auto leading-relaxed mb-8">
              Every donation, every hour volunteered, and every partnership formed brings us closer to our goal of
              providing quality education to every child in need. Together, we are nurturing the leaders of tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/contact"
                className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 inline-flex items-center"
                data-testid="support-contact-btn"
              >
                Get in Touch
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <a
                href="mailto:info@heavenlynatureschools.com"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8 py-4 text-lg font-medium transition-all duration-300"
                data-testid="support-email-btn"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
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
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Support;
