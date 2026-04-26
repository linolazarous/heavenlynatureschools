// frontend/src/pages/BlogPost.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Clock, Share2, Heart, Bookmark, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { publicApi } from '../utils/api';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // ✅ Load blog post with useCallback to prevent recreation
  const loadBlogPost = useCallback(async () => {
    setLoading(true);
    try {
      const data = await publicApi.getBlog(id);
      if (!data) {
        setNotFound(true);
      } else {
        setPost(data);
      }
    } catch (err) {
      console.error('Failed to load blog post:', err);
      if (err.message === '404' || err.message.includes('not found')) {
        setNotFound(true);
      } else {
        toast.error('Failed to load blog post');
      }
    } finally {
      setLoading(false);
    }
  }, [id]); // ✅ Add id as dependency

  // ✅ Load post and check localStorage
  useEffect(() => {
    loadBlogPost();
    // Check local storage for liked/saved status
    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
    const savedPosts = JSON.parse(localStorage.getItem('saved_posts') || '[]');
    setLiked(likedPosts.includes(id));
    setSaved(savedPosts.includes(id));
  }, [id, loadBlogPost]); // ✅ Add loadBlogPost as dependency

  // Sanitize HTML to prevent XSS before rendering
  const sanitizedContent = useMemo(
    () => ({ __html: DOMPurify.sanitize(post?.content || '') }),
    [post?.content]
  );

  // Calculate read time
  const calculateReadTime = useCallback((content) => {
    if (!content) return '3 min read';
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    return `${readTime} min read`;
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Date TBD';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);

  // Handle share functionality
  const handleShare = useCallback((platform) => {
    const url = window.location.href;
    const title = encodeURIComponent(post.title);
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${title}`,
      email: `mailto:?subject=${title}&body=Check out this article: ${url}`
    };
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  }, [post?.title]);

  // Handle like
  const handleLike = useCallback(() => {
    const newLiked = !liked;
    setLiked(newLiked);
    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
    if (newLiked) {
      likedPosts.push(id);
      toast.success('Thanks for liking! ❤️');
    } else {
      const index = likedPosts.indexOf(id);
      if (index > -1) likedPosts.splice(index, 1);
    }
    localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
  }, [liked, id]);

  // Handle save for later
  const handleSave = useCallback(() => {
    const newSaved = !saved;
    setSaved(newSaved);
    const savedPosts = JSON.parse(localStorage.getItem('saved_posts') || '[]');
    if (newSaved) {
      savedPosts.push(id);
      toast.success('Saved to reading list! 📚');
    } else {
      const index = savedPosts.indexOf(id);
      if (index > -1) savedPosts.splice(index, 1);
      toast.info('Removed from reading list');
    }
    localStorage.setItem('saved_posts', JSON.stringify(savedPosts));
  }, [saved, id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-4">Loading article...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center" data-testid="blog-post-not-found">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-gray-400 mb-6">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-primary mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/blog')}
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition"
              data-testid="back-to-blog-link"
            >
              Browse All Articles
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-gray-50 to-white" data-testid="blog-post-page">
      <SEO
        path={`/blog/${id}`}
        title={`${post.title} | Heavenly Nature Schools Blog`}
        description={post.excerpt || post.content?.substring(0, 160) || post.title}
        keywords="school news, education, Heavenly Nature Schools, blog post"
      />
      
      <article>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-primary to-primary/90 text-white py-16">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-white/90 hover:text-white mb-6 transition"
              data-testid="back-to-blog-btn"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Blog
            </Link>
            
            {post.imageUrl && (
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl mb-8"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/1200x600?text=Blog+Post';
                }}
              />
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mb-4">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                {formatDate(post.publishDate)}
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                {calculateReadTime(post.content)}
              </div>
            </div>
            
            <h1 className="font-serif text-3xl md:text-5xl font-bold mb-6">
              {post.title}
            </h1>
            
            <p className="text-xl text-white/90">
              {post.excerpt || post.content?.substring(0, 150) + '...'}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                    liked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart size={18} className={liked ? 'fill-red-500' : ''} />
                  <span>{liked ? 'Liked' : 'Like'}</span>
                </button>
                
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                    saved ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark size={18} className={saved ? 'fill-blue-500' : ''} />
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  >
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                  
                  {showShareMenu && (
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border p-2 z-10 min-w-[200px]">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      >
                        <Facebook size={16} className="text-blue-600" />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      >
                        <Twitter size={16} className="text-blue-400" />
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      >
                        <Linkedin size={16} className="text-blue-700" />
                        LinkedIn
                      </button>
                      <button
                        onClick={() => handleShare('email')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      >
                        <Mail size={16} className="text-gray-600" />
                        Email
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      >
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Blog Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-primary prose-img:rounded-xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={sanitizedContent}
            />
            
            {/* Author/Call to Action Section */}
            <div className="mt-12 pt-8 border-t">
              <div className="bg-primary/5 rounded-2xl p-8 text-center">
                <h3 className="font-serif text-2xl font-bold text-primary mb-3">
                  Enjoyed this article?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Subscribe to our newsletter to receive more updates and stories from Heavenly Nature Schools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/contact"
                    className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition"
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/blog"
                    className="border border-primary text-primary px-6 py-2 rounded-full hover:bg-primary/10 transition"
                  >
                    More Articles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
