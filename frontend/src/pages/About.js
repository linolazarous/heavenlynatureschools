// frontend/src/pages/About.js
import React from 'react';
import { History, Target, Heart, Users, BookOpen, Shield } from 'lucide-react';
import SEO from '../components/SEO';

const About = () => {
  return (
    <div className="min-h-screen pt-24" data-testid="about-page">
      <SEO
        path="/about"
        title="About Us | Heavenly Nature Schools"
        description="Learn about Heavenly Nature Schools — our founding story, values, and commitment to providing free Christian education to vulnerable children in Juba City, South Sudan."
        keywords="about, school history, mission, Heavenly Nature Schools, Juba, South Sudan"
      />
      
      {/* Hero Section with Local Background Image */}
      <section 
        className="relative h-[50vh] min-h-[400px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,31,91,0.7), rgba(0,31,91,0.85)), url('/about.jpg')`
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
            About Us
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90">
            A faith-based institution dedicated to transforming lives through education and compassion
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Our Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <div className="flex items-center space-x-3 mb-6">
                <History size={32} className="text-secondary" />
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                  Our Story
                </h2>
              </div>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Heavenly Nature Nursery & Primary School was founded in <strong className="text-primary">February 2023</strong> by <strong className="text-primary">Heavenly Nature Ministry</strong>, born from a deep calling to serve the most vulnerable children in South Sudan.
                </p>
                <p>
                  Located in <strong className="text-primary">Juba City, Central Equatoria State</strong>, we are a registered non-profit educational institution committed to providing free, quality education to street children, abandoned children, and orphans.
                </p>
                <p>
                  Our school is more than an educational facility—it is a sanctuary of hope, where children who have faced unimaginable hardships can find safety, love, and the opportunity to build a brighter future.
                </p>
                <p>
                  We believe every child deserves the chance to learn, grow, and become the leader they were created to be. This belief drives everything we do.
                </p>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <img
                src="/about.jpg"
                alt="Children at Heavenly Nature Schools"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Our Purpose Section */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-primary/5 mb-20">
            <div className="flex items-center space-x-3 mb-6">
              <Target size={32} className="text-secondary" />
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                Our Purpose
              </h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Heavenly Nature Nursery & Primary School exists to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-3 text-lg text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">✓</span>
                    <span><strong className="text-primary">Provide free education</strong> to children who cannot afford school fees</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">✓</span>
                    <span><strong className="text-primary">Rescue and rehabilitate</strong> street children and abandoned children</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">✓</span>
                    <span><strong className="text-primary">Instill Christian values</strong> while respecting all children regardless of background</span>
                  </li>
                </ul>
                <ul className="space-y-3 text-lg text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">✓</span>
                    <span><strong className="text-primary">Develop future leaders</strong> who will transform their communities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">✓</span>
                    <span><strong className="text-primary">Partner with stakeholders</strong> to create lasting impact</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Compassion</h3>
              <p className="text-gray-600">Showing God's love to every child through care and understanding</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Excellence</h3>
              <p className="text-gray-600">Providing quality education that transforms lives</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Integrity</h3>
              <p className="text-gray-600">Operating with honesty and transparency in all we do</p>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">2023</p>
              <p className="text-gray-500">Year Founded</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">100+</p>
              <p className="text-gray-500">Children Supported</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">2</p>
              <p className="text-gray-500">Core Programs</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">Free</p>
              <p className="text-gray-500">Quality Education</p>
            </div>
          </div>

          {/* Future Vision Section */}
          <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
              Looking to the Future
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              As we continue to grow, we envision establishing a <strong className="text-secondary">secondary school</strong> to provide continuous
              education pathways for our students. Together with your support, we can expand our reach and impact even
              more lives.
            </p>
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

export default About;
