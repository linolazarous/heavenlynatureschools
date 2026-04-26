import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

// ✅ Pull from environment
const DEFAULT_ADMIN_EMAIL =
  process.env.REACT_APP_ADMIN_EMAIL || 'admin@heavenlynature.com';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();

  // ✅ Pre-fill email from env
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/admin');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);

      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
      setIsSubmitting(false);
    }
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-primary mb-2">
              Admin Login
            </h1>
            <p className="text-muted-foreground">
              Heavenly Nature Schools Administration
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={DEFAULT_ADMIN_EMAIL}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-medium transition-all disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-sm text-muted-foreground text-center mt-6">
            Authorized personnel only
          </p>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
