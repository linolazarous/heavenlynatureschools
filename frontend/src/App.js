// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import VerifyCertificate from './pages/VerifyCertificate'; // ✅ Document verification
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

// ✅ Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};

// ✅ Super Admin Protected Route Component
const SuperAdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/admin/login" replace />;
  
  // Check if user is super admin
  if (!adminApi.isSuperAdmin()) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Header />
            <main>
              <Routes>
                {/* ─── Public Routes ─── */}
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
                
                {/* ✅ Verification Routes */}
                <Route path="/verify/:id" element={<VerifyRouter />} />
                <Route path="/verify/id/:id" element={<SchoolVerify />} />
                <Route path="/verify/document/:id" element={<VerifyCertificate />} />
                
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                
                {/* ─── Admin Auth Route (No Layout) ─── */}
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* ─── Protected Admin Routes with Layout ─── */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="contacts" element={<AdminContacts />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="events" element={<AdminEvents />} />
                  
                  {/* ✅ ID Cards - handled by dashboard tabs */}
                  <Route path="id-cards" element={<AdminDashboard />} />
                  
                  {/* ✅ Verification QR Codes - handled by dashboard tabs */}
                  <Route path="verifications" element={<AdminDashboard />} />
                  
                  <Route path="settings" element={<AdminSettings />} />
                  
                  {/* ✅ Manage Admins Route - Super Admin Only */}
                  <Route path="manage-admins" element={
                    <SuperAdminRoute>
                      <ManageAdmins />
                    </SuperAdminRoute>
                  } />
                </Route>
                
                {/* ─── Catch all - redirect to home ─── */}
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

// ✅ Verify Router - Auto-detects ID card vs Document verification
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
          // It's an ID card
          setType('id-card');
        } else {
          // Try document verification
          const docRes = await fetch(`${API_BASE}/api/verify/document/${id}`);
          const docData = await docRes.json();
          
          if (docData.valid && docData.document) {
            setType('document');
          } else {
            setType('not-found');
          }
        }
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying...</p>
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

  // Not found - show error
  return <SchoolVerify />; // SchoolVerify handles invalid case
};

export default App;
