import React, { useEffect, useState } from 'react';
import { Heart, BookOpen, Users, Award } from 'lucide-react';
import api from '../services/api';

const iconMap = {
  Heart: <Heart size={40} className="text-secondary" />,
  BookOpen: <BookOpen size={40} className="text-secondary" />,
};

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.get('/programs'); // GET /api/programs
        setPrograms(response.data);
      } catch (error) {
        console.error('Failed to fetch programs', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <div className="min-h-screen pt-24" data-testid="programs-page">
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
              Our Programs
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive programs designed to transform lives and nurture future leaders
            </p>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading programs...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden"
                  data-testid={`program-${program.id}`}
                >
                  <div
                    className="h-64 bg-cover bg-center"
                    style={{ backgroundImage: `url(${program.image})` }}
                  ></div>
                  <div className="p-10">
                    <div className="flex items-center space-x-3 mb-6">
                      {iconMap[program.icon] || <Users size={40} className="text-secondary" />}
                      <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary">
                        {program.title}
                      </h2>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      {program.description}
                    </p>
                    {program.components && program.components.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-serif text-xl font-semibold text-primary">Program Components:</h3>
                        <ul className="space-y-3 text-muted-foreground">
                          {program.components.map((comp, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-secondary mr-3 mt-1">•</span>
                              <span dangerouslySetInnerHTML={{ __html: comp }} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

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

          <div className="bg-primary text-white rounded-2xl p-10 md:p-12 text-center">
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
    </div>
  );
};

export default Programs;
