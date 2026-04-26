// frontend/src/pages/Blog.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, User, Tag, Share2, Eye } from 'lucide-react';
import SEO from '../components/SEO';
import { publicApi } from '../utils/api';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the publicApi from your api.js
      const data = await publicApi.getBlogs();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load blog posts:', err);
      setError(err.message || 'Failed to load blog posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate read time (approx 200 words per minute)
  const calculateReadTime = (content) => {
    if (!content) return '3 min read';
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    return `${readTime} min read`;
  };

  // Truncate text
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-4">Loading posts...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20" data-testid="blog-error-state">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={loadBlogPosts}
            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="text-center py-20" data-testid="blog-empty-state">
          <div className="text-gray-400 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <p className="text-xl text-muted-foreground mb-4">
            No blog posts yet.
          </p>
          <p className="text-muted-foreground">
            Check back soon for updates and stories from our school community!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => {
          const postId = post._id || post.id;
          return (
            <article
              key={postId}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
              data-testid={`blog-post-${postId}`}
            >
              {/* Image Section */}
              {post.imageUrl && (
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x250?text=Blog+Image';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-primary text-white text-xs px-2 py-1 rounded-full">
                    Featured
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Meta Info */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    {formatDate(post.publishDate)}
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    {calculateReadTime(post.content)}
                  </div>
                </div>

                {/* Title */}
                <h2 className="font-serif text-2xl font-semibold text-primary mb-3 group-hover:text-primary/80 transition-colors line-clamp-2">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {truncateText(post.excerpt || post.content, 120)}
                </p>

                {/* Read More Link */}
                <Link
                  to={`/blog/${postId}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium group/link"
                  data-testid={`blog-read-more-${postId}`}
                >
                  Read More
                  <ArrowRight className="ml-2 group-hover/link:translate-x-1 transition-transform" size={16} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-gray-50 to-white" data-testid="blog-page">
      <SEO
        path="/blog"
        title="Blog | Heavenly Nature Schools"
        description="News, stories, and insights from Heavenly Nature Nursery &amp; Primary School — updates from our classrooms and community in Juba City, South Sudan."
        keywords="school blog, education news, student stories, Heavenly Nature Schools, Juba, South Sudan"
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/90 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Our Blog
          </h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Stories, updates, and insights from Heavenly Nature Schools
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </section>

      {/* Newsletter Section (Optional) */}
      {posts.length > 0 && (
        <section className="py-16 bg-primary/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-3xl font-bold text-primary mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter to receive the latest updates and stories
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Add newsletter signup logic here
                toast.success('Subscribed to newsletter!');
              }}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};

export default Blog;
