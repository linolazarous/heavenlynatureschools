import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Users, Heart, Briefcase, ArrowRight, Copy, MessageCircle, CreditCard } from 'lucide-react';
import api from '../services/api';

const Support = () => {
  const [donationMethods, setDonationMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonationMethods = async () => {
      try {
        const response = await api.get('/donations'); // GET /api/donations
        setDonationMethods(response.data);
      } catch (error) {
        console.error('Failed to fetch donation methods', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationMethods();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Bank details copied to clipboard');
  };

  return (
    <div className="min-h-screen pt-24">
      {/* HERO */}
      <section className="py-32 bg-primary text-white text-center">
        <h1 className="font-serif text-6xl font-bold mb-4">Make a Difference</h1>
        <p className="text-xl">Your support transforms lives and nurtures future leaders</p>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">

          {loading ? (
            <p className="text-center text-muted-foreground">Loading donation options...</p>
          ) : (
            donationMethods.map((method, idx) => (
              <div key={idx} className="bg-accent/30 rounded-2xl p-10 text-center mb-12">
                <h2 className="font-serif text-3xl font-semibold text-primary mb-6">
                  {method.name}
                </h2>

                {method.type === 'bank' && (
                  <>
                    <div className="text-lg text-muted-foreground space-y-2 mb-6">
                      <p><strong>Bank:</strong> {method.bankName}</p>
                      <p><strong>Account Name:</strong> {method.accountName}</p>
                      <p><strong>Account Number:</strong> {method.accountNumber}</p>
                      <p><strong>Currency:</strong> {method.currency}</p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(`${method.bankName}\n${method.accountName}\n${method.accountNumber}\n${method.currency}`)}
                      className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full"
                    >
                      <Copy size={18} /> Copy Bank Details
                    </button>
                  </>
                )}

                {method.type === 'whatsapp' && (
                  <a
                    href={method.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full"
                  >
                    <MessageCircle size={18} /> WhatsApp Donation Inquiry
                  </a>
                )}

                {method.type === 'online' && (
                  <div className="bg-white border border-primary/10 rounded-2xl p-10 text-center mt-6">
                    <CreditCard size={40} className="mx-auto text-primary mb-4" />
                    <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
                      {method.name}
                    </h3>
                    <p className="text-muted-foreground text-lg">{method.note}</p>
                  </div>
                )}
              </div>
            ))
          )}

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
