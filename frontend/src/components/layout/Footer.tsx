import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#2D2D2D',
        color: 'white',
        py: { xs: 6, md: 8 },
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: { xs: 5, sm: 8 },
          }}
        >
          {/* Column 1: Mission */}
          <Box sx={{ flex: '1 1 0', maxWidth: { sm: 360 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Harbor of Hope logo"
                sx={{ height: 48, width: 48, borderRadius: '50%', transform: 'scale(1.42)' }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                Harbor of Hope
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.7)' }}>
              Providing safety, healing, and opportunity to girls who are
              survivors of trafficking. Together, we build brighter futures.
            </Typography>
          </Box>

          {/* Column 2: Quick Links */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/impact', label: 'Impact' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/login', label: 'Login' },
              ].map((link) => (
                <MuiLink
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  variant="body2"
                  underline="hover"
                  sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#F5C89A' } }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Box>

          {/* Column 3: Contact */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
              Contact
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Email:{' '}
              <MuiLink
                href="mailto:info@harborofhope.org"
                underline="hover"
                sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#F5C89A' } }}
              >
                info@harborofhope.org
              </MuiLink>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.15)' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Box
            component="img"
            src="/logo.png"
            alt=""
            sx={{ height: 24, width: 24, borderRadius: '50%', opacity: 0.6, transform: 'scale(1.42)' }}
          />
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.5)' }}
          >
            &copy; 2026 Harbor of Hope. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
