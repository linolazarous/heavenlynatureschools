import React from 'react';
import { History, Target } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen pt-24" data-testid="about-page">
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
              About Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A faith-based institution dedicated to transforming lives through education and compassion
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <img
                src="https://images.unsplash.com/flagged/photo-1555251255-e9a095d6eb9d?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Smiling children at school"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div>
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
          </div>

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
              <ul className="space-y-3 text-lg text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span><strong className="text-primary">Provide free education</strong> to children who cannot afford school fees</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span><strong className="text-primary">Rescue and rehabilitate</strong> street children and abandoned children</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span><strong className="text-primary">Instill Christian values</strong> while respecting all children regardless of background</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span><strong className="text-primary">Develop future leaders</strong> who will transform their communities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">•</span>
                  <span><strong className="text-primary">Partner with stakeholders</strong> to create lasting impact</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
              Looking to the Future
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              As we continue to grow, we envision establishing a <strong>secondary school</strong> to provide continuous
              education pathways for our students. Together with your support, we can expand our reach and impact even
              more lives.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;