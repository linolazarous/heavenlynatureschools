// src/pages/admin/ManageAdmins.js
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Edit, Power, Shield, 
  Mail, Calendar, Check, X, ArrowLeft,
  UserPlus, UserCheck, UserX, Trash2
} from 'lucide-react';

const ManageAdmins = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'admin',
    permissions: {
      can_manage_admins: false,
      can_manage_products: true,
      can_manage_orders: true,
      can_manage_users: false,
      can_manage_content: true,
      can_view_analytics: true,
      can_manage_settings: false
    }
  });

  useEffect(() => {
    // Check if super admin
    if (!adminApi.isSuperAdmin()) {
      toast.error('Only super admins can manage admin accounts');
      navigate('/admin');
      return;
    }
    fetchAdmins();
  }, [navigate]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAdmins();
      // ✅ Handle both response formats
      const adminsList = response.admins || response.data?.admins || [];
      setAdmins(Array.isArray(adminsList) ? adminsList : []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error(error.message || 'Failed to fetch admins');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingAdmin) {
        // Remove password if editing (optional update)
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await adminApi.updateAdmin(editingAdmin.id, updateData);
        toast.success('Admin updated successfully');
      } else {
        await adminApi.createAdmin(formData);
        toast.success('Admin created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      console.error('Error saving admin:', error);
      // ✅ Handle error message properly for your API structure
      const message = error.message || 'Operation failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    const action = admin.is_active ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} ${admin.full_name}?`)) {
      try {
        await adminApi.toggleAdminStatus(admin.id);
        toast.success(`Admin ${action}d successfully`);
        fetchAdmins();
      } catch (error) {
        console.error('Error toggling status:', error);
        toast.error(error.message || 'Failed to update admin status');
      }
    }
  };

  const handleDelete = async (admin) => {
    if (window.confirm(`Are you sure you want to permanently delete ${admin.full_name}? This action cannot be undone.`)) {
      try {
        await adminApi.deleteAdmin(admin.id);
        toast.success('Admin deleted successfully');
        fetchAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
        toast.error(error.message || 'Failed to delete admin');
      }
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      email: admin.email,
      password: '',
      full_name: admin.full_name || admin.name,
      role: admin.role,
      permissions: { 
        can_manage_admins: admin.permissions?.can_manage_admins || false,
        can_manage_products: admin.permissions?.can_manage_products ?? true,
        can_manage_orders: admin.permissions?.can_manage_orders ?? true,
        can_manage_users: admin.permissions?.can_manage_users || false,
        can_manage_content: admin.permissions?.can_manage_content ?? true,
        can_view_analytics: admin.permissions?.can_view_analytics ?? true,
        can_manage_settings: admin.permissions?.can_manage_settings || false
      }
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'admin',
      permissions: {
        can_manage_admins: false,
        can_manage_products: true,
        can_manage_orders: true,
        can_manage_users: false,
        can_manage_content: true,
        can_view_analytics: true,
        can_manage_settings: false
      }
    });
    setEditingAdmin(null);
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  // ✅ Get current admin ID to prevent self-modification
  const currentAdmin = adminApi.getCurrentAdmin();

  if (!adminApi.isSuperAdmin()) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-gray-900">
                Admin Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage administrator accounts and permissions
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 whitespace-nowrap"
            >
              <UserPlus size={20} />
              Add New Admin
            </button>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {admins.filter(a => a.is_active).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Shield className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Super Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {admins.filter(a => a.role === 'super_admin').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admins Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No admin accounts found</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="mt-4 text-primary hover:underline"
            >
              Add your first admin
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.map((admin) => {
                    const isCurrentAdmin = admin.email === currentAdmin?.email;
                    
                    return (
                      <tr key={admin.id || admin._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {(admin.full_name || admin.name || 'A').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 flex items-center gap-2">
                                {admin.full_name || admin.name}
                                {isCurrentAdmin && (
                                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail size={14} />
                                {admin.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            admin.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-700'
                              : admin.role === 'admin'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {admin.role?.replace('_', ' ').toUpperCase() || 'ADMIN'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 text-sm font-medium ${
                            admin.is_active ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {admin.is_active ? (
                              <Check size={16} />
                            ) : (
                              <X size={16} />
                            )}
                            {admin.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {admin.last_login 
                              ? new Date(admin.last_login).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'Never'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(admin)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit Admin"
                            >
                              <Edit size={18} />
                            </button>
                            {/* Don't show toggle/delete for current admin or other super admins */}
                            {!isCurrentAdmin && admin.role !== 'super_admin' && (
                              <>
                                <button
                                  onClick={() => handleToggleStatus(admin)}
                                  className={`p-2 rounded-lg transition ${
                                    admin.is_active
                                      ? 'text-red-600 hover:bg-red-50'
                                      : 'text-green-600 hover:bg-green-50'
                                  }`}
                                  title={admin.is_active ? 'Deactivate' : 'Activate'}
                                >
                                  <Power size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(admin)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete Admin"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Admin Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="admin@example.com"
                    disabled={!!editingAdmin}
                  />
                  {editingAdmin && (
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password {editingAdmin && '(Leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    required={!editingAdmin}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder={editingAdmin ? 'Enter new password (optional)' : 'Enter password'}
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Permissions
                  </label>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    {Object.entries(formData.permissions).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handlePermissionChange(key)}
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">
                          {key.replace(/can_/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {editingAdmin ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : (
                      editingAdmin ? 'Update Admin' : 'Create Admin'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAdmins;
