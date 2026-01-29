import React, { useEffect, useState } from 'react';
import { Handshake, Shield, Users } from 'lucide-react';
import api from '../services/api';

const Partnerships = () => {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await api.get('/partnerships');
        setPartners(response.data); // expects an array of partners
      } catch (error) {
        console.error('Failed to fetch partnerships', error);
      }
    };

    fetchPartners();
  }, []);

  return (
    <div className="min-h-screen pt-24" data-testid="partnerships-page">
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
              Memberships & Partnerships
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Collaborating with key stakeholders to maximize our impact
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {partners.length > 0 ? (
              partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group"
                  data-testid={`partnership-${partner.id}`}
                >
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {partner.icon === 'Handshake' && <Handshake size={32} className="text-primary" />}
                    {partner.icon === 'Users' && <Users size={32} className="text-primary" />}
                    {partner.icon === 'Shield' && <Shield size={32} className="text-primary" />}
                  </div>
                  <h3 className="font-serif text-2xl font-medium text-primary mb-4">
                    {partner.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{partner.description}</p>
                </div>
              ))
            ) : (
              <p className="text-center col-span-3 text-muted-foreground">
                Loading partnerships...
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-10 md:p-12 mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6 text-center">
              Why Partnerships Matter
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div>
                <h3 className="font-serif text-2xl font-semibold mb-4">Collective Impact</h3>
                <p className="text-white/95 leading-relaxed">
                  By partnering with established organizations, we amplify our reach and effectiveness. Together, we can
                  address systemic challenges and create lasting change.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold mb-4">Knowledge Sharing</h3>
                <p className="text-white/95 leading-relaxed">
                  Our partnerships enable us to learn from others' experiences, adopt proven strategies, and continuously
                  improve our programs.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold mb-4">Resource Mobilization</h3>
                <p className="text-white/95 leading-relaxed">
                  Through collaborative efforts, we access resources, funding, and technical support that strengthen our
                  capacity to serve more children.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold mb-4">Advocacy & Policy</h3>
                <p className="text-white/95 leading-relaxed">
                  We join forces with partners to advocate for policy changes that benefit vulnerable children and improve
                  education systems nationwide.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-accent/30 rounded-2xl p-10 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-6">
              Become a Partner
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              We welcome partnerships with NGOs, government agencies, faith-based organizations, and businesses who share
              our vision of transforming children's lives through education.
            </p>
            <a
              href="/contact"
              className="inline-block bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-medium transition-all duration-300"
              data-testid="partnerships-contact-btn"
            >
              Contact Us About Partnerships
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partnerships;
