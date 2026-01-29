import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!window.netlifyIdentity) {
      setLoading(false);
      return;
    }

    const currentUser = window.netlifyIdentity.currentUser();
    setUser(currentUser);
    setLoading(false);

    const onLogout = () => setUser(null);
    window.netlifyIdentity.on('logout', onLogout);

    return () => window.netlifyIdentity.off('logout', onLogout);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/admin/login" />;

  return children;
};

export default AdminRoute;
