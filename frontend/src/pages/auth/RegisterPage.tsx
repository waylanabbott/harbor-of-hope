import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  Link,
} from '@mui/material';
import RegisterForm from '../../components/auth/RegisterForm';
import { useAuth } from '../../context/AuthContext';
import { register, login } from '../../lib/authApi';

function RegisterPage() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Register | Harbor of Hope';
  }, []);

  async function handleRegister(email: string, password: string) {
    setError('');

    try {
      await register(email, password);
      // Auto-login after successful registration
      await login(email, password);
      const session = await refreshAuth();
      // Navigate based on role
      if (session.roles.includes('Donor')) {
        navigate('/donor/dashboard');
      } else if (session.roles.includes('Admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to create account.'
      );
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 6,
        minHeight: 'calc(100vh - 130px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Card sx={{ borderTop: '4px solid #D4603F' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Harbor of Hope logo"
              sx={{
                height: 64,
                width: 64,
                borderRadius: '50%',
                objectFit: 'cover',
                clipPath: 'circle(34% at 50% 50%)',
              }}
            />
            <Typography
              variant="h5"
              component="p"
              sx={{ color: '#D4603F', fontWeight: 700 }}
            >
              Harbor of Hope
            </Typography>
          </Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a Harbor of Hope account. Password must be at least 14
            characters.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <RegisterForm onSubmit={handleRegister} error="" />

          <Typography variant="body2" sx={{ mt: 3 }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default RegisterPage;
