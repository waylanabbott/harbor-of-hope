import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  role?: string;
  children: React.ReactNode;
}

function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { authSession, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && !authSession.roles.includes(role)) {
    // Admins can access Donor pages (they have both roles)
    if (!(role === 'Donor' && authSession.roles.includes('Admin'))) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
