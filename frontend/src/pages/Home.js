import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, BookOpen, Users, Award } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen" data-testid="home-page">
      <section
        className="relative h-[90vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(0,31,91,0.4), rgba(0,31,91,0.8)), url(https://images.unsplash.com/photo-1521493959102-bdd6677fdd81?crop=entropy&cs=srgb&fm=jpg&q=85)'
        }}
        data-testid="hero-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Nurturing Right Leaders
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-white/90 max-w-3xl mx-auto">
            Providing hope, education, and transformation to street children, abandoned children, and orphans in South Sudan
          </p>
          <p className="text-lg md:text-xl italic mb-8 text-white/80">
            "Train up a child in the way he should go; even when he is old he will not depart from it." - Proverbs 22:6
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/support"
              className="bg-secondary text-primary hover:bg-secondary/90 rounded-full px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 inline-flex items-center"
              data-testid="hero-support-btn"
            >
              Support Our Mission
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              to="/programs"
              className="border-2 border-white text-white hover:bg-white hover:text-primary rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 inline-flex items-center"
              data-testid="hero-programs-btn"
            >
              Our Programs
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-white" data-testid="impact-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Together, we are transforming lives through education, faith, and compassion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-primary text-white rounded-2xl p-8 text-center transform hover:-translate-y-2 transition-all duration-300" data-testid="stat-card-children">
              <Heart size={48} className="mx-auto mb-4" />
              <h3 className="font-serif text-4xl font-bold mb-2">100+</h3>
              <p className="text-white/90">Children Supported</p>
            </div>

            <div className="bg-secondary text-primary rounded-2xl p-8 text-center transform hover:-translate-y-2 transition-all duration-300" data-testid="stat-card-education">
              <BookOpen size={48} className="mx-auto mb-4" />
              <h3 className="font-serif text-4xl font-bold mb-2">Free</h3>
              <p className="text-primary/90 font-medium">Quality Education</p>
            </div>

            <div className="bg-accent text-primary rounded-2xl p-8 text-center transform hover:-translate-y-2 transition-all duration-300" data-testid="stat-card-programs">
              <Users size={48} className="mx-auto mb-4" />
              <h3 className="font-serif text-4xl font-bold mb-2">2</h3>
              <p className="text-primary/90 font-medium">Core Programs</p>
            </div>

            <div className="bg-primary text-white rounded-2xl p-8 text-center transform hover:-translate-y-2 transition-all duration-300" data-testid="stat-card-founded">
              <Award size={48} className="mx-auto mb-4" />
              <h3 className="font-serif text-4xl font-bold mb-2">2023</h3>
              <p className="text-white/90">Founded</p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-20 md:py-32 bg-cover bg-center relative"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,31,91,0.92), rgba(0,31,91,0.92)), url(https://images.unsplash.com/flagged/photo-1555251255-e9a095d6eb9d?crop=entropy&cs=srgb&fm=jpg&q=85)'
        }}
        data-testid="mission-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
            Our Mission
          </h2>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed">
            To provide free, quality education rooted in Christian values to street children, abandoned children,
            and orphans, empowering them to become leaders who transform their communities.
          </p>
          <Link
            to="/about"
            className="mt-8 inline-flex items-center bg-secondary text-primary hover:bg-secondary/90 rounded-full px-8 py-4 text-lg font-medium transition-all duration-300"
            data-testid="mission-learn-more-btn"
          >
            Learn More About Us
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-background" data-testid="programs-preview-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary mb-4">
              What We Do
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive programs address the holistic needs of every child
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="program-card-rehabilitation">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart size={32} className="text-primary" />
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-medium text-primary mb-4">
                Rehabilitation & Reformation
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We provide a safe, nurturing environment where children can heal, grow, and discover their potential.
                Our holistic approach addresses physical, emotional, and spiritual needs.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="program-card-education">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen size={32} className="text-primary" />
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-medium text-primary mb-4">
                Nursery & Primary Education
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Our faith-based curriculum combines academic excellence with character development, preparing children
                for success in school and life.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/programs"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-lg"
              data-testid="programs-view-all-link"
            >
              View All Programs
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-primary/90 text-white" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
            Make a Difference Today
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Your support helps us provide education, hope, and a brighter future to children in need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/support"
              className="bg-secondary text-primary hover:bg-secondary/90 rounded-full px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              data-testid="cta-donate-btn"
            >
              Donate Now
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-primary rounded-full px-8 py-4 text-lg font-medium transition-all duration-300"
              data-testid="cta-contact-btn"
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