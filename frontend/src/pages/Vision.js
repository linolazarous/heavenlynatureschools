import React, { useEffect, useState } from 'react';
import { Eye, Target, Award, HandHeart, Users, Shield } from 'lucide-react';
import api from '../services/api';

const iconMap = {
  volunteerism: HandHeart,
  transparency: Shield,
  teamwork: Users,
};

const Vision = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisionContent = async () => {
      try {
        const response = await api.get('/vision'); // GET /api/vision
        setContent(response.data);
      } catch (error) {
        console.error('Failed to fetch vision content', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisionContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Loading vision content...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">No vision content available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24" data-testid="vision-page">
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
              Vision, Mission & Core Values
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our guiding principles that shape everything we do
            </p>
          </div>

          {/* Vision & Mission */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            <div className="bg-white rounded-2xl p-10 shadow-lg border border-primary/5" data-testid="vision-card">
              <div className="flex items-center space-x-3 mb-6">
                <Eye size={40} className="text-secondary" />
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                  Our Vision
                </h2>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed">{content.vision}</p>
            </div>

            <div className="bg-primary text-white rounded-2xl p-10 shadow-lg" data-testid="mission-card">
              <div className="flex items-center space-x-3 mb-6">
                <Target size={40} className="text-secondary" />
                <h2 className="font-serif text-3xl md:text-4xl font-semibold">
                  Our Mission
                </h2>
              </div>
              <p className="text-xl text-white/95 leading-relaxed">{content.mission}</p>
            </div>
          </div>

          {/* Core Values */}
          <div className="mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary text-center mb-12">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.values.map((val, idx) => {
                const Icon = iconMap[val.key] || Award;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group"
                    data-testid={`value-card-${val.key}`}
                  >
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon size={32} className="text-primary" />
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-primary mb-4">{val.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{val.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Section */}
          <div
            className="bg-cover bg-center rounded-2xl p-12 md:p-16 text-center relative overflow-hidden"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,31,91,0.88), rgba(0,31,91,0.88)), url(https://images.unsplash.com/photo-1763844599737-be3850c60cea?crop=entropy&cs=srgb&fm=jpg&q=85)',
            }}
          >
            <div className="relative z-10 text-white">
              <Award size={64} className="mx-auto mb-6 text-secondary" />
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Built on Faith and Service
              </h2>
              <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed">{content.footer}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Vision;
