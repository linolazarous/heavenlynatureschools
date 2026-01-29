import React, { useEffect, useState } from "react";
import { Users, GraduationCap, Network } from "lucide-react";
import api from "../services/api";

const Governance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGovernance = async () => {
      try {
        const res = await api.get("/governance");
        setData(res.data);
      } catch (error) {
        console.error("Failed to load governance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGovernance();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading governance data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">
          Governance information is currently unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
              {data.intro?.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {data.intro?.subtitle}
            </p>
          </div>

          {/* Board + Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

            {/* Board */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border border-primary/5">
              <div className="flex items-center space-x-3 mb-6">
                <Users size={40} className="text-secondary" />
                <h2 className="font-serif text-3xl font-semibold text-primary">
                  School Board of Directors
                </h2>
              </div>

              <p className="text-lg text-muted-foreground mb-6">
                {data.board?.description}
              </p>

              <ul className="space-y-3 text-muted-foreground">
                {data.board?.responsibilities?.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Management */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border border-primary/5">
              <div className="flex items-center space-x-3 mb-6">
                <Network size={40} className="text-secondary" />
                <h2 className="font-serif text-3xl font-semibold text-primary">
                  School Management Committee
                </h2>
              </div>

              <p className="text-lg text-muted-foreground mb-6">
                {data.management?.description}
              </p>

              <ul className="space-y-3 text-muted-foreground">
                {data.management?.functions?.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-secondary mr-3 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Head Teacher */}
          <div className="bg-primary text-white rounded-2xl p-10 shadow-lg mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <GraduationCap size={48} className="text-secondary" />
              <h2 className="font-serif text-3xl font-semibold">
                Head Teacher's Leadership
              </h2>
            </div>

            <p className="text-lg text-white/95 mb-6">
              {data.headTeacher?.description}
            </p>

            <ul className="space-y-2 text-white/90">
              {data.headTeacher?.responsibilities?.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Governance;
