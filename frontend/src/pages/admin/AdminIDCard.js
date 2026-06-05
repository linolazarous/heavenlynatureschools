// frontend/src/pages/admin/AdminIDCard.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, Copy, CheckCircle2, CreditCard, QrCode, Shield,
  ExternalLink, User, Phone, Calendar, MapPin, Clock, Heart,
  CameraIcon, Image, Trash2, RefreshCw, Search, X, AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Fallback UI Components ─────────────────────────────────
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
    variant === 'outline' ? 'border border-gray-500 text-gray-400' :
    variant === 'success' ? 'bg-green-500/20 text-green-400' :
    variant === 'danger' ? 'bg-red-500/20 text-red-400' :
    'bg-primary/20 text-primary'
  } ${className || ''}`}>{children}</span>
);

// ─── Constants ─────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureschools.com';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const VERIFY_BASE_URL = 'https://heavenlynatureschools.com/verify';

// ✅ Complete role lists matching backend ROLE_CODE_MAP
const STAFF_ROLES = [
  // Leadership / Administration
  "School Director", "School Officer", "Director of Studies", "School Bursar",
  "Principal", "Head Teacher",
  // Teaching Staff
  "Senior Woman Teacher", "Senior Man Teacher", "Teacher",
  "Sports Teacher", "Debate Teacher", "School Coordinator",
  // Admin / Support Staff
  "Admin", "Accountant", "Secretary", "Office Staff",
  "Staff", "Caregiver", "Social Worker", "Nurse", "Librarian", "Counselor",
  // Security
  "Security", "Guard",
  // Volunteers / Interns
  "Volunteer", "Intern",
];

const STUDENT_ROLES = [
  // Student Leadership
  "Head Prefect", "Assistant Head Prefect", "Health Prefect",
  "Debate Prefect", "Sports Prefect", "Class Prefect", "Prefect",
  // Students
  "Student", "Pupil", "Learner",
];

const ALL_ROLES = [...STAFF_ROLES, ...STUDENT_ROLES];

const DEPARTMENTS = [
  "Administration", "Nursery Section", "Primary Section",
  "Child Protection", "Finance", "Security", "Sports", "Health",
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
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'staff', 'student'

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

  // ✅ Fetch ID cards
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

      const response = await fetch(`${API_BASE}/api/admin/id-cards`, {
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
      const cards = data.id_cards || data.cards || [];
      setIdCards(Array.isArray(cards) ? cards : []);
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

  // ✅ Check if role is student
  const isStudentRole = (role) => STUDENT_ROLES.includes(role);

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
      const response = await fetch(`${API_BASE}/api/admin/id-cards`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });

      if (response.status === 401) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
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
    setResult(null);
  };

  // ✅ Delete card
  const handleDelete = async (cardId) => {
    if (!window.confirm('Delete this ID card? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/admin/id-cards/${cardId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');
      toast.success('ID card deleted');
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
      toast.success('Verification link copied!');
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      toast.error('Failed to copy link');
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
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return d; }
  };

  // ✅ Check if expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // ✅ Filter cards by search + role
  const filtered = idCards.filter(card => {
    const matchesSearch = !searchQuery.trim() || 
      card.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.member_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRoleFilter = roleFilter === 'all' || 
      (roleFilter === 'student' && isStudentRole(card.role)) ||
      (roleFilter === 'staff' && !isStudentRole(card.role));
    
    return matchesSearch && matchesRoleFilter;
  });

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-accent" />
            New School ID Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <Label>Full Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: undefined })); }}
                placeholder="John Maker Deng"
                className={`mt-2 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Role with optgroups */}
            <div>
              <Label>Role *</Label>
              <select
                value={form.role}
                onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full mt-2 bg-gray-700 border-gray-600 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <optgroup label="── Staff & Administration ──">
                  {STAFF_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </optgroup>
                <optgroup label="── Students ──">
                  {STUDENT_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </optgroup>
              </select>
              {form.role && (
                <p className="text-xs text-gray-500 mt-1">
                  {isStudentRole(form.role) ? '🟡 Student ID (1 year validity)' : '🔵 Staff ID (3 year validity)'}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <Label>Department</Label>
              <select
                value={form.department}
                onChange={(e) => setForm(p => ({ ...p, department: e.target.value }))}
                className="w-full mt-2 bg-gray-700 border-gray-600 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Select Department --</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Member ID */}
            <div>
              <Label>Member ID (auto-generated if empty)</Label>
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
            <Label>Front ID Card Image *</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                errors.image ? 'border-red-500' : form.image ? 'border-green-500/50' : 'border-gray-600 hover:border-accent/50'
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
            <input id="school-id-front" type="file" accept="image/*" className="hidden"
              onChange={(e) => { setForm(p => ({ ...p, image: e.target.files[0] })); setErrors(p => ({ ...p, image: undefined })); }}
            />
          </div>

          {/* Passport Photo */}
          <div>
            <Label>Passport Photo <span className="text-gray-500 text-xs">(shown on verification)</span></Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                errors.photo ? 'border-red-500' : form.photo ? 'border-green-500/50' : 'border-gray-600 hover:border-accent/50'
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
                  <p className="text-gray-500 text-xs mt-1">Optional - shows on verification page</p>
                </>
              )}
            </div>
            {errors.photo && <p className="text-red-400 text-xs mt-1">{errors.photo}</p>}
            <input id="school-id-photo" type="file" accept="image/*" className="hidden"
              onChange={(e) => { setForm(p => ({ ...p, photo: e.target.files[0] })); setErrors(p => ({ ...p, photo: undefined })); }}
            />
          </div>

          {/* Advanced Toggle */}
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-accent text-sm hover:underline">
            {showAdvanced ? '▲ Hide' : '▼ Show'} Advanced Fields
          </button>

          {showAdvanced && (
            <div className="space-y-4 border-t border-gray-700 pt-4">
              <h4 className="text-white font-medium"><User className="h-4 w-4 inline mr-1 text-accent" />Personal Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={(e) => setForm(p => ({ ...p, date_of_birth: e.target.value }))} className="mt-2" /></div>
                <div><Label>Gender</Label><select value={form.gender} onChange={(e) => setForm(p => ({ ...p, gender: e.target.value }))} className="w-full mt-2 bg-gray-700 border-gray-600 text-white rounded-lg p-2"><option value="">--</option>{GENDERS.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                <div><Label>Blood Group</Label><select value={form.blood_group} onChange={(e) => setForm(p => ({ ...p, blood_group: e.target.value }))} className="w-full mt-2 bg-gray-700 border-gray-600 text-white rounded-lg p-2"><option value="">--</option>{BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
              </div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+211..." className="mt-2" /></div>
              <div><Label>Member Since</Label><Input type="date" value={form.member_since} onChange={(e) => setForm(p => ({ ...p, member_since: e.target.value }))} className="mt-2" /></div>

              <h4 className="text-white font-medium pt-2"><Heart className="h-4 w-4 inline mr-1 text-red-400" />Emergency Contact</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><Label>Name</Label><Input value={form.emergency_contact_name} onChange={(e) => setForm(p => ({ ...p, emergency_contact_name: e.target.value }))} placeholder="Parent/Guardian" className="mt-2" /></div>
                <div><Label>Phone</Label><Input value={form.emergency_contact_phone} onChange={(e) => setForm(p => ({ ...p, emergency_contact_phone: e.target.value }))} placeholder="+211..." className="mt-2" /></div>
                <div><Label>Relation</Label><Input value={form.emergency_contact_relation} onChange={(e) => setForm(p => ({ ...p, emergency_contact_relation: e.target.value }))} placeholder="Father/Mother" className="mt-2" /></div>
              </div>

              <h4 className="text-white font-medium pt-2"><Clock className="h-4 w-4 inline mr-1 text-accent" />Validity</h4>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Date Issued</Label><Input type="date" value={form.date_issued} onChange={(e) => setForm(p => ({ ...p, date_issued: e.target.value }))} className="mt-2" /></div>
                <div><Label>Expiry Date (auto if empty)</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm(p => ({ ...p, expiry_date: e.target.value }))} className="mt-2" /></div>
              </div>
            </div>
          )}

          <Button onClick={handleUpload} disabled={uploading} className="w-full bg-accent hover:bg-accent/90 text-primary font-bold py-3">
            {uploading ? 'Creating...' : 'Create School ID Card'}
          </Button>

          {/* Success Result */}
          {result && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-2">
              <p className="text-green-400 font-bold flex items-center gap-2"><Shield className="h-4 w-4" />✅ Created Successfully!</p>
              <p className="text-white text-sm">ID: <span className="font-mono text-green-300">{result.member_id}</span></p>
              <p className="text-white text-sm">Role: {result.role} ({result.role_code})</p>
              <p className="text-white text-sm">Expires: {result.expiry_date}</p>
              <div>
                <p className="text-gray-400 text-xs mb-1">Verification Link:</p>
                <div className="flex items-center gap-2">
                  <code className="text-blue-400 text-xs break-all bg-gray-900 p-2 rounded flex-1">{result.verify_url}</code>
                  <Button size="sm" onClick={() => { navigator.clipboard.writeText(result.verify_url); toast.success('Copied!'); }} className="bg-accent text-primary"><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ID Cards List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-accent" />
              School ID Cards
              <Badge variant="outline">{filtered.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="staff">Staff Only</option>
                <option value="student">Students Only</option>
              </select>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-8 w-40 sm:w-48" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-gray-400">Loading ID cards...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-yellow-400 mb-2">{error}</p>
              <Button onClick={fetchIdCards} variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Try Again</Button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{searchQuery ? 'No matching ID cards' : 'No ID cards yet'}</p>
              <p className="text-gray-500 text-sm mt-1">Create your first ID card above</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(card => (
                <div key={card.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{card.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{card.member_id}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={isStudentRole(card.role) ? 'outline' : 'outline'} className={isStudentRole(card.role) ? 'border-blue-400/30 text-blue-400' : 'border-accent/30 text-accent'}>
                          {card.role}
                        </Badge>
                        {card.role_code && (
                          <span className="text-xs text-gray-500 font-mono">{card.role_code}</span>
                        )}
                      </div>
                      {card.department && <p className="text-xs text-gray-500 mt-1">{card.department}</p>}
                      {card.expiry_date && (
                        <p className={`text-xs mt-1 ${isExpired(card.expiry_date) ? 'text-red-400' : 'text-gray-500'}`}>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {isExpired(card.expiry_date) ? 'Expired' : 'Expires'}: {formatDate(card.expiry_date)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleDelete(card.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => copyVerifyUrl(card.id)}
                    className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-600 transition mt-2"
                  >
                    {copiedId === card.id ? (
                      <><CheckCircle2 className="h-3 w-3 text-green-400" />Copied</>
                    ) : (
                      <><Copy className="h-3 w-3" />Copy QR Link</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIDCard;
