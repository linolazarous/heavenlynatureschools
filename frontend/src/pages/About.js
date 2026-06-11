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
        description="Learn about Heavenly Nature Nursery & Primary School and Heavenly Nature Ministry, providing education, care, and hope to orphans, vulnerable children, street children, and children with disabilities in South Sudan."
        keywords="about, school history, mission, Heavenly Nature Schools, Juba, South Sudan"
      />
      
      {/* Hero Section */}
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
                  Heavenly Nature Nursery & Primary School (HNNPS) was founded in <strong className="text-primary">February 2023</strong> by <strong className="text-primary">Heavenly Nature Ministry</strong> as part of its mission to serve vulnerable children and strengthen communities through education, faith, and compassion.
                </p>
                <p>
                  Located in <strong className="text-primary">Juba County, Central Equatoria State, South Sudan</strong>, the school operates alongside Heavenly Nature Orphanage to provide quality education, care, and hope to orphans, vulnerable children, street children, abandoned children, and children with disabilities.
                </p>
                <p>
                  Today, the school serves <strong className="text-primary">111 learners</strong>. Of these, <strong className="text-primary">96 children</strong> are supported through Heavenly Nature Ministry and the orphanage, receiving education free of charge. The remaining <strong className="text-primary">15 learners</strong> come from the surrounding community and contribute school fees approved by the Board of Directors.
                </p>
                <p>
                  Our school is more than a place of learning. It is a safe and nurturing environment where children develop academically, socially, spiritually, and emotionally. Through faith-based education, mentorship, and character development, we are nurturing the next generation of responsible leaders for South Sudan.
                </p>
                <p>
                  We believe every child deserves the opportunity to learn, grow, and fulfill their God-given potential regardless of their background or circumstances.
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
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Heavenly Nature Nursery & Primary School exists to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-3 text-lg text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">✓</span>
                    <span><strong className="text-primary">Provide free education</strong> to orphans, vulnerable children, and children under the care of Heavenly Nature Ministry.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">✓</span>
                    <span><strong className="text-primary">Support rehabilitation and reintegration</strong> of street and abandoned children.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">✓</span>
                    <span><strong className="text-primary">Provide inclusive education</strong> for children with disabilities and special needs.</span>
                  </li>
                </ul>
                <ul className="space-y-3 text-lg text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">✓</span>
                    <span><strong className="text-primary">Instill Christian values</strong>, good character, and leadership skills.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">✓</span>
                    <span><strong className="text-primary">Deliver quality nursery and primary education</strong> that prepares learners for future success.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">✓</span>
                    <span><strong className="text-primary">Partner with communities, churches, organizations, and well-wishers</strong> to create lasting impact.</span>
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

          {/* Statistics Section - Updated with actual numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">2023</p>
              <p className="text-gray-500">Year Founded</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">111</p>
              <p className="text-gray-500">Learners Enrolled</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">96</p>
              <p className="text-gray-500">Children Supported Free</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">15</p>
              <p className="text-gray-500">Community Learners</p>
            </div>
          </div>

          {/* Future Vision Section */}
          <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
              Looking to the Future
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              As Heavenly Nature Ministry continues to grow, we aspire to establish a <strong className="text-secondary">secondary school</strong> and expand our <strong className="text-secondary">orphanage and child support programs</strong>. Through partnerships, sponsorships, and community support, we aim to reach more vulnerable children and provide them with education, care, and opportunities to build a brighter future.
            </p>
          </div>

          {/* Organization Structure Note */}
          <div className="mt-16 bg-secondary/5 rounded-2xl p-8 border border-secondary/10">
            <div className="flex items-center space-x-3 mb-4">
              <Users size={24} className="text-primary" />
              <h3 className="font-serif text-xl font-semibold text-primary">
                Our Structure
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-primary">Heavenly Nature Ministry</strong> is the parent organization that oversees{' '}
              <strong className="text-primary">Heavenly Nature Nursery & Primary School</strong> and{' '}
              <strong className="text-primary">Heavenly Nature Orphanage</strong>. This unified structure allows us to provide 
              holistic care — combining education, shelter, nutrition, and spiritual guidance — to the children we serve.
              The school operates under the guidance of the Ministry's Board of Directors, ensuring accountability, 
              transparency, and alignment with our mission.
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
