// frontend/src/pages/admin/AdminBlog.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, publicApi } from '../../utils/api';

// ─── Form ─────────────────────────────────────────────────────
const BlogPostForm = ({ formData, editingPost, onChange, onSubmit, onCancel }) => (
  <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
    <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
      {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
    </h2>

    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <input 
          name="title" 
          value={formData.title} 
          onChange={onChange} 
          required 
          placeholder="Enter blog title"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Excerpt *</label>
        <textarea 
          name="excerpt" 
          value={formData.excerpt} 
          onChange={onChange} 
          required 
          placeholder="Brief summary of the post"
          rows="2"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Content *</label>
        <textarea 
          name="content" 
          value={formData.content} 
          onChange={onChange} 
          required 
          rows="8"
          placeholder="Full blog content (supports Markdown/HTML)"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Image URL</label>
        <input 
          name="imageUrl" 
          value={formData.imageUrl} 
          onChange={onChange}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {formData.imageUrl && (
          <img src={formData.imageUrl} alt="Preview" className="mt-2 h-32 object-cover rounded" />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Publish Date *</label>
        <input 
          type="date" 
          name="publishDate" 
          value={formData.publishDate} 
          onChange={onChange} 
          required
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div className="flex gap-4">
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition">
          {editingPost ? 'Update Post' : 'Create Post'}
        </button>

        <button type="button" onClick={onCancel} className="border px-6 py-2 rounded-full hover:bg-gray-50 transition">
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
        // Update existing post
        await adminApi.updateBlog(editingPost._id || editingPost.id, formData);
        toast.success('Blog post updated successfully! ✅');
      } else {
        // Create new post
        await adminApi.createBlog(formData);
        toast.success('Blog post created successfully! ✅');
      }

      await loadPosts(); // Refresh the list
      resetForm(); // Clear form
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
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-white p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="hover:opacity-80 transition">
            <ArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold">Manage Blog</h1>
        </div>

        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="bg-secondary text-primary px-4 py-2 rounded-full flex items-center gap-2 hover:bg-secondary/90 transition"
          disabled={loading}
        >
          <Plus size={18} /> New Post
        </button>
      </div>

      <div className="p-8 max-w-5xl mx-auto">
        {loading && !showForm && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        )}

        {showForm && (
          <BlogPostForm
            formData={formData}
            editingPost={editingPost}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        )}

        {!loading && posts.length === 0 && !showForm && (
          <div className="text-center py-20">
            <FileText size={50} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No blog posts yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition"
            >
              Create Your First Post
            </button>
          </div>
        )}

        {posts.length > 0 && (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post._id || post.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {post.imageUrl && (
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="h-40 w-full object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-xl font-bold text-primary mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-2">{post.excerpt}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>📅 {formatDate(post.publishDate)}</span>
                      <span>🕒 {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => handleEdit(post)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(post)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
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
