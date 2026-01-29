import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminContacts from './pages/admin/AdminContacts';
import AdminBlog from './pages/admin/AdminBlog';
import AdminEvents from './pages/admin/AdminEvents';
import AdminRoute from './pages/admin/AdminRoute';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            {/* Public Routes */}
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

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/contacts" element={<AdminRoute><AdminContacts /></AdminRoute>} />
            <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
            <Route path="/admin/events" element={<AdminRoute><AdminEvents /></AdminRoute>} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}

export default App;
