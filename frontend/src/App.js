import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import DataTablePage from './pages/DataTablePage';
import StaffManagement from './pages/StaffManagement';  // ⭐ NEW IMPORT
import UploadExcel from './pages/UploadExcel';
import Analytics from './pages/Analytics';
import Media from './pages/Media';
import PDFApplications from './pages/PDFApplications';

import './App.css';
import VideoFeedback from './pages/VideoFeedback';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Login Page */}
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />
          
          {/* Applications */}
          <Route path="/applications" element={
            <PrivateRoute>
              <Layout>
                <Applications />
              </Layout>
            </PrivateRoute>
          } />

          {/* Application Detail */}
          <Route path="/applications/:id" element={
            <PrivateRoute>
              <Layout>
                <ApplicationDetail />
              </Layout>
            </PrivateRoute>
          } />
          
          {/* Data Table */}
          <Route path="/data-table" element={
            <PrivateRoute>
              <Layout>
                <DataTablePage />
              </Layout>
            </PrivateRoute>
          } />
          
          {/* ⭐ NEW: Staff Management */}
          <Route path="/staff-management" element={
            <PrivateRoute>
              <Layout>
                <StaffManagement />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/video-feedback" element={
  <PrivateRoute>
    <Layout>
      <VideoFeedback />
    </Layout>
  </PrivateRoute>
} />
        <Route path="/pdf-applications" element={
  <PrivateRoute>
    <Layout>
      <PDFApplications />
    </Layout>
  </PrivateRoute>
} />
          {/* Upload Excel */}
          <Route path="/upload" element={
            <PrivateRoute>
              <Layout>
                <UploadExcel />
              </Layout>
            </PrivateRoute>
          } />
          
          {/* Analytics */}
          <Route path="/analytics" element={
            <PrivateRoute>
              <Layout>
                <Analytics />
              </Layout>
            </PrivateRoute>
          } />
            <Route path="/media" element={
            <PrivateRoute>
              <Layout>
                <Media />
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;