import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

// ─── Form ─────────────────────────────────────────────────────
const BlogPostForm = ({ formData, editingPost, onChange, onSubmit, onCancel }) => (
  <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
    <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
      {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
    </h2>

    <form onSubmit={onSubmit} className="space-y-6">
      <input name="title" value={formData.title} onChange={onChange} required placeholder="Title"
        className="w-full px-4 py-3 border rounded-lg" />

      <textarea name="excerpt" value={formData.excerpt} onChange={onChange} required placeholder="Excerpt"
        className="w-full px-4 py-3 border rounded-lg" />

      <textarea name="content" value={formData.content} onChange={onChange} required rows="8"
        placeholder="Content"
        className="w-full px-4 py-3 border rounded-lg" />

      <input name="imageUrl" value={formData.imageUrl} onChange={onChange}
        placeholder="Image URL"
        className="w-full px-4 py-3 border rounded-lg" />

      <input type="date" name="publishDate" value={formData.publishDate} onChange={onChange} required
        className="w-full px-4 py-3 border rounded-lg" />

      <div className="flex gap-4">
        <button className="bg-primary text-white px-6 py-2 rounded-full">
          {editingPost ? 'Update' : 'Create'}
        </button>

        <button type="button" onClick={onCancel} className="border px-6 py-2 rounded-full">
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

  const emptyForm = {
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    publishDate: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(emptyForm);

  // ✅ Load posts
  const loadPosts = useCallback(async () => {
    try {
      const data = await apiFetch('/api/blog');
      setPosts(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load posts');
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

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPost) {
        await apiFetch(`/api/admin/blog/${editingPost.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        toast.success('Post updated');
      } else {
        await apiFetch('/api/admin/blog', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toast.success('Post created');
      }

      await loadPosts(); // 🔄 always sync with backend
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
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
      publishDate: post.publishDate,
    });
    setShowForm(true);
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;

    try {
      await apiFetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      toast.success('Deleted');

      await loadPosts();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // ✅ Change handler
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Date format
  const formatDate = (d) =>
    new Date(d).toLocaleDateString();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-white p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/admin"><ArrowLeft /></Link>
          <h1 className="text-2xl font-bold">Manage Blog</h1>
        </div>

        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="bg-secondary text-primary px-4 py-2 rounded-full flex items-center gap-2"
        >
          <Plus /> New Post
        </button>
      </div>

      <div className="p-8 max-w-5xl mx-auto">

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
          <div className="text-center py-20">
            <FileText size={50} className="mx-auto mb-4" />
            <p>No posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white p-6 rounded-xl shadow flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <small>{formatDate(post.publishDate)}</small>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleEdit(post)}><Edit /></button>
                  <button onClick={() => handleDelete(post.id)}><Trash2 /></button>
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
