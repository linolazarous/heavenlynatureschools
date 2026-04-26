import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import DOMPurify from 'dompurify';
import SEO from '../components/SEO';

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const API_URL = process.env.REACT_APP_BACKEND_URL;
    fetch(`${API_URL}/api/blog/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) { setNotFound(true); return null; }
        return res.json();
      })
      .then(data => { if (data) setPost(data); })
      .catch(() => setNotFound(true));
    // id is the only external dep; API_URL and state setters are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Sanitize HTML to prevent XSS before rendering
  const sanitizedContent = useMemo(
    () => ({ __html: DOMPurify.sanitize(post?.content || '') }),
    [post?.content]
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (notFound) {
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

  if (!post) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24" data-testid="blog-post-page">
      <SEO
        path={`/blog/${id}`}
        title={post.title}
        description={post.excerpt || post.title}
      />
      <article className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-8"
            data-testid="back-to-blog-btn">
            <ArrowLeft className="mr-2" size={20} />
            Back to Blog
          </Link>

          {post.imageUrl && (
            <img src={post.imageUrl} alt={post.title}
              className="w-full h-96 object-cover rounded-2xl mb-8 shadow-lg" />
          )}

          <div className="flex items-center text-muted-foreground mb-6">
            <Calendar size={20} className="mr-2" />
            {formatDate(post.publishDate)}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-8">{post.title}</h1>

          {/* sanitizedContent is the DOMPurify-sanitized output, memoized on post.content.
              dangerouslySetInnerHTML receives { __html: DOMPurify.sanitize(...) } — XSS-safe. */}
          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={sanitizedContent} />
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
