import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found | Harbor of Hope';
  }, []);

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 10,
        minHeight: 'calc(100vh - 130px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h1"
        sx={{ fontWeight: 800, color: '#D4603F', mb: 2, fontSize: '5rem' }}
      >
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Page Not Found
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, lineHeight: 1.7 }}
      >
        The page you are looking for does not exist or has been moved.
      </Typography>
      <Box>
        <Button
          variant="contained"
          component={RouterLink}
          to="/"
          size="large"
          sx={{ px: 4 }}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}
