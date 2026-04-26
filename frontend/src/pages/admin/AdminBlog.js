import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

// ─── Form sub-component ───────────────────────────────────────────────────────

const BlogPostForm = ({ formData, editingPost, onChange, onSubmit, onCancel }) => (
  <div className="bg-white rounded-2xl p-8 shadow-lg mb-8" data-testid="blog-form">
    <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
      {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
    </h2>
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-primary mb-2">Title *</label>
        <input type="text" name="title" required value={formData.title} onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
          data-testid="blog-title-input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">Excerpt *</label>
        <textarea name="excerpt" required rows="2" value={formData.excerpt} onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
          data-testid="blog-excerpt-input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">Content *</label>
        <textarea name="content" required rows="10" value={formData.content} onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
          data-testid="blog-content-input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">Image URL</label>
        <input type="url" name="imageUrl" value={formData.imageUrl} onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
          data-testid="blog-image-input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">Publish Date *</label>
        <input type="date" name="publishDate" required value={formData.publishDate} onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
          data-testid="blog-date-input" />
      </div>
      <div className="flex space-x-4">
        <button type="submit"
          className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-3 font-medium transition-colors"
          data-testid="blog-submit-btn">
          {editingPost ? 'Update Post' : 'Create Post'}
        </button>
        <button type="button" onClick={onCancel}
          className="border border-gray-300 text-muted-foreground hover:bg-gray-50 rounded-full px-8 py-3 font-medium transition-colors"
          data-testid="blog-cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  </div>
);

// ─── Post list item ───────────────────────────────────────────────────────────

const PostListItem = ({ post, onEdit, onDelete, formatDate }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg flex justify-between items-start"
    data-testid={`blog-post-${post.id}`}>
    <div className="flex-1">
      <h3 className="font-serif text-2xl font-semibold text-primary mb-2">{post.title}</h3>
      <p className="text-muted-foreground mb-2">{post.excerpt}</p>
      <p className="text-sm text-muted-foreground">Published: {formatDate(post.publishDate)}</p>
    </div>
    <div className="flex space-x-2 ml-4">
      <button onClick={() => onEdit(post)}
        className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
        data-testid={`edit-blog-${post.id}`}>
        <Edit size={20} />
      </button>
      <button onClick={() => onDelete(post.id)}
        className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
        data-testid={`delete-blog-${post.id}`}>
        <Trash2 size={20} />
      </button>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  imageUrl: '',
  publishDate: new Date().toISOString().split('T')[0],
};

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    apiFetch('/api/blog')
      .then(data => setPosts(data))
      .catch(() => toast.error('Failed to load blog posts'));
    // apiFetch is a stable module import; state setters are stable React references
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => { setShowForm(false); setEditingPost(null); setFormData(emptyForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPost) {
        const updated = await apiFetch(`/api/admin/blog/${editingPost.id}`, {
          method: 'PUT', body: JSON.stringify(formData),
        });
        setPosts(prev => prev.map(p => p.id === editingPost.id ? updated : p));
        toast.success('Blog post updated successfully');
      } else {
        const created = await apiFetch('/api/admin/blog', {
          method: 'POST', body: JSON.stringify(formData),
        });
        setPosts(prev => [created, ...prev]);
        toast.success('Blog post created successfully');
      }
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save post');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({ title: post.title, excerpt: post.excerpt, content: post.content,
      imageUrl: post.imageUrl || '', publishDate: post.publishDate });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiFetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Blog post deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background" data-testid="admin-blog-page">
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="hover:text-white/80" data-testid="back-to-dashboard">
                <ArrowLeft size={24} />
              </Link>
              <div className="flex items-center space-x-3">
                <FileText size={32} />
                <h1 className="font-serif text-2xl font-bold">Manage Blog</h1>
              </div>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setEditingPost(null); setFormData(emptyForm); }}
              className="flex items-center space-x-2 bg-secondary text-primary hover:bg-secondary/90 px-4 py-2 rounded-full transition-colors"
              data-testid="add-blog-btn"
            >
              <Plus size={20} />
              <span>New Post</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showForm && (
          <BlogPostForm
            formData={formData}
            editingPost={editingPost}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        )}

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl" data-testid="no-posts">
            <FileText size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No blog posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostListItem
                key={post.id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlog;
