// frontend/src/App.js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // works in v6 & v7
// For v7 future-proof: import { BrowserRouter as Router, Routes, Route } from 'react-router';

// Components
import { Toaster } from './components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';

// Public pages (eager load critical ones)
import Home from './pages/Home';
import About from './pages/About';
import Vision from './pages/Vision';
import Contact from './pages/Contact';

// Lazy-load heavier / less frequent pages
const Programs = lazy(() => import('./pages/Programs'));
const Governance = lazy(() => import('./pages/Governance'));
const Partnerships = lazy(() => import('./pages/Partnerships'));
const Support = lazy(() => import('./pages/Support'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));

// Admin (protected + lazy)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminRoute = lazy(() => import('./pages/admin/AdminRoute')); // if AdminRoute is simple, could eager-load

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Suspense fallback={<div className="loading">Loading...</div>}> {/* Global fallback for lazy */}
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

              {/* Admin Routes – protected via AdminRoute wrapper */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/contacts" element={<AdminRoute><AdminContacts /></AdminRoute>} />
              <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
              <Route path="/admin/events" element={<AdminRoute><AdminEvents /></AdminRoute>} />

              {/* Optional: 404 catch-all */}
              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}

export default App;
