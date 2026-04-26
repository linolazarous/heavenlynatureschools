import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/admin');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" data-testid="admin-login-page">
      <div className="max-w-md w-full px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-primary mb-2">Admin Login</h1>
            <p className="text-muted-foreground">Heavenly Nature Schools Administration</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="admin-login-form">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-primary mb-1">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@heavenlynature.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                data-testid="admin-email-input"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-primary mb-1">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                data-testid="admin-password-input"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 disabled:opacity-60"
              data-testid="admin-login-btn"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">Authorized personnel only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
