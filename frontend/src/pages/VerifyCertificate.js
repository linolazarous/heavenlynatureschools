// frontend/src/pages/VerifyCertificate.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Award, FileText, GraduationCap, Calendar, CheckCircle2, XCircle, ExternalLink, School } from 'lucide-react';

const API_BASE = 'https://api.heavenlynatureschools.com';
const SCHOOL_LOGO = '/logo.webp';

const VerifyCertificate = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/verify/document/${id}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Verification failed');
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };
    fetchVerification();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Verifying document...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-4">
            {error || 'This document could not be verified. It may not be an authentic document from our school.'}
          </p>
          <p className="text-gray-500 text-sm">
            If you believe this is an error, please contact the school administration.
          </p>
        </div>
      </div>
    );
  }

  const { document: doc } = data;
  const isReportCard = doc.type === 'report_card';
  const isCertificate = doc.type === 'certificate';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <img src={SCHOOL_LOGO} alt="Logo" className="h-20 w-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Heavenly Nature Schools</h1>
          <p className="text-white/80">Nursery & Primary School — Juba, South Sudan</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {/* Verification Result */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-600">✓ Verified Authentic</h2>
              <p className="text-gray-500 text-sm">This document is officially issued by Heavenly Nature Schools</p>
            </div>
          </div>

          {/* Document Type */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              {isReportCard ? (
                <FileText className="h-8 w-8 text-blue-600" />
              ) : (
                <GraduationCap className="h-8 w-8 text-green-600" />
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {isReportCard ? 'Academic Report Card' : 'Certificate of Nursery Education'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {isReportCard
                    ? `Annual Academic Report Card for ${doc.year}`
                    : `Top Class Graduation Certificate — ${doc.year}`
                  }
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Document Type</p>
                <p className="font-semibold text-gray-800">
                  {isReportCard ? 'Academic Report Card (ARC)' : 'Nursery Education Certificate'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Academic Year</p>
                <p className="font-semibold text-gray-800">{doc.year}</p>
              </div>
              {doc.count > 0 && (
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Certificates Issued</p>
                  <p className="font-semibold text-gray-800">{doc.count}</p>
                </div>
              )}
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Issued Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(doc.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* School Info */}
          <div className="text-center border-t pt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <School className="h-5 w-5 text-primary" />
              <p className="font-semibold text-primary">Heavenly Nature Nursery & Primary School</p>
            </div>
            <p className="text-gray-500 text-sm mb-1">
              "Nurturing Right Leaders" — Juba City, South Sudan
            </p>
            <p className="text-gray-400 text-xs">
              Verified on {new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
            <p className="text-gray-400 text-xs mt-1 font-mono">
              Verification ID: {id?.substring(0, 16)}...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition"
            >
              <ExternalLink className="h-4 w-4" />
              Visit School Website
            </Link>
          </div>
        </div>

        {/* Security Note */}
        <div className="text-center pb-8">
          <div className="inline-flex items-center gap-2 text-gray-400 text-xs">
            <Shield className="h-3 w-3" />
            <span>Secured verification by Heavenly Nature Schools</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
