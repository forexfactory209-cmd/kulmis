import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './modules/auth/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import DashboardOverview from './modules/dashboard/DashboardOverview';
import FreelancerManagement from './modules/users/FreelancerManagement';
import ClientManagement from './modules/users/ClientManagement';
import BusinessManagement from './modules/users/BusinessManagement';
import ProjectManagement from './modules/projects/ProjectManagement';
import PaymentManagement from './modules/payments/PaymentManagement';
import DisputeManagement from './modules/disputes/DisputeManagement';
import StaffingManagement from './modules/staffing/StaffingManagement';
import SettingsSystem from './modules/settings/SettingsSystem';
import JobsMonitoringPage from './modules/monitoring/JobsMonitoringPage';
import ReviewsPage from './modules/reviews/ReviewsPage';
import CategoriesPage from './modules/categories/CategoriesPage';
import ProjectDetailsPage from './modules/projects/ProjectDetailsPage';
import ClientDetailPage from './modules/users/ClientDetailPage';
import FreelancerDetailPage from './modules/users/FreelancerDetailPage';
import BusinessDetailPage from './modules/users/BusinessDetailPage';
import CategoryDetailPage from './modules/categories/CategoryDetailPage';

// Auth guard component — redirects to login if not authenticated as ADMIN
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN') {
      return <Navigate to="/login" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
        <Route path="/freelancers" element={<ProtectedRoute><FreelancerManagement /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><ClientManagement /></ProtectedRoute>} />
        <Route path="/businesses" element={<ProtectedRoute><BusinessManagement /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><ProjectManagement /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailsPage /></ProtectedRoute>} />
        <Route path="/clients/:id" element={<ProtectedRoute><ClientDetailPage /></ProtectedRoute>} />
        <Route path="/freelancers/:id" element={<ProtectedRoute><FreelancerDetailPage /></ProtectedRoute>} />
        <Route path="/businesses/:id" element={<ProtectedRoute><BusinessDetailPage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentManagement /></ProtectedRoute>} />
        <Route path="/disputes" element={<ProtectedRoute><DisputeManagement /></ProtectedRoute>} />
        <Route path="/staffing" element={<ProtectedRoute><StaffingManagement /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsSystem /></ProtectedRoute>} />
        
        <Route path="/jobs-monitoring" element={<ProtectedRoute><JobsMonitoringPage /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        <Route path="/categories/:name" element={<ProtectedRoute><CategoryDetailPage /></ProtectedRoute>} />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
