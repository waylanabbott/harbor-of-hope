import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
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

      await refreshAuth();
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in.');
    }
  }

  function handleExternalLogin(providerName: string) {
    window.location.href = getExternalLoginUrl(providerName, '/admin/dashboard');
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
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
