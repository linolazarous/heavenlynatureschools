// frontend/src/pages/admin/AdminVerification.js
import React, { useState, useEffect, useCallback } from 'react';
import { QrCode, Copy, CheckCircle2, RefreshCw, GraduationCap, FileText, Calendar, ExternalLink, Trash2, Link, X } from 'lucide-react';
import { toast } from 'sonner';

// Fallback UI components
const Button = ({ children, onClick, disabled, variant, size, className, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      variant === 'outline' ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' :
      variant === 'ghost' ? 'text-gray-400 hover:bg-gray-700 hover:text-white' :
      variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
      'bg-primary text-white hover:bg-primary/90'
    } ${className || ''}`}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className, ...props }) => (
  <input className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className || ''}`} {...props} />
);

const Label = ({ children, className }) => (
  <label className={`block text-sm font-medium text-gray-300 mb-1 ${className || ''}`}>{children}</label>
);

const Card = ({ children, className }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-xl ${className || ''}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="p-6 pb-0">{children}</div>;
const CardTitle = ({ children, className }) => <h3 className={`text-lg font-semibold text-white ${className || ''}`}>{children}</h3>;
const CardContent = ({ children, className }) => <div className={`p-6 ${className || ''}`}>{children}</div>;

const Badge = ({ children, variant, className }) => (
  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
    variant === 'success' ? 'bg-green-500/20 text-green-400' :
    variant === 'danger' ? 'bg-red-500/20 text-red-400' :
    variant === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
    variant === 'outline' ? 'border border-gray-500 text-gray-400' :
    'bg-primary/20 text-primary'
  } ${className || ''}`}>{children}</span>
);

// ─── Constants ─────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureschools.com';
const VERIFY_BASE = 'https://heavenlynatureschools.com/verify';

// ─── Confirmation Modal ────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, variant }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
          <Button onClick={onConfirm} variant={variant || 'danger'} className="flex-1">{confirmText}</Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────
const AdminVerification = () => {
  const [reportCardYear, setReportCardYear] = useState(new Date().getFullYear().toString());
  const [certificateYear, setCertificateYear] = useState(new Date().getFullYear().toString());
  const [certificateCount, setCertificateCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifications, setVerifications] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  
  // Custom date state
  const [reportCardDate, setReportCardDate] = useState(new Date().toISOString().split('T')[0]);
  const [certificateDate, setCertificateDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Delete confirmation
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: '' });

  // ✅ Fetch existing verifications
  const fetchVerifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/api/admin/verifications`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVerifications(data.verifications || []);
      }
    } catch (err) {
      console.error('Failed to load verifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  // ✅ Generate Academic Report Card QR
  const handleGenerateReportCard = async () => {
    if (!reportCardYear || reportCardYear.length !== 4) {
      toast.error('Please enter a valid 4-digit year');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/api/admin/verifications/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'report_card',
          year: reportCardYear,
          custom_date: reportCardDate || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to generate');
      }

      const data = await res.json();
      toast.success(`Report Card verification created for ${reportCardYear}!`);
      fetchVerifications();
    } catch (err) {
      toast.error(err.message || 'Failed to generate verification');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Generate Certificate of Nursery Education QR
  const handleGenerateCertificate = async () => {
    if (!certificateYear || certificateYear.length !== 4) {
      toast.error('Please enter a valid 4-digit year');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/api/admin/verifications/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'certificate',
          year: certificateYear,
          count: certificateCount ? parseInt(certificateCount) : 0,
          custom_date: certificateDate || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to generate');
      }

      const data = await res.json();
      toast.success(`Certificate verification created for ${certificateYear}!`);
      setCertificateCount('');
      fetchVerifications();
    } catch (err) {
      toast.error(err.message || 'Failed to generate verification');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete verification
  const handleDelete = async () => {
    if (!deleteModal.id) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/api/admin/verifications/${deleteModal.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Verification deleted');
      fetchVerifications();
    } catch (err) {
      toast.error(err.message || 'Failed to delete verification');
    } finally {
      setDeleteModal({ isOpen: false, id: null, type: '' });
    }
  };

  // ✅ Copy verify URL
  const copyUrl = (verifyId) => {
    const url = `${VERIFY_BASE}/${verifyId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(verifyId);
      toast.success('Verification link copied!');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // ✅ Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // ✅ Get type label and icon
  const getTypeInfo = (type) => {
    if (type === 'report_card') {
      return { 
        label: 'Academic Report Card (ARC)', 
        shortLabel: 'Report Card',
        icon: <FileText className="h-5 w-5" />, 
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
      };
    }
    return { 
      label: 'Certificate of Nursery Education', 
      shortLabel: 'Certificate',
      icon: <GraduationCap className="h-5 w-5" />, 
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <QrCode className="h-6 w-6 text-accent" />
          Verification QR Codes
        </h2>
        <Button onClick={fetchVerifications} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Report Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Academic Report Card (ARC)
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">
              Create verification link for annual academic report cards
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Academic Year *</Label>
              <Input
                type="text"
                value={reportCardYear}
                onChange={(e) => setReportCardYear(e.target.value)}
                placeholder="e.g., 2026"
                className="font-mono"
                maxLength={4}
              />
              <p className="text-gray-500 text-xs mt-1">
                Format: YYYY (e.g., 2026 for 2026 academic year)
              </p>
            </div>
            <div>
              <Label>Issue Date (Optional)</Label>
              <Input
                type="date"
                value={reportCardDate}
                onChange={(e) => setReportCardDate(e.target.value)}
              />
              <p className="text-gray-500 text-xs mt-1">
                Custom date for this verification (defaults to today)
              </p>
            </div>
            <Button
              onClick={handleGenerateReportCard}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Report Card Verification'}
            </Button>
          </CardContent>
        </Card>

        {/* Certificate of Nursery Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-400" />
              Certificate of Nursery Education
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">
              Create verification link for Top Class graduation certificates
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Graduation Year *</Label>
              <Input
                type="text"
                value={certificateYear}
                onChange={(e) => setCertificateYear(e.target.value)}
                placeholder="e.g., 2026"
                className="font-mono"
                maxLength={4}
              />
              <p className="text-gray-500 text-xs mt-1">
                Format: YYYY (e.g., 2026 for 2026 graduates)
              </p>
            </div>
            <div>
              <Label>Number of Certificates (Optional)</Label>
              <Input
                type="number"
                value={certificateCount}
                onChange={(e) => setCertificateCount(e.target.value)}
                placeholder="e.g., 25"
                min={0}
              />
              <p className="text-gray-500 text-xs mt-1">
                For tracking how many certificates issued
              </p>
            </div>
            <div>
              <Label>Issue Date (Optional)</Label>
              <Input
                type="date"
                value={certificateDate}
                onChange={(e) => setCertificateDate(e.target.value)}
              />
              <p className="text-gray-500 text-xs mt-1">
                Custom date for this verification (defaults to today)
              </p>
            </div>
            <Button
              onClick={handleGenerateCertificate}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Link className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Certificate Verification'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generated Verification Links List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-accent" />
              Verification Links
              <Badge variant="outline">{verifications.length}</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className="text-center py-12">
              <Link className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No verification links created yet</p>
              <p className="text-gray-500 text-sm mt-1">Create one from the options above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {verifications.map((v) => {
                const typeInfo = getTypeInfo(v.type);
                const verifyUrl = `${VERIFY_BASE}/${v.id}`;
                
                return (
                  <div 
                    key={v.id} 
                    className={`bg-gray-700/50 border rounded-lg p-4 ${v.is_active ? typeInfo.borderColor : 'border-gray-600 opacity-60'}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left - Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={typeInfo.color}>{typeInfo.icon}</span>
                          <span className={`font-semibold text-sm ${typeInfo.color}`}>
                            {typeInfo.shortLabel}
                          </span>
                          <Badge variant={v.is_active ? 'success' : 'danger'}>
                            {v.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Year: <span className="text-white font-medium">{v.year}</span>
                          </span>
                          {v.count > 0 && (
                            <span>📋 {v.count} issued</span>
                          )}
                          <span>Created: {formatDate(v.created_at)}</span>
                        </div>

                        {/* Verification Link */}
                        <div className="mt-2 flex items-center gap-2 bg-gray-900 rounded-lg p-2">
                          <code className="text-blue-400 text-xs break-all flex-1 font-mono">
                            {verifyUrl}
                          </code>
                          <button
                            onClick={() => copyUrl(v.id)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition flex-shrink-0"
                            title="Copy link"
                          >
                            {copiedId === v.id ? (
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Right - Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={verifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition"
                          title="Preview verification page"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: v.id, type: typeInfo.shortLabel })}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition"
                          title="Delete verification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, type: '' })}
        onConfirm={handleDelete}
        title="Delete Verification"
        message={`Are you sure you want to delete this ${deleteModal.type} verification? This will invalidate all QR codes and links using this verification. This action cannot be undone.`}
        confirmText="Delete Verification"
        variant="danger"
      />
    </div>
  );
};

export default AdminVerification;
