// frontend/src/pages/admin/AdminVerification.js
import React, { useState, useEffect, useCallback } from 'react';
import { QrCode, Download, Copy, CheckCircle2, RefreshCw, GraduationCap, FileText, Calendar, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

// Fallback UI components
const Button = ({ children, onClick, disabled, variant, size, className, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      variant === 'outline' ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' :
      variant === 'ghost' ? 'text-gray-400 hover:bg-gray-700 hover:text-white' :
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
    variant === 'outline' ? 'border border-gray-500 text-gray-400' :
    'bg-primary/20 text-primary'
  } ${className || ''}`}>{children}</span>
);

// ─── Constants ─────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureschools.com';
const VERIFY_BASE = 'https://heavenlynatureschools.com/verify';

// ─── Main Component ────────────────────────────────────────
const AdminVerification = () => {
  const [reportCardYear, setReportCardYear] = useState(new Date().getFullYear().toString());
  const [certificateYear, setCertificateYear] = useState(new Date().getFullYear().toString());
  const [certificateCount, setCertificateCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifications, setVerifications] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

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
    if (!reportCardYear) {
      toast.error('Please enter a year');
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
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to generate');
      }

      const data = await res.json();
      toast.success(`Report Card QR generated for ${reportCardYear}!`);
      fetchVerifications();
    } catch (err) {
      toast.error(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Generate Certificate of Nursery Education QR
  const handleGenerateCertificate = async () => {
    if (!certificateYear) {
      toast.error('Please enter a year');
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
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to generate');
      }

      const data = await res.json();
      toast.success(`Certificate QR generated for ${certificateYear}!`);
      setCertificateCount('');
      fetchVerifications();
    } catch (err) {
      toast.error(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
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
      return { label: 'Academic Report Card', icon: <FileText className="h-4 w-4" />, color: 'text-blue-400' };
    }
    return { label: 'Nursery Certificate', icon: <GraduationCap className="h-4 w-4" />, color: 'text-green-400' };
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
              Generate QR code for annual academic report cards
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Academic Year</Label>
              <Input
                type="text"
                value={reportCardYear}
                onChange={(e) => setReportCardYear(e.target.value)}
                placeholder="e.g., 2026"
                className="font-mono"
              />
              <p className="text-gray-500 text-xs mt-1">
                Format: YYYY (e.g., 2026 for 2026 academic year)
              </p>
            </div>
            <Button
              onClick={handleGenerateReportCard}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Report Card QR'}
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
              Generate QR code for Top Class graduation certificates
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Graduation Year</Label>
              <Input
                type="text"
                value={certificateYear}
                onChange={(e) => setCertificateYear(e.target.value)}
                placeholder="e.g., 2026"
                className="font-mono"
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
              />
              <p className="text-gray-500 text-xs mt-1">
                For tracking how many certificates issued
              </p>
            </div>
            <Button
              onClick={handleGenerateCertificate}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Certificate QR'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generated QR Codes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-accent" />
            Generated Verification QR Codes
            <Badge variant="outline">{verifications.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No verification QR codes generated yet</p>
              <p className="text-gray-500 text-sm mt-1">Generate one from the options above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verifications.map((v) => {
                const typeInfo = getTypeInfo(v.type);
                return (
                  <div key={v.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          {typeInfo.icon}
                          <span className={`font-semibold text-sm ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-400 text-xs">Year: {v.year}</span>
                          {v.count > 0 && (
                            <span className="text-gray-500 text-xs">• {v.count} issued</span>
                          )}
                        </div>
                      </div>
                      <Badge variant={v.is_active ? 'success' : 'outline'}>
                        {v.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-center">
                        {/* QR Code Image */}
                        <div className="bg-white p-2 rounded">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${VERIFY_BASE}/${v.id}`)}`}
                            alt="QR Code"
                            className="w-24 h-24"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">ID:</span>
                        <code className="text-gray-300">{v.id?.substring(0, 12)}...</code>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-gray-300">{formatDate(v.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs border-gray-500 text-gray-300"
                        onClick={() => copyUrl(v.id)}
                      >
                        {copiedId === v.id ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1 text-green-400" />Copied</>
                        ) : (
                          <><Copy className="h-3 w-3 mr-1" />Copy Link</>
                        )}
                      </Button>
                      <a
                        href={`${VERIFY_BASE}/${v.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-600 transition"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Preview
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVerification;
