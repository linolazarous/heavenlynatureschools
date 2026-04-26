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
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminContacts from './pages/admin/AdminContacts';
import AdminBlog from './pages/admin/AdminBlog';
import AdminEvents from './pages/admin/AdminEvents';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

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

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
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
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/contacts" element={<ProtectedRoute><AdminContacts /></ProtectedRoute>} />
              <Route path="/admin/blog" element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
              <Route path="/admin/events" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
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