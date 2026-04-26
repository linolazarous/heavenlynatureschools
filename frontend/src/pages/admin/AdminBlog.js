// frontend/src/pages/admin/AdminBlog.js
import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, FileText, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, publicApi } from '../../utils/api';

// ─── Form ─────────────────────────────────────────────────────
const BlogPostForm = ({ formData, editingPost, onChange, onSubmit, onCancel, loading }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
    <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
      {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
    </h2>

    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
        <input 
          name="title" 
          value={formData.title} 
          onChange={onChange} 
          required 
          placeholder="Enter blog title"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Excerpt *</label>
        <textarea 
          name="excerpt" 
          value={formData.excerpt} 
          onChange={onChange} 
          required 
          placeholder="Brief summary of the post"
          rows="2"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content *</label>
        <textarea 
          name="content" 
          value={formData.content} 
          onChange={onChange} 
          required 
          rows="8"
          placeholder="Full blog content (supports HTML)"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
        <input 
          name="imageUrl" 
          value={formData.imageUrl} 
          onChange={onChange}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {formData.imageUrl && (
          <div className="mt-2">
            <img 
              src={formData.imageUrl} 
              alt="Preview" 
              className="h-32 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
              }}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Publish Date *</label>
        <input 
          type="date" 
          name="publishDate" 
          value={formData.publishDate} 
          onChange={onChange} 
          required
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="flex gap-4">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition disabled:opacity-50"
        >
          {editingPost ? 'Update Post' : 'Create Post'}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="border px-6 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
);

// ─── Main Component ───────────────────────────────────────────
const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    publishDate: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(emptyForm);

  // ✅ Load posts from MongoDB via backend
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await publicApi.getBlogs();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load posts error:', err);
      toast.error(err.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // ✅ Reset form
  const resetForm = () => {
    setFormData(emptyForm);
    setEditingPost(null);
    setShowForm(false);
  };

  // ✅ Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPost) {
        await adminApi.updateBlog(editingPost._id || editingPost.id, formData);
        toast.success('Blog post updated successfully! ✅');
      } else {
        await adminApi.createBlog(formData);
        toast.success('Blog post created successfully! ✅');
      }
      await loadPosts();
      resetForm();
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit
  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl || '',
      publishDate: post.publishDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Delete
  const handleDelete = async (post) => {
    const postId = post._id || post.id;
    if (!window.confirm(`Delete "${post.title}"? This action cannot be undone.`)) return;

    setLoading(true);
    try {
      await adminApi.deleteBlog(postId);
      toast.success('Blog post deleted successfully! 🗑️');
      await loadPosts();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete blog post');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refresh
  const handleRefresh = () => {
    loadPosts();
    toast.info('Refreshing blog posts...');
  };

  // ✅ Change handler
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Date format
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <FileText size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Blog</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create, edit, and manage your blog posts
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              
              <button
                onClick={() => { setShowForm(!showForm); resetForm(); }}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition"
                disabled={loading}
              >
                <Plus size={18} /> New Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !showForm && posts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading posts...</p>
          </div>
        ) : (
          <>
            {/* Form */}
            {showForm && (
              <BlogPostForm
                formData={formData}
                editingPost={editingPost}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={resetForm}
                loading={loading}
              />
            )}

            {/* Empty State */}
            {!loading && posts.length === 0 && !showForm && (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                <FileText size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">No blog posts yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition"
                >
                  Create Your First Post
                </button>
              </div>
            )}

            {/* Posts List */}
            {posts.length > 0 && (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div 
                    key={post._id || post.id} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
                  >
                    {post.imageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/800x400?text=Blog+Image';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-primary mb-2">{post.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>📅 {formatDate(post.publishDate)}</span>
                            <span>🕒 Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button 
                            onClick={() => handleEdit(post)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(post)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBlog;
