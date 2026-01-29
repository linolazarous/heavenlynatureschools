import React, { useEffect, useState } from 'react';
import { History, Target } from 'lucide-react';
import api from '../services/api';

const About = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/about') // your backend endpoint for About content
      .then(data => {
        setAboutData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load about content.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-20">Loading About Page...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen pt-24" data-testid="about-page">
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
              {aboutData?.title || 'About Us'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {aboutData?.subtitle || 'A faith-based institution dedicated to transforming lives through education and compassion'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <img
                src={aboutData?.image || 'https://images.unsplash.com/flagged/photo-1555251255-e9a095d6eb9d?crop=entropy&cs=srgb&fm=jpg&q=85'}
                alt="About"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <History size={32} className="text-secondary" />
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                  {aboutData?.storyTitle || 'Our Story'}
                </h2>
              </div>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                {aboutData?.story?.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-primary/5 mb-20">
            <div className="flex items-center space-x-3 mb-6">
              <Target size={32} className="text-secondary" />
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                {aboutData?.purposeTitle || 'Our Purpose'}
              </h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <ul className="space-y-3 text-lg text-muted-foreground">
                {aboutData?.purpose?.map((item, idx) => (
                  <li className="flex items-start" key={idx}>
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
              {aboutData?.futureTitle || 'Looking to the Future'}
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {aboutData?.futureText || 'As we continue to grow, we envision establishing a secondary school to provide continuous education pathways for our students.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
