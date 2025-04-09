import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import PostScheduler from './pages/PostScheduler';
import ScriptGenerator from './pages/ScriptGenerator';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import ReportExport from './pages/ReportExport';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/post-scheduler" element={<PostScheduler />} />
            <Route path="/script-generator" element={<ScriptGenerator />} />
            <Route path="/competitor-analysis" element={<CompetitorAnalysis />} />
            <Route path="/report-export" element={<ReportExport />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;