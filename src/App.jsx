import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import AnalysisResult from './pages/AnalysisResult';
import LiveMonitor from './pages/LiveMonitor';
import ThreatMap from './pages/ThreatMap';
import ScanHistory from './pages/ScanHistory';
import AiAssistant from './components/AiAssistant';

// Protected Route Component with BFcache Back-Button Prevention
function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useApp();

  useEffect(() => {
    const handlePageShow = (e) => {
      // If page was restored from browser BFcache and user is not authenticated
      if (e.persisted && !isAuthenticated) {
        window.location.replace('/login');
      }             
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [isAuthenticated]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg text-text-primary">
        <div className="w-8 h-8 border-2 border-accent-color border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}
      <AiAssistant />
    </>
  );
}

// Public Route Component (prevents authenticated users from viewing login/signup)
function PublicRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useApp();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg text-text-primary">
        <div className="w-8 h-8 border-2 border-accent-color border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppContent() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected Main App Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scan"
        element={
          <ProtectedRoute>
            <Scan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis-result"
        element={
          <ProtectedRoute>
            <AnalysisResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/live-monitor"
        element={
          <ProtectedRoute>
            <LiveMonitor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/threat-map"
        element={
          <ProtectedRoute>
            <ThreatMap />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scan-history"
        element={
          <ProtectedRoute>
            <ScanHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <ScanHistory />
          </ProtectedRoute>
        }
      />

      {/* Default Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
