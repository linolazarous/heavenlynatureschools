// frontend/src/pages/Programs.js
import React from 'react';
import { Heart, BookOpen, Users, Award, Target, Clock, Shield, Star } from 'lucide-react';
import SEO from '../components/SEO';

const Programs = () => {
  return (
    <div className="min-h-screen pt-24" data-testid="programs-page">
      <SEO
        path="/programs"
        title="Our Programs | Heavenly Nature Schools"
        description="Explore Heavenly Nature Schools' programs: nursery &amp; primary education, rehabilitation, spiritual development, and skills training for children in Juba City, South Sudan."
        keywords="programs, nursery, primary, education, rehabilitation, Heavenly Nature Schools, Juba, South Sudan"
      />
      
      {/* Hero Section with Local Background Image */}
      <section 
        className="relative h-[50vh] min-h-[400px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,31,91,0.7), rgba(0,31,91,0.85)), url('/program1.jpg')`
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
            Our Programs
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90">
            Comprehensive programs designed to transform lives and nurture future leaders
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Rehabilitation Program */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300" data-testid="program-rehabilitation">
              <div className="h-64 overflow-hidden">
                <img 
                  src="/program1.jpg" 
                  alt="Rehabilitation & Reformation Program" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-10">
                <div className="flex items-center space-x-3 mb-6">
                  <Heart size={40} className="text-secondary" />
                  <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                    Rehabilitation & Reformation
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Our rehabilitation program provides a safe haven for street children and abandoned children, offering
                  them the care and support they need to heal and thrive.
                </p>
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-semibold text-primary">Program Components:</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="text-secondary mr-3 mt-1">✓</span>
                      <span><strong className="text-primary">Safe Environment:</strong> A secure, nurturing space where children can feel protected</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary mr-3 mt-1">✓</span>
                      <span><strong className="text-primary">Nutritious Meals:</strong> Regular, healthy meals to support physical development</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary mr-3 mt-1">✓</span>
                      <span><strong className="text-primary">Emotional Support:</strong> Counseling and mentorship to address trauma</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary mr-3 mt-1">✓</span>
                      <span><strong className="text-primary">Life Skills Training:</strong> Practical skills for daily living and personal development</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary mr-3 mt-1">✓</span>
                      <span><strong className="text-primary">Spiritual Guidance:</strong> Faith-based teachings to build character and hope</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Education Program */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300" data-testid="program-education">
              <div className="h-64 overflow-hidden">
                <img 
                  src="/program2.jpg" 
                  alt="Nursery & Primary Education Program" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-10">
                <div className="flex items-center space-x-3 mb-6">
                  <BookOpen size={40} className="text-secondary" />
                  <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                    Nursery & Primary Education
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  We offer a comprehensive, faith-based curriculum that combines academic excellence with character
                  development, preparing students for success.
                </p>
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-semibold text-primary">Educational Offerings:</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="text-secondary mr-3 mt-1">✓</span>
                      <span><strong className="text-primary">Nursery Level:</strong> Foundation in literacy, numeracy, and social skills</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary mr-3 mt-1">✓</span>
                      <span><strong className="text-primary">Primary Level:</strong> Comprehensive curriculum aligned with national standards</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary mr-3 mt-1">✓</span>
                      <span><strong className="text-primary">Christian Education:</strong> Bible studies and moral teachings</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary mr-3 mt-1">✓</span>
                      <span><strong className="text-primary">Extra-Curricular Activities:</strong> Sports, arts, and leadership programs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary mr-3 mt-1">✓</span>
                      <span><strong className="text-primary">Qualified Teachers:</strong> Dedicated educators committed to student success</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Program Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target size={36} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Holistic Development</h3>
              <p className="text-gray-600">Addressing academic, physical, emotional, and spiritual needs</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={36} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Full-Day Program</h3>
              <p className="text-gray-600">Monday-Friday, 8:00 AM - 4:00 PM including meals</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={36} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Quality Education</h3>
              <p className="text-gray-600">Certified teachers and comprehensive curriculum</p>
            </div>
          </div>

          {/* Statistics Banner */}
          <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl p-10 md:p-12 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div data-testid="program-stat-cost">
                <Users size={48} className="mx-auto mb-4 text-primary" />
                <h3 className="font-serif text-4xl font-bold text-primary mb-2">100%</h3>
                <p className="text-primary/80 font-medium">Free for All Students</p>
              </div>
              <div data-testid="program-stat-focus">
                <Award size={48} className="mx-auto mb-4 text-primary" />
                <h3 className="font-serif text-4xl font-bold text-primary mb-2">Holistic</h3>
                <p className="text-primary/80 font-medium">Mind, Body & Spirit</p>
              </div>
              <div data-testid="program-stat-quality">
                <BookOpen size={48} className="mx-auto mb-4 text-primary" />
                <h3 className="font-serif text-4xl font-bold text-primary mb-2">Quality</h3>
                <p className="text-primary/80 font-medium">Certified Curriculum</p>
              </div>
            </div>
          </div>

          {/* Future Plans Section */}
          <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-10 md:p-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
              Future Plans: Secondary School
            </h2>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed">
              We are committed to expanding our impact by establishing a secondary school, providing continuous education
              pathways for our students from nursery through secondary level. This will ensure that no child's education
              is interrupted due to lack of resources.
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

export default Programs;
