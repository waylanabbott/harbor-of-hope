import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  Divider,
  Link,
  Stack,
} from '@mui/material';
import LoginForm from '../../components/auth/LoginForm';
import { useAuth } from '../../context/AuthContext';
import {
  login,
  fetchExternalProviders,
  getExternalLoginUrl,
  type ExternalAuthProvider,
} from '../../lib/authApi';

function LoginPage() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [error, setError] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [externalProviders, setExternalProviders] = useState<
    ExternalAuthProvider[]
  >([]);

  useEffect(() => {
    document.title = 'Sign In | Harbor of Hope';
  }, []);

  useEffect(() => {
    void loadProviders();
  }, []);

  async function loadProviders() {
    try {
      const providers = await fetchExternalProviders();
      setExternalProviders(providers);
    } catch {
      setExternalProviders([]);
    }
  }

  async function handleLogin(
    email: string,
    password: string,
    twoFactorCode?: string
  ) {
    setError('');

    try {
      const result = await login(email, password, twoFactorCode);

      if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        return;
      }

      const session = await refreshAuth();
      if (session.roles.includes('Admin')) {
        navigate('/admin/dashboard');
      } else if (session.roles.includes('Donor')) {
        navigate('/donor/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in.');
    }
  }

  function handleExternalLogin(providerName: string) {
    window.location.href = getExternalLoginUrl(providerName, '/admin/dashboard');
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
              sx={{ height: 36, width: 36, borderRadius: '50%', transform: 'scale(1.42)' }}
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
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to access your Harbor of Hope account.
          </Typography>

          <LoginForm
            onSubmit={handleLogin}
            error={error}
            requiresTwoFactor={requiresTwoFactor}
          />

          {externalProviders.length > 0 && (
            <>
              <Divider sx={{ my: 3 }}>or</Divider>
              <Stack spacing={1}>
                {externalProviders.map((provider) => (
                  <Button
                    key={provider.name}
                    variant="outlined"
                    fullWidth
                    onClick={() => handleExternalLogin(provider.name)}
                  >
                    Continue with {provider.displayName}
                  </Button>
                ))}
              </Stack>
            </>
          )}

          <Typography variant="body2" sx={{ mt: 3 }}>
            Need an account?{' '}
            <Link component={RouterLink} to="/register">
              Create an account
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default LoginPage;
