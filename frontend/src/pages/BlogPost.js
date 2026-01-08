import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const storedPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const foundPost = storedPosts.find(p => p.id === id);
    setPost(foundPost);
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!post) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center" data-testid="blog-post-not-found">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-primary mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-primary hover:underline" data-testid="back-to-blog-link">
            Return to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24" data-testid="blog-post-page">
      <article className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-8"
            data-testid="back-to-blog-btn"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Blog
          </Link>

          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-96 object-cover rounded-2xl mb-8 shadow-lg"
            />
          )}

          <div className="flex items-center text-muted-foreground mb-6">
            <Calendar size={20} className="mr-2" />
            {formatDate(post.publishDate)}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-8">
            {post.title}
          </h1>

          <div
            className="prose prose-lg max-w-none text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </div>
  );
};

export default BlogPost;