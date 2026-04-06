import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../lib/authApi';

function LogoutPage() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    async function performLogout() {
      try {
        await logout();
        await refreshAuth();
      } catch {
        // Even if logout fails server-side, clear local state
        await refreshAuth();
      }
      navigate('/');
    }

    void performLogout();
  }, [navigate, refreshAuth]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      gap={2}
    >
      <CircularProgress />
      <Typography color="text.secondary">Signing out...</Typography>
    </Box>
  );
}

export default LogoutPage;
