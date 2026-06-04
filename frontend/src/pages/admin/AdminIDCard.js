// frontend/src/pages/admin/AdminIDCard.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, Copy, CheckCircle2, CreditCard, QrCode, Shield,
  ExternalLink, User, Phone, Calendar, MapPin, Clock, Heart,
  CameraIcon, Image, Trash2, RefreshCw, Search, X, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, publicApi } from '../../utils/api';

// Fallback UI components if @/components/ui doesn't exist
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
  <label className={`block text-sm font-medium text-gray-300 ${className || ''}`}>{children}</label>
);

const Card = ({ children, className }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-xl ${className || ''}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="p-6 pb-0">{children}</div>;
const CardTitle = ({ children, className }) => <h3 className={`text-lg font-semibold text-white ${className || ''}`}>{children}</h3>;
const CardContent = ({ children, className }) => <div className={`p-6 ${className || ''}`}>{children}</div>;

const Badge = ({ children, variant, className }) => (
  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
    variant === 'outline' ? 'border border-gray-500 text-gray-400' : 'bg-primary/20 text-primary'
  } ${className || ''}`}>{children}</span>
);

// ─── Constants ─────────────────────────────────────────────
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const VERIFY_BASE_URL = 'https://heavenlynatureschools.com/verify';

const ROLES = [
  "Principal", "Head Teacher", "Teacher", "School Coordinator",
  "Admin", "Accountant", "Secretary", "Office Staff",
  "Caregiver", "Social Worker", "Security", "Guard",
  "Volunteer", "Intern", "Staff",
];

const DEPARTMENTS = [
  "Administration", "Nursery Section", "Primary Section",
  "Child Protection", "Finance", "Security",
];

const BRANCHES = ["Juba Main Campus"];
const GENDERS = ["Male", "Female"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// ─── Main Component ────────────────────────────────────────
const AdminIDCard = () => {
  const [idCards, setIdCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState({
    name: '', member_id: '', role: 'Teacher', department: '',
    date_of_birth: '', gender: '', blood_group: '', phone: '',
    branch: 'Juba Main Campus', member_since: '',
    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
    date_issued: '', expiry_date: '',
    image: null, photo: null
  });
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  // ✅ Fetch ID cards with proper error handling
  const fetchIdCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to view ID cards');
        setIdCards([]);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.heavenlynatureministry.com'}/api/admin/id-cards`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        setIdCards([]);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Server error (${response.status})`);
      }

      const data = await response.json();
      console.log('ID Cards loaded:', data); // Debug log
      
      // Handle both response formats
      const cards = data.id_cards || data.cards || [];
      setIdCards(Array.isArray(cards) ? cards : []);
      
      if (cards.length === 0) {
        console.log('No ID cards found - this is normal for a new installation');
      }
    } catch (err) {
      console.error('Failed to load ID cards:', err);
      setError(err.message || 'Failed to load ID cards');
      setIdCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdCards();
  }, [fetchIdCards]);

  // ✅ Form validation
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.image) errs.image = 'Front ID image is required';
    else if (form.image.size > MAX_IMAGE_SIZE) errs.image = 'Image too large (max 10MB)';
    if (form.photo && form.photo.size > MAX_IMAGE_SIZE) errs.photo = 'Photo too large (max 10MB)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ✅ Handle upload
  const handleUpload = async () => {
    if (!validate()) return;
    setUploading(true);
    setResult(null);

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('role', form.role);
    fd.append('department', form.department || '');
    fd.append('image', form.image);
    if (form.photo) fd.append('photo', form.photo);
    if (form.member_id) fd.append('member_id', form.member_id);
    if (form.date_of_birth) fd.append('date_of_birth', form.date_of_birth);
    if (form.gender) fd.append('gender', form.gender);
    if (form.blood_group) fd.append('blood_group', form.blood_group);
    if (form.phone) fd.append('phone', form.phone);
    if (form.branch) fd.append('branch', form.branch);
    if (form.member_since) fd.append('member_since', form.member_since);
    if (form.emergency_contact_name) fd.append('emergency_contact_name', form.emergency_contact_name);
    if (form.emergency_contact_phone) fd.append('emergency_contact_phone', form.emergency_contact_phone);
    if (form.emergency_contact_relation) fd.append('emergency_contact_relation', form.emergency_contact_relation);
    if (form.date_issued) fd.append('date_issued', form.date_issued);
    if (form.expiry_date) fd.append('expiry_date', form.expiry_date);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.heavenlynatureministry.com'}/api/admin/id-cards`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser sets it
        },
        body: fd,
      });

      if (response.status === 401) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail;
        if (Array.isArray(detail)) {
          const errs = {};
          detail.forEach(d => {
            const field = d.loc?.[d.loc.length - 1] || d.loc?.[1] || 'general';
            errs[field] = d.msg;
          });
          setErrors(errs);
        }
        throw new Error(typeof detail === 'string' ? detail : 'Upload failed');
      }

      const data = await response.json();
      setResult(data);
      toast.success(`ID Card created: ${data.member_id}`);
      resetForm();
      fetchIdCards();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setForm({
      name: '', member_id: '', role: 'Teacher', department: '',
      date_of_birth: '', gender: '', blood_group: '', phone: '',
      branch: 'Juba Main Campus', member_since: '',
      emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
      date_issued: '', expiry_date: '', image: null, photo: null
    });
    setErrors({});
    setShowAdvanced(false);
  };

  // ✅ Delete card
  const handleDelete = async (cardId) => {
    if (!window.confirm('Delete this ID card?')) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.heavenlynatureministry.com'}/api/admin/id-cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Deleted');
      fetchIdCards();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  // ✅ Copy verify URL
  const copyVerifyUrl = (cardId) => {
    const url = `${VERIFY_BASE_URL}/${cardId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(cardId);
      toast.success('Link copied!');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // ✅ Format helpers
  const formatSize = (b) => {
    if (!b) return '0 B';
    const u = ['B', 'KB', 'MB'];
    const k = 1024;
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / Math.pow(k, i)).toFixed(1)} ${u[i]}`;
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    try {
      return new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return d;
    }
  };

  // ✅ Filter cards
  const filtered = searchQuery.trim()
    ? idCards.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.member_id?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : idCards;

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-accent" />
          School ID Cards
        </h2>
        <Button onClick={fetchIdCards} variant="outline" className="border-gray-600 text-gray-300">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Upload Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-accent" />
            New School ID Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Full Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  setForm(p => ({ ...p, name: e.target.value }));
                  setErrors(p => ({ ...p, name: undefined }));
                }}
                placeholder="John Maker Deng"
                className={`mt-2 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label className="text-gray-300">Role *</Label>
              <select
                value={form.role}
                onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full mt-2 bg-gray-700 border-gray-600 text-white rounded-lg p-2"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-gray-300">Department</Label>
              <select
                value={form.department}
                onChange={(e) => setForm(p => ({ ...p, department: e.target.value }))}
                className="w-full mt-2 bg-gray-700 border-gray-600 text-white rounded-lg p-2"
              >
                <option value="">-- Select --</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-gray-300">Staff ID (auto if empty)</Label>
              <Input
                value={form.member_id}
                onChange={(e) => setForm(p => ({ ...p, member_id: e.target.value }))}
                placeholder="HNM-ED-2026-001"
                className="mt-2 font-mono text-sm"
              />
            </div>
          </div>

          {/* Front ID Image */}
          <div>
            <Label className="text-gray-300">Front ID Card Image *</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                errors.image
                  ? 'border-red-500'
                  : form.image
                  ? 'border-green-500/50'
                  : 'border-gray-600 hover:border-accent/50'
              }`}
              onClick={() => document.getElementById('school-id-front').click()}
            >
              {form.image ? (
                <div className="space-y-1">
                  <CheckCircle2 className="h-6 w-6 mx-auto text-green-400" />
                  <p className="text-green-400 text-sm truncate">{form.image.name}</p>
                  <p className="text-gray-500 text-xs">{formatSize(form.image.size)}</p>
                </div>
              ) : (
                <>
                  <Image className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                  <p className="text-gray-400 text-sm">Click to upload front ID card</p>
                  <p className="text-gray-500 text-xs mt-1">PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
            {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
            <input
              id="school-id-front"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                setForm(p => ({ ...p, image: e.target.files[0] }));
                setErrors(p => ({ ...p, image: undefined }));
              }}
            />
          </div>

          {/* Passport Photo */}
          <div>
            <Label className="text-gray-300">
              Passport Photo <span className="text-gray-500 text-xs">(shown on verification)</span>
            </Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                errors.photo
                  ? 'border-red-500'
                  : form.photo
                  ? 'border-green-500/50'
                  : 'border-gray-600 hover:border-accent/50'
              }`}
              onClick={() => document.getElementById('school-id-photo').click()}
            >
              {form.photo ? (
                <div className="space-y-1">
                  <CameraIcon className="h-6 w-6 mx-auto text-green-400" />
                  <p className="text-green-400 text-sm truncate">{form.photo.name}</p>
                  <p className="text-gray-500 text-xs">{formatSize(form.photo.size)}</p>
                </div>
              ) : (
                <>
                  <CameraIcon className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                  <p className="text-gray-400 text-sm">Click to upload passport photo</p>
                  <p className="text-gray-500 text-xs mt-1">Optional - shows on QR verification</p>
                </>
              )}
            </div>
            {errors.photo && <p className="text-red-400 text-xs mt-1">{errors.photo}</p>}
            <input
              id="school-id-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                setForm(p => ({ ...p, photo: e.target.files[0] }));
                setErrors(p => ({ ...p, photo: undefined }));
              }}
            />
          </div>

          {/* Advanced Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-accent text-sm hover:underline"
          >
            {showAdvanced ? '▲ Hide' : '▼ Show'} Advanced Fields
          </button>

          {showAdvanced && (
            <div className="space-y-4 border-t border-gray-700 pt-4">
              <h4 className="text-white font-medium">
                <User className="h-4 w-4 inline mr-1 text-accent" />
                Personal Details
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">DOB</Label>
                  <Input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => setForm(p => ({ ...p, date_of_birth: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Gender</Label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm(p => ({ ...p, gender: e.target.value }))}
                    className="w-full mt-2 bg-gray-700 border-gray-600 text-white rounded-lg p-2"
                  >
                    <option value="">--</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Blood</Label>
                  <select
                    value={form.blood_group}
                    onChange={(e) => setForm(p => ({ ...p, blood_group: e.target.value }))}
                    className="w-full mt-2 bg-gray-700 border-gray-600 text-white rounded-lg p-2"
                  >
                    <option value="">--</option>
                    {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <h4 className="text-white font-medium pt-2">
                <Heart className="h-4 w-4 inline mr-1 text-red-400" />
                Emergency Contact
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Name</Label>
                  <Input
                    value={form.emergency_contact_name}
                    onChange={(e) => setForm(p => ({ ...p, emergency_contact_name: e.target.value }))}
                    placeholder="Parent/Guardian"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Phone</Label>
                  <Input
                    value={form.emergency_contact_phone}
                    onChange={(e) => setForm(p => ({ ...p, emergency_contact_phone: e.target.value }))}
                    placeholder="+211..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Relation</Label>
                  <Input
                    value={form.emergency_contact_relation}
                    onChange={(e) => setForm(p => ({ ...p, emergency_contact_relation: e.target.value }))}
                    placeholder="Father"
                    className="mt-2"
                  />
                </div>
              </div>
              <h4 className="text-white font-medium pt-2">
                <Clock className="h-4 w-4 inline mr-1 text-accent" />
                Validity
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Issued</Label>
                  <Input
                    type="date"
                    value={form.date_issued}
                    onChange={(e) => setForm(p => ({ ...p, date_issued: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Expiry (auto if empty)</Label>
                  <Input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => setForm(p => ({ ...p, expiry_date: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-accent hover:bg-accent/90 text-primary font-bold py-3"
          >
            {uploading ? 'Uploading...' : 'Create School ID Card'}
          </Button>

          {result && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-2">
              <p className="text-green-400 font-bold flex items-center gap-2">
                <Shield className="h-4 w-4" />✅ Created!
              </p>
              <p className="text-white text-sm">
                ID: <span className="font-mono">{result.member_id}</span>
              </p>
              <p className="text-white text-sm">Expires: {result.expiry_date}</p>
              <div>
                <p className="text-gray-400 text-xs mb-1">Verify Link:</p>
                <div className="flex items-center gap-2">
                  <code className="text-blue-400 text-xs break-all bg-gray-900 p-2 rounded flex-1">
                    {result.verify_url}
                  </code>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(result.verify_url);
                      toast.success('Copied!');
                    }}
                    className="bg-accent text-primary"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ID Cards List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-accent" />
              School ID Cards
              <Badge variant="outline" className="ml-2 text-xs border-gray-500 text-gray-400">
                {filtered.length}
              </Badge>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 w-48"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-gray-400">Loading ID cards...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-yellow-400 mb-2">{error}</p>
              <Button onClick={fetchIdCards} variant="outline" className="border-gray-600 text-gray-300">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No ID cards yet</p>
              <p className="text-gray-500 text-sm mt-1">Create your first ID card above</p>
            </div>
          )}

          {/* Cards Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(card => (
                <Card key={card.id} className="bg-gray-700 border-gray-600 hover:border-gray-500 transition-all">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{card.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{card.member_id}</p>
                        <Badge variant="outline" className="mt-1 text-xs border-accent/30 text-accent">
                          {card.role}
                        </Badge>
                        {card.department && (
                          <p className="text-xs text-gray-500 mt-1">{card.department}</p>
                        )}
                        {card.expiry_date && (
                          <p className={`text-xs mt-1 ${new Date(card.expiry_date) < new Date() ? 'text-red-400' : 'text-gray-500'}`}>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(card.expiry_date) < new Date() ? 'Expired' : 'Expires'}: {formatDate(card.expiry_date)}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(card.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-gray-500 text-gray-300 mt-2"
                      onClick={() => copyVerifyUrl(card.id)}
                    >
                      {copiedId === card.id ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-400" />Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />Copy QR Link
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIDCard;
