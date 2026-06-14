import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVideos from './pages/admin/AdminVideos';
import AdminUsers from './pages/admin/AdminUsers';
import AdminInvites from './pages/admin/AdminInvites';
import AdminUpload from './pages/admin/AdminUpload';
import Layout from './components/Layout';

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--purple-deep)' }}>
      <div style={{ marginBottom: '24px' }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="28" stroke="#D4AF37" strokeWidth="2" opacity="0.3"/>
          <circle cx="30" cy="30" r="28" stroke="#D4AF37" strokeWidth="2" strokeDasharray="44 132" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
      <p style={{ fontFamily: 'Cinzel, serif', color: '#D4AF37', fontSize: '14px', letterSpacing: '3px' }}>DESTINY TV</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e0a38', color: '#F5F0FF', border: '1px solid #2d1054' },
            success: { iconTheme: { primary: '#D4AF37', secondary: '#1e0a38' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<HomePage />} />
            <Route path="watch/:id" element={<WatchPage />} />
            <Route path="category/:slug" element={<CategoryPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/videos" element={<ProtectedRoute adminOnly><AdminVideos /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="admin/invites" element={<ProtectedRoute adminOnly><AdminInvites /></ProtectedRoute>} />
            <Route path="admin/upload" element={<ProtectedRoute adminOnly><AdminUpload /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
