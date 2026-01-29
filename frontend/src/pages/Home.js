import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, BookOpen, Users, Award } from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [stats, setStats] = useState({
    childrenSupported: 0,
    programs: 0,
    foundedYear: '—',
  });

  useEffect(() => {
    const fetchHomeStats = async () => {
      try {
        const response = await api.get('/home/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to load home stats', error);
      }
    };

    fetchHomeStats();
  }, []);

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* HERO */}
      <section
        className="relative h-[90vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(0,31,91,0.4), rgba(0,31,91,0.8)), url(https://images.unsplash.com/photo-1521493959102-bdd6677fdd81?crop=entropy&cs=srgb&fm=jpg&q=85)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">
            Nurturing Right Leaders
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-white/90">
            Providing hope, education, and transformation to street children, abandoned children, and orphans in South Sudan
          </p>
          <p className="italic mb-8 text-white/80">
            "Train up a child in the way he should go…" – Proverbs 22:6
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/support"
              className="bg-secondary text-primary rounded-full px-8 py-4 font-medium inline-flex items-center"
            >
              Support Our Mission
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              to="/programs"
              className="border-2 border-white rounded-full px-8 py-4 font-medium"
            >
              Our Programs
            </Link>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary">
              Our Impact
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-primary text-white rounded-2xl p-8 text-center">
              <Heart size={48} className="mx-auto mb-4" />
              <h3 className="text-4xl font-bold">{stats.childrenSupported}+</h3>
              <p>Children Supported</p>
            </div>

            <div className="bg-secondary text-primary rounded-2xl p-8 text-center">
              <BookOpen size={48} className="mx-auto mb-4" />
              <h3 className="text-4xl font-bold">Free</h3>
              <p>Quality Education</p>
            </div>

            <div className="bg-accent text-primary rounded-2xl p-8 text-center">
              <Users size={48} className="mx-auto mb-4" />
              <h3 className="text-4xl font-bold">{stats.programs}</h3>
              <p>Core Programs</p>
            </div>

            <div className="bg-primary text-white rounded-2xl p-8 text-center">
              <Award size={48} className="mx-auto mb-4" />
              <h3 className="text-4xl font-bold">{stats.foundedYear}</h3>
              <p>Founded</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
            Make a Difference Today
          </h2>
          <p className="text-xl mb-8">
            Your support helps us provide education, hope, and a brighter future.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/support"
              className="bg-secondary text-primary rounded-full px-8 py-4 font-medium"
            >
              Donate Now
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white rounded-full px-8 py-4 font-medium"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
