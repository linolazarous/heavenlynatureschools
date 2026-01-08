import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

const Blog = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const storedPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    setPosts(storedPosts);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-24" data-testid="blog-page">
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
              Our Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stories, updates, and insights from Heavenly Nature Schools
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20" data-testid="blog-empty-state">
              <p className="text-xl text-muted-foreground mb-8">
                No blog posts yet. Check back soon for updates!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  data-testid={`blog-post-${post.id}`}
                >
                  {post.imageUrl && (
                    <div className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                      style={{ backgroundImage: `url(${post.imageUrl})` }}
                    ></div>
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
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
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
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;