import React from 'react';
import { Eye, Target, Award, HandHeart, Users, Shield } from 'lucide-react';

const Vision = () => {
  return (
    <div className="min-h-screen pt-24" data-testid="vision-page">
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
              Vision, Mission & Core Values
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our guiding principles that shape everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            <div className="bg-white rounded-2xl p-10 shadow-lg border border-primary/5" data-testid="vision-card">
              <div className="flex items-center space-x-3 mb-6">
                <Eye size={40} className="text-secondary" />
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                  Our Vision
                </h2>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed">
                To be a beacon of hope and excellence in education, nurturing future leaders who will transform South
                Sudan through knowledge, faith, and compassion. We envision a nation where every child, regardless of
                their background, has access to quality education and the opportunity to fulfill their God-given potential.
              </p>
            </div>

            <div className="bg-primary text-white rounded-2xl p-10 shadow-lg" data-testid="mission-card">
              <div className="flex items-center space-x-3 mb-6">
                <Target size={40} className="text-secondary" />
                <h2 className="font-serif text-3xl md:text-4xl font-semibold">
                  Our Mission
                </h2>
              </div>
              <p className="text-xl text-white/95 leading-relaxed">
                To provide free, holistic, and faith-based education to street children, abandoned children, and orphans,
                empowering them with knowledge, skills, and Christian values to become transformative leaders in their
                communities and beyond.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary text-center mb-12">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="value-card-volunteerism">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <HandHeart size={32} className="text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-primary mb-4">
                  Volunteerism & Professionalism
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We are driven by a genuine desire to serve. Our staff and volunteers bring both compassion and
                  professional excellence to every interaction.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="value-card-transparency">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield size={32} className="text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-primary mb-4">
                  Transparency & Accountability
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We operate with complete honesty and integrity. Every donation, decision, and action is made with
                  accountability to our children, partners, and community.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="value-card-teamwork">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users size={32} className="text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-primary mb-4">
                  Teamwork
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We believe in the power of collaboration. By working together—staff, volunteers, partners, and the
                  community—we achieve greater impact.
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-cover bg-center rounded-2xl p-12 md:p-16 text-center relative overflow-hidden"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,31,91,0.88), rgba(0,31,91,0.88)), url(https://images.unsplash.com/photo-1763844599737-be3850c60cea?crop=entropy&cs=srgb&fm=jpg&q=85)'
            }}
          >
            <div className="relative z-10 text-white">
              <Award size={64} className="mx-auto mb-6 text-secondary" />
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Built on Faith and Service
              </h2>
              <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed">
                Every child is created with a purpose. Our values guide us as we help them discover and fulfill that
                purpose through education, love, and unwavering support.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Vision;