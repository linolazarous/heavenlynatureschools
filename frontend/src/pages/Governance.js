import React from 'react';
import { Users, GraduationCap, Network } from 'lucide-react';

const Governance = () => {
  return (
    <div className="min-h-screen pt-24" data-testid="governance-page">
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
              Governance & Leadership
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transparent, accountable leadership guiding our mission
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="bg-white rounded-2xl p-10 shadow-lg border border-primary/5" data-testid="governance-board">
              <div className="flex items-center space-x-3 mb-6">
                <Users size={40} className="text-secondary" />
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                  School Board of Directors
                </h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Our School Board of Directors provides strategic oversight and governance, ensuring that our school
                operates with integrity, accountability, and excellence.
              </p>
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-semibold text-primary">Board Responsibilities:</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>Strategic planning and policy development</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>Financial oversight and resource management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>Ensuring adherence to mission and values</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>Community relations and partnerships</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>Monitoring school performance and impact</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-lg border border-primary/5" data-testid="governance-management">
              <div className="flex items-center space-x-3 mb-6">
                <Network size={40} className="text-secondary" />
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                  School Management Committee
                </h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                The School Management Committee works closely with school leadership to oversee daily operations and
                ensure quality education delivery.
              </p>
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-semibold text-primary">Committee Functions:</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>Academic program oversight</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>Staff supervision and development</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>Student welfare and discipline</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>Infrastructure and facilities management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>Coordination with stakeholders</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-primary text-white rounded-2xl p-10 shadow-lg mb-12" data-testid="governance-headteacher">
            <div className="flex items-center space-x-3 mb-6">
              <GraduationCap size={48} className="text-secondary" />
              <h2 className="font-serif text-3xl md:text-4xl font-semibold">
                Head Teacher's Leadership
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-lg text-white/95 leading-relaxed mb-6">
                  The Head Teacher is the chief academic and administrative officer of the school, responsible for
                  implementing the vision and policies set by the Board and Management Committee.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold mb-4">Key Responsibilities:</h3>
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Educational leadership and curriculum implementation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Staff recruitment, training, and evaluation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Student enrollment and academic progress monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Community engagement and parent relations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-accent/30 rounded-2xl p-10 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-6">
              Committed to Transparency
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We operate with full transparency and accountability to our students, staff, donors, and the wider community.
              Our governance structures ensure that every decision serves the best interests of the children we serve.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Governance;