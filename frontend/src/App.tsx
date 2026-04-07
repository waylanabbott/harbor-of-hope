import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ManageMfaPage from './pages/auth/ManageMfaPage';
import LogoutPage from './pages/auth/LogoutPage';
import LandingPage from './pages/public/LandingPage';
import PublicImpactPage from './pages/public/PublicImpactPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import AboutPage from './pages/public/AboutPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ResidentsPage from './pages/admin/ResidentsPage';
import SupportersPage from './pages/admin/SupportersPage';
import ProcessRecordingsPage from './pages/admin/ProcessRecordingsPage';
import HomeVisitationsPage from './pages/admin/HomeVisitationsPage';
import ReportsPage from './pages/admin/ReportsPage';
import ExplanatoryInsightsPage from './pages/admin/ExplanatoryInsightsPage';
import UsersPage from './pages/admin/UsersPage';
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorHistoryPage from './pages/donor/DonorHistoryPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/impact" element={<PublicImpactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes - any authenticated user */}
        <Route
          path="/manage-mfa"
          element={
            <ProtectedRoute>
              <ManageMfaPage />
            </ProtectedRoute>
          }
        />
        <Route path="/logout" element={<LogoutPage />} />

        {/* Admin-only routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/residents"
          element={
            <ProtectedRoute role="Admin">
              <ResidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/donors"
          element={
            <ProtectedRoute role="Admin">
              <SupportersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sessions"
          element={
            <ProtectedRoute role="Admin">
              <ProcessRecordingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/visits"
          element={
            <ProtectedRoute role="Admin">
              <HomeVisitationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute role="Admin">
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/insights"
          element={
            <ProtectedRoute role="Admin">
              <ExplanatoryInsightsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="Admin">
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Donor-only routes */}
        <Route
          path="/donor/dashboard"
          element={
            <ProtectedRoute role="Donor">
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/donations"
          element={
            <ProtectedRoute role="Donor">
              <DonorHistoryPage />
            </ProtectedRoute>
          }
        />
        {/* Catch-all 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
