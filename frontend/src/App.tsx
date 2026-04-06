import { Routes, Route } from 'react-router-dom';
import { Typography, Container } from '@mui/material';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ManageMfaPage from './pages/auth/ManageMfaPage';
import LogoutPage from './pages/auth/LogoutPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ResidentsPage from './pages/admin/ResidentsPage';
import SupportersPage from './pages/admin/SupportersPage';
import ProcessRecordingsPage from './pages/admin/ProcessRecordingsPage';
import HomeVisitationsPage from './pages/admin/HomeVisitationsPage';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <Container sx={{ py: 6 }}>
              <Typography variant="h2">Harbor of Hope</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Safe homes for girls who are survivors of trafficking in Central
                America.
              </Typography>
            </Container>
          }
        />
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
              <Container sx={{ py: 6 }}><Typography variant="h4">Reports</Typography><Typography>Coming in Phase 5</Typography></Container>
            </ProtectedRoute>
          }
        />

        {/* Donor-only routes (placeholder for Phase 3) */}
        <Route
          path="/donor/dashboard"
          element={
            <ProtectedRoute role="Donor">
              <Container sx={{ py: 6 }}>
                <Typography variant="h3">Donor Dashboard</Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Coming in Phase 3
                </Typography>
              </Container>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
