import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const AdminBlog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    publishDate: new Date().toISOString().split('T')[0],
  });

  // Load posts from API
  useEffect(() => {
    if (window.netlifyIdentity) {
      const currentUser = window.netlifyIdentity.currentUser();
      if (!currentUser) {
        navigate('/admin/login');
      }
    }
    fetchPosts();
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/blog'); // GET /api/blog
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to load blog posts', error);
      toast.error('Failed to load blog posts');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPost) {
        await api.put(`/blog/${editingPost.id}`, formData); // PUT /api/blog/:id
        toast.success('Blog post updated successfully');
      } else {
        await api.post('/blog', formData); // POST /api/blog
        toast.success('Blog post created successfully');
      }

      fetchPosts();
      setShowForm(false);
      setEditingPost(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        imageUrl: '',
        publishDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Blog save failed', error);
      toast.error('Failed to save blog post');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl,
      publishDate: post.publishDate,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/blog/${id}`); // DELETE /api/blog/:id
      toast.success('Blog post deleted');
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete blog post', error);
      toast.error('Failed to delete blog post');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="admin-blog-page">
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
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
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-secondary text-primary hover:bg-secondary/90 px-4 py-2 rounded-full transition-colors"
            data-testid="add-blog-btn"
          >
            <Plus size={20} />
            <span>New Post</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showForm && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8" data-testid="blog-form">
            <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
              {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {['title', 'excerpt', 'content', 'imageUrl', 'publishDate'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-primary mb-2">{field === 'imageUrl' ? 'Image URL' : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {field === 'excerpt' || field === 'content' ? (
                    <textarea
                      name={field}
                      required={field !== 'imageUrl'}
                      rows={field === 'excerpt' ? 2 : 10}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                      data-testid={`blog-${field}-input`}
                    />
                  ) : (
                    <input
                      type={field === 'publishDate' ? 'date' : 'text'}
                      name={field}
                      required={field !== 'imageUrl'}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                      data-testid={`blog-${field}-input`}
                    />
                  )}
                </div>
              ))}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-3 font-medium transition-colors"
                  data-testid="blog-submit-btn"
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPost(null);
                    setFormData({
                      title: '',
                      excerpt: '',
                      content: '',
                      imageUrl: '',
                      publishDate: new Date().toISOString().split('T')[0],
                    });
                  }}
                  className="border border-gray-300 text-muted-foreground hover:bg-gray-50 rounded-full px-8 py-3 font-medium transition-colors"
                  data-testid="blog-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl" data-testid="no-posts">
            <FileText size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No blog posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl p-6 shadow-lg flex justify-between items-start"
                data-testid={`blog-post-${post.id}`}
              >
                <div className="flex-1">
                  <h3 className="font-serif text-2xl font-semibold text-primary mb-2">{post.title}</h3>
                  <p className="text-muted-foreground mb-2">{post.excerpt}</p>
                  <p className="text-sm text-muted-foreground">Published: {formatDate(post.publishDate)}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                    data-testid={`edit-blog-${post.id}`}
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                    data-testid={`delete-blog-${post.id}`}
                  >
                    <Trash2 size={20} />
                  </button>
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
