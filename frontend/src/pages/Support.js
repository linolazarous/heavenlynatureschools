import React from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  Heart,
  Briefcase,
  ArrowRight,
  Copy,
  MessageCircle,
  CreditCard
} from 'lucide-react';

const bankDetails = `
Bank Name: EDEN COMMERCIAL BANK PLC
Account Name: HEAVENLY NATURE NURSERY AND PRIMARY SCHOOL
Account Number: 43081
Currency: USD / SSP
`;

const Support = () => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(bankDetails);
    alert('Bank details copied to clipboard');
  };

  return (
    <div className="min-h-screen pt-24">
      {/* HERO */}
      <section className="py-32 bg-primary text-white text-center">
        <h1 className="font-serif text-6xl font-bold mb-4">Make a Difference</h1>
        <p className="text-xl">
          Your support transforms lives and nurtures future leaders
        </p>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">

          {/* BANK DETAILS */}
          <div className="bg-accent/30 rounded-2xl p-10 text-center mb-12">
            <h2 className="font-serif text-3xl font-semibold text-primary mb-6">
              Bank Donation Details
            </h2>

            <div className="text-lg text-muted-foreground space-y-2 mb-6">
              <p><strong>Bank:</strong> EDEN COMMERCIAL BANK PLC</p>
              <p><strong>Account Name:</strong> HEAVENLY NATURE NURSERY AND PRIMARY SCHOOL</p>
              <p><strong>Account Number:</strong> 43081</p>
              <p><strong>Currency:</strong> USD / SSP</p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {/* COPY BUTTON */}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full"
              >
                <Copy size={18} /> Copy Bank Details
              </button>

              {/* WHATSAPP BUTTON */}
              <a
                href="https://wa.me/211922273334?text=Hello%20I%20would%20like%20to%20support%20Heavenly%20Nature%20Nursery%20%26%20Primary%20School"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full"
              >
                <MessageCircle size={18} /> WhatsApp Donation Inquiry
              </a>
            </div>
          </div>

          {/* STRIPE COMING SOON */}
          <div className="bg-white border border-primary/10 rounded-2xl p-10 text-center mb-12">
            <CreditCard size={40} className="mx-auto text-primary mb-4" />
            <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
              Online Card Payments
            </h3>
            <p className="text-muted-foreground text-lg">
              Stripe online payments are <strong>COMING SOON</strong>.
              <br />
              Please use bank transfer or WhatsApp for now.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-secondary text-primary px-8 py-4 rounded-full text-lg"
            >
              Contact Us <ArrowRight size={20} />
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Support;
