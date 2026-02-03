// frontend/src/pages/admin/AdminBlog.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const AdminBlog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    publishDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/blog');
      setPosts(response.data || []);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to load blog posts';
      console.error('Fetch error:', err);
      toast.error(msg);
      setError(msg);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        publishDate: new Date(formData.publishDate).toISOString(),
      };

      if (editingPost) {
        await api.put(`/blog/${editingPost.id}`, payload);
        toast.success('Blog post updated');
      } else {
        await api.post('/blog', payload);
        toast.success('Blog post created');
      }

      setShowForm(false);
      setEditingPost(null);
      resetForm();
      fetchPosts();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save blog post';
      toast.error(msg);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/admin/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      imageUrl: post.imageUrl || '',
      publishDate: post.publishDate
        ? new Date(post.publishDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post permanently?')) return;

    // Optimistic update
    const oldPosts = [...posts];
    setPosts(posts.filter((p) => p.id !== id));

    try {
      await api.delete(`/blog/${id}`);
      toast.success('Blog post deleted');
    } catch (err) {
      toast.error('Failed to delete post');
      setPosts(oldPosts); // rollback
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/admin/login');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      publishDate: new Date().toISOString().split('T')[0],
    });
    setEditingPost(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-blog-page">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="hover:text-white/80 transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex items-center space-x-3">
              <FileText size={32} />
              <h1 className="font-serif text-2xl font-bold">Manage Blog</h1>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={showForm}
            className="flex items-center space-x-2 bg-white text-primary hover:bg-white/90 px-5 py-2.5 rounded-full font-medium transition-colors disabled:opacity-50"
          >
            <Plus size={20} />
            <span>New Post</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-8 text-center">
            {error}
            <button
              onClick={fetchPosts}
              className="ml-3 underline hover:no-underline font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-gray-100">
            <h2 className="font-serif text-2xl font-bold text-primary mb-8">
              {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-full font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  {editingPost ? 'Update Post' : 'Publish Post'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-full font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FileText size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No blog posts yet</h3>
            <p className="text-gray-500">Create your first post using the button above.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-primary mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Published: {formatDate(post.publishDate)}
                  </p>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlog;
