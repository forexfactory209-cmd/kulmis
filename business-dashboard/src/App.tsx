import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import LoginPage from './features/auth/pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import DiscoverTalentPage from './features/discover/pages/DiscoverTalentPage';
import TalentProfileDetailPage from './features/discover/pages/TalentProfileDetailPage';
import SavedTalentPage from './features/discover/pages/SavedTalentPage';
import InvitationsPage from './features/discover/pages/InvitationsPage';
import MyTeamPage from './features/team/pages/MyTeamPage';
import WorkerDetailPage from './features/team/pages/WorkerDetailPage';
import ProjectsPage from './features/projects/pages/ProjectsPage';
import ProjectDetailPage from './features/projects/pages/ProjectDetailPage';
import TasksKanbanPage from './features/projects/pages/TasksKanbanPage';
import AttendancePage from './features/operations/pages/AttendancePage';
import PayrollPage from './features/operations/pages/PayrollPage';
import ContractsPage from './features/operations/pages/ContractsPage';
import DisputesPage from './features/operations/pages/DisputesPage';
import MessagesPage from './features/communication/pages/MessagesPage';
import FilesPage from './features/communication/pages/FilesPage';
import AnalyticsPage from './features/analytics/pages/AnalyticsPage';
import ReportsPage from './features/analytics/pages/ReportsPage';
import NotificationsPage from './features/settings/pages/NotificationsPage';
import SettingsPage from './features/settings/pages/SettingsPage';
import BillingPage from './features/settings/pages/BillingPage';
import SupportPage from './features/settings/pages/SupportPage';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/discover" element={<DiscoverTalentPage />} />
                  <Route path="/discover/:id" element={<TalentProfileDetailPage />} />
                  <Route path="/saved-talent" element={<SavedTalentPage />} />
                  <Route path="/invitations" element={<InvitationsPage />} />
                  <Route path="/team" element={<MyTeamPage />} />
                  <Route path="/team/:id" element={<WorkerDetailPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/tasks" element={<TasksKanbanPage />} />
                  <Route path="/attendance" element={<AttendancePage />} />
                  <Route path="/payroll" element={<PayrollPage />} />
                  <Route path="/contracts" element={<ContractsPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/files" element={<FilesPage />} />
                  <Route path="/disputes" element={<DisputesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/billing" element={<BillingPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
