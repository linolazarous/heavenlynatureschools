// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from './components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Vision from './pages/Vision';
import Programs from './pages/Programs';
import Governance from './pages/Governance';
import Partnerships from './pages/Partnerships';
import Support from './pages/Support';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import SchoolLive from './pages/SchoolLive';
import Contact from './pages/Contact';
import SchoolVerify from './pages/SchoolVerify';
import VerifyCertificate from './pages/VerifyCertificate';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminContacts from './pages/admin/AdminContacts';
import AdminBlog from './pages/admin/AdminBlog';
import AdminEvents from './pages/admin/AdminEvents';
import AdminSettings from './pages/admin/AdminSettings';
import ManageAdmins from './pages/admin/ManageAdmins';
import AdminLayout from './layouts/AdminLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { adminApi } from './utils/api';
import './App.css';

// ─────────────────────────────────────────────────────────────
// PROTECTED ROUTE COMPONENTS
// ─────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

const SuperAdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!adminApi.isSuperAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// ─────────────────────────────────────────────────────────────
// VERIFY ROUTER — Auto-detects ID Card vs Document
// ─────────────────────────────────────────────────────────────

const VerifyRouter = () => {
  const { id } = useParams();
  const [type, setType] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkType = async () => {
      try {
        const API_BASE = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureschools.com';

        // Try ID card verification first
        const res = await fetch(`${API_BASE}/api/verify/${id}`);
        const data = await res.json();

        if (data.valid && data.member) {
          setType('id-card');
          return;
        }

        // Try document verification
        const docRes = await fetch(`${API_BASE}/api/verify/document/${id}`);
        const docData = await docRes.json();

        if (docData.valid && docData.document) {
          setType('document');
          return;
        }

        setType('not-found');
      } catch {
        setType('not-found');
      } finally {
        setLoading(false);
      }
    };

    checkType();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying document...</p>
        </div>
      </div>
    );
  }

  if (type === 'id-card') {
    return <SchoolVerify />;
  }

  if (type === 'document') {
    return <VerifyCertificate />;
  }

  // Not found — SchoolVerify shows the error state
  return <SchoolVerify />;
};

// ─────────────────────────────────────────────────────────────
// MAIN APP COMPONENT
// ─────────────────────────────────────────────────────────────

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Header />
            <main>
              <Routes>
                {/* ─────────────────────────────────────────── */}
                {/* PUBLIC ROUTES                              */}
                {/* ─────────────────────────────────────────── */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/vision" element={<Vision />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/governance" element={<Governance />} />
                <Route path="/partnerships" element={<Partnerships />} />
                <Route path="/support" element={<Support />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/school/live" element={<SchoolLive />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* ─────────────────────────────────────────── */}
                {/* VERIFICATION ROUTES (Public)               */}
                {/* ─────────────────────────────────────────── */}
                {/* Auto-detect: tries ID card first, then document */}
                <Route path="/verify/:id" element={<VerifyRouter />} />
                {/* Force ID card verification */}
                <Route path="/verify/id/:id" element={<SchoolVerify />} />
                {/* Force document verification */}
                <Route path="/verify/document/:id" element={<VerifyCertificate />} />

                {/* ─────────────────────────────────────────── */}
                {/* ADMIN AUTH (No Layout)                     */}
                {/* ─────────────────────────────────────────── */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* ─────────────────────────────────────────── */}
                {/* PROTECTED ADMIN ROUTES (With Layout)       */}
                {/* ─────────────────────────────────────────── */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Dashboard Home */}
                  <Route index element={<AdminDashboard />} />

                  {/* Content Management */}
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="contacts" element={<AdminContacts />} />

                  {/* ✅ ID Cards — Dashboard with tab switched */}
                  <Route path="id-cards" element={<AdminDashboard />} />

                  {/* ✅ Verification QR Codes — Dashboard with tab switched */}
                  <Route path="verifications" element={<AdminDashboard />} />

                  {/* ✅ Live Chat — Dashboard with tab switched */}
                  <Route path="chat" element={<AdminDashboard />} />

                  {/* Settings */}
                  <Route path="settings" element={<AdminSettings />} />

                  {/* Manage Admins — Super Admin Only */}
                  <Route
                    path="manage-admins"
                    element={
                      <SuperAdminRoute>
                        <ManageAdmins />
                      </SuperAdminRoute>
                    }
                  />
                </Route>

                {/* ─────────────────────────────────────────── */}
                {/* CATCH ALL — Redirect to Home               */}
                {/* ─────────────────────────────────────────── */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" richColors />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
