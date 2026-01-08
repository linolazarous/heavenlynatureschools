import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Users, Heart, Briefcase, ArrowRight } from 'lucide-react';

const Support = () => {
  return (
    <div className="min-h-screen pt-24" data-testid="support-page">
      <section
        className="py-32 bg-cover bg-center relative"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,31,91,0.85), rgba(0,31,91,0.85)), url(https://images.unsplash.com/photo-1720420865912-2bbd6bfa1e85?crop=entropy&cs=srgb&fm=jpg&q=85)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">
            Make a Difference
          </h1>
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto">
            Your support transforms lives and nurtures future leaders
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary mb-6">
              Ways to Get Involved
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every contribution, big or small, makes a lasting impact on a child's life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="support-donations">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <DollarSign size={36} className="text-primary" />
              </div>
              <h3 className="font-serif text-3xl font-medium text-primary mb-4">
                Financial Donations
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Your financial support directly funds our operations, providing free education, meals, and care to
                children in need.
              </p>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span><strong className="text-primary">$50</strong> provides school supplies for one child for a year</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span><strong className="text-primary">$100</strong> covers meals for one child for three months</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span><strong className="text-primary">$500</strong> sponsors a child's full education for one year</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="support-volunteer">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users size={36} className="text-primary" />
              </div>
              <h3 className="font-serif text-3xl font-medium text-primary mb-4">
                Volunteer Your Time
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Share your skills and passion by volunteering at our school. We welcome teachers, mentors, and support staff.
              </p>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Teaching and tutoring</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Mentorship and counseling</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Administrative support</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Skills training and workshops</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="support-inkind">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart size={36} className="text-primary" />
              </div>
              <h3 className="font-serif text-3xl font-medium text-primary mb-4">
                In-Kind Donations
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Donate books, school supplies, clothing, food items, or other resources that support our programs.
              </p>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Books and educational materials</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>School uniforms and clothing</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Sports equipment and supplies</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Computers and technology</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/5 group" data-testid="support-partnerships">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Briefcase size={36} className="text-primary" />
              </div>
              <h3 className="font-serif text-3xl font-medium text-primary mb-4">
                Corporate Partnerships
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Partner with us as a corporate sponsor to create meaningful impact while fulfilling your CSR goals.
              </p>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Sponsorship programs</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Employee volunteer programs</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Matching gift programs</span>
                </p>
                <p className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span>Technical expertise and resources</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-10 md:p-12 text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
              Your Impact Matters
            </h2>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed mb-8">
              Every donation, every hour volunteered, and every partnership formed brings us closer to our goal of
              providing quality education to every child in need. Together, we are nurturing the leaders of tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/contact"
                className="bg-secondary text-primary hover:bg-secondary/90 rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 inline-flex items-center"
                data-testid="support-contact-btn"
              >
                Get in Touch
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <a
                href="mailto:info@heavenlynatureschools.com"
                className="border-2 border-white text-white hover:bg-white hover:text-primary rounded-full px-8 py-4 text-lg font-medium transition-all duration-300"
                data-testid="support-email-btn"
              >
                Email Us
              </a>
            </div>
          </div>

          <div className="bg-accent/30 rounded-2xl p-10 text-center">
            <h2 className="font-serif text-3xl font-semibold text-primary mb-4">
              Bank Details (Coming Soon)
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We are currently setting up our donation infrastructure. Please <Link to="/contact" className="text-primary underline">contact us</Link> directly to discuss how you can support our mission.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;