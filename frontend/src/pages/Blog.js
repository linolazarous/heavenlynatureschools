import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.REACT_APP_BACKEND_URL;
    fetch(`${API_URL}/api/blog`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
    // API_URL is a static env constant; state setters are stable React references
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      );
    }
    if (posts.length === 0) {
      return (
        <div className="text-center py-20" data-testid="blog-empty-state">
          <p className="text-xl text-muted-foreground mb-8">
            No blog posts yet. Check back soon for updates!
          </p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            data-testid={`blog-post-${post.id}`}
          >
            {post.imageUrl && (
              <div className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                style={{ backgroundImage: `url(${post.imageUrl})` }}></div>
            )}
            <div className="p-6">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  {formatDate(post.publishDate)}
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  5 min read
                </div>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-primary mb-3 group-hover:text-primary/80 transition-colors">
                {post.title}
              </h2>
              <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
              <Link
                to={`/blog/${post.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                data-testid={`blog-read-more-${post.id}`}
              >
                Read More
                <ArrowRight className="ml-2" size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24" data-testid="blog-page">
      <SEO
        path="/blog"
        title="Blog"
        description="News, stories, and insights from Heavenly Nature Nursery &amp; Primary School — updates from our classrooms and community in Juba City, South Sudan."
      />
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">Our Blog</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stories, updates, and insights from Heavenly Nature Schools
            </p>
          </div>
          {renderContent()}
        </div>
      </section>
    </div>
  );
};

export default Blog;
