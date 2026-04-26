// frontend/src/layouts/AdminLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNav from '../components/AdminNav';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <AdminNav />
      <Outlet />
    </div>
  );
};

export default AdminLayout;
