import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  Container,
  Typography,
  Link,
} from '@mui/material';
import MfaSetup from '../../components/auth/MfaSetup';

function ManageMfaPage() {
  useEffect(() => {
    document.title = 'MFA Settings | Harbor of Hope';
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Two-Factor Authentication
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage your authenticator app for additional login security.
          </Typography>

          <MfaSetup />

          <Typography variant="body2" sx={{ mt: 4 }}>
            <Link component={RouterLink} to="/admin/dashboard">
              Back to Dashboard
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ManageMfaPage;
