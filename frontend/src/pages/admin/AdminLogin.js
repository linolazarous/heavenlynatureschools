import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on('init', user => {
        setIsLoading(false);
        if (user) {
          navigate('/admin');
        }
      });

      window.netlifyIdentity.on('login', () => {
        navigate('/admin');
      });
    }
  }, [navigate]);

  const handleLogin = () => {
    if (window.netlifyIdentify) {
      window.netlifyIdentity.open();
    } else {
      toast.error('Authentication service not available');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
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
            <h1 className="font-serif text-3xl font-bold text-primary mb-2">
              Admin Login
            </h1>
            <p className="text-muted-foreground">
              Heavenly Nature Schools Administration
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-medium transition-all duration-300"
            data-testid="admin-login-btn"
          >
            Login with Netlify Identity
          </button>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;