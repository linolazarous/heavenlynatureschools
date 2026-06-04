// frontend/src/pages/SchoolVerify.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, AlertTriangle, Camera, Ban, Clock, BadgeCheck, GraduationCap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = 'https://api.heavenlynatureschools.com';

// ✅ School logo path
const SCHOOL_LOGO = '/logo.webp';

const SchoolVerify = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/verify/${id}`);
        const data = await res.json();
        setMember(data);
      } catch (err) {
        setError('Verification failed');
      } finally {
        setLoading(false);
      }
    };
    fetchMember();

    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) || 
          e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.style.opacity = '0.15';
        document.body.style.filter = 'blur(10px)';
        toast.warning('⚠️ Screenshots are prohibited', { duration: 3000, style: { background: '#7f1d1d', color: '#fff', border: '1px solid #ef4444' } });
        setTimeout(() => { document.body.style.opacity = '1'; document.body.style.filter = 'none'; }, 2000);
      }
    };
    const handleBlur = () => { document.body.style.opacity = '0.2'; setTimeout(() => { document.body.style.opacity = '1'; }, 800); };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [id]);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  };

  // ✅ Determine if member is a student or staff based on role
  const isStudent = (role) => {
    const studentRoles = ['Student', 'Pupil', 'Learner', 'Prefect'];
    return studentRoles.some(r => role?.toLowerCase().includes(r.toLowerCase()));
  };

  // ✅ Get ID label based on role
  const getIdLabel = (role) => {
    if (!role) return 'Staff/Student ID';
    return isStudent(role) ? 'Student ID' : 'Staff ID';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-secondary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying school ID...</p>
        </div>
      </div>
    );
  }

  if (error || !member?.valid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Ban className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-primary mb-2">Invalid ID</h1>
          <p className="text-muted-foreground">This ID could not be verified in our records.</p>
          <p className="text-muted-foreground text-sm mt-2">Please contact the school administration office.</p>
        </div>
      </div>
    );
  }

  const memberData = member.member || member;
  const photoUrl = getImageUrl(memberData.photo_url);
  const imageUrl = getImageUrl(memberData.image_url);
  const displayPhoto = photoUrl || imageUrl;
  const idLabel = getIdLabel(memberData.role);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-600 text-xs font-medium">Screenshots &amp; unauthorized reproduction are prohibited</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-primary/5" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
          
          {/* School Header with Logo */}
          <div className="bg-primary px-6 py-5 text-center">
            {/* ✅ Actual School Logo */}
            <div className="inline-flex items-center justify-center mb-3">
              <img 
                src={SCHOOL_LOGO}
                alt="Heavenly Nature Schools Logo"
                className="h-16 w-auto object-contain"
                draggable="false"
                onError={(e) => {
                  // Fallback to graduation cap icon if logo fails to load
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/20">
                      <svg class="h-7 w-7 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                      </svg>
                    </div>
                  `;
                }}
              />
            </div>
            <h2 className="font-serif text-lg font-semibold text-white">Heavenly Nature</h2>
            <p className="text-secondary text-sm font-medium">Nursery &amp; Primary School</p>
            <p className="text-white/60 text-xs mt-1">Nurturing Right Leaders — Juba, South Sudan</p>
          </div>

          {/* Verified Badge */}
          <div className="bg-secondary/10 px-6 py-2 flex items-center justify-center gap-2 border-b border-secondary/20">
            <BadgeCheck className="h-5 w-5 text-primary" />
            <span className="text-primary font-bold text-sm">VERIFIED SCHOOL ID</span>
          </div>

          <div className="p-6">
            {/* Photo + Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-secondary flex-shrink-0 bg-secondary/10">
                {displayPhoto ? (
                  <img 
                    src={displayPhoto}
                    alt={memberData.name}
                    className="w-full h-full object-cover"
                    draggable="false"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-secondary/20 text-primary text-2xl font-bold font-serif">
                          ${(memberData.name || '?').charAt(0).toUpperCase()}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/20 text-primary text-2xl font-bold font-serif">
                    {(memberData.name || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="font-serif text-xl font-bold text-primary">{memberData.name}</h2>
                <span className={`inline-block mt-1 px-3 py-0.5 text-xs font-semibold rounded-full ${
                  isStudent(memberData.role) 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-secondary/20 text-primary'
                }`}>
                  {memberData.role || 'Staff'}
                </span>
                {memberData.role_code && (
                  <span className="inline-block ml-2 px-2 py-0.5 bg-primary/5 text-muted-foreground text-xs font-mono rounded-full">
                    {memberData.role_code}
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              {/* ✅ Dynamic ID Label: Student ID or Staff ID */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{idLabel}</span>
                <span className="text-sm font-mono font-semibold text-primary">{memberData.member_id || 'N/A'}</span>
              </div>
              {memberData.department && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Department</span>
                  <span className="text-sm text-primary font-medium">{memberData.department}</span>
                </div>
              )}
              {memberData.branch && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Campus</span>
                  <span className="text-sm text-primary">{memberData.branch}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valid Until</span>
                <span className="text-sm font-semibold">
                  {memberData.expiry_date ? (
                    <span className={new Date(memberData.expiry_date) < new Date() ? 'text-red-500' : 'text-primary'}>
                      {new Date(memberData.expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      {new Date(memberData.expiry_date) < new Date() && ' (Expired)'}
                    </span>
                  ) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Verified On</span>
                <span className="text-sm text-primary">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>

            {/* School Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-secondary" />
                <p className="text-xs text-muted-foreground text-center">
                  Heavenly Nature Nursery &amp; Primary School
                </p>
              </div>
              <p className="text-xs text-muted-foreground/60 text-center">
                "Train up a child in the way he should go" — Proverbs 22:6
              </p>
              <p className="text-xs text-muted-foreground/40 text-center mt-1 select-none">
                {id?.substring(0, 8)}...
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-primary/5 px-6 py-3 flex items-center justify-center gap-2 border-t border-primary/5">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs text-primary/70 font-medium">Authentic School ID • Officially Verified</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground/50 text-xs">
          <AlertTriangle className="h-3 w-3" />
          <span>Protected page • Unauthorized reproduction is prohibited</span>
        </div>
      </div>

      <style>{`
        * { -webkit-user-select: none !important; -moz-user-select: none !important; -ms-user-select: none !important; user-select: none !important; }
        img { -webkit-user-drag: none !important; pointer-events: none !important; }
        body { transition: opacity 0.3s ease, filter 0.3s ease; }
      `}</style>
    </div>
  );
};

export default SchoolVerify;
