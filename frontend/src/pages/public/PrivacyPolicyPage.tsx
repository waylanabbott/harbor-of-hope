import { useEffect } from 'react';
import { Box, Container, Divider, Typography } from '@mui/material';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy | Harbor of Hope';
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Page header with coral accent */}
      <Box
        sx={{
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          pl: 2,
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
          Privacy Policy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: April 2026
        </Typography>
      </Box>

      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Who We Are
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Harbor of Hope is a nonprofit organization operating safe homes for
        girls who are survivors of trafficking in Central America. This policy
        explains how we collect, use, and protect your information when you visit
        our website.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Information We Collect
      </Typography>
      <Box component="ul" sx={{ pl: 3, mb: 2 }}>
        <li>
          <Typography variant="body1">
            Account information (email, password) when you register
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            Donation records if you are a registered donor
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            Usage data through essential cookies required for the site to
            function
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            Preference cookies (such as dark mode) only with your explicit
            consent
          </Typography>
        </li>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        How We Use Your Information
      </Typography>
      <Box component="ul" sx={{ pl: 3, mb: 2 }}>
        <li>
          <Typography variant="body1">
            To provide and maintain our services
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            To display your donation history and impact (donors only)
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            To show aggregated, anonymized impact statistics to the public
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            We never sell your personal information to third parties
          </Typography>
        </li>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Cookies
      </Typography>
      <Box component="ul" sx={{ pl: 3, mb: 2 }}>
        <li>
          <Typography variant="body1">
            <strong>Essential cookies:</strong> Required for authentication and
            site functionality. These cannot be declined.
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>Preference cookies:</strong> Used to remember settings like
            dark mode. These are only set after you accept cookie consent.
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            You can manage your cookie preferences using the consent banner shown
            when you first visit.
          </Typography>
        </li>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Data Security
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        We use industry-standard security measures including HTTPS encryption,
        secure authentication, and role-based access controls to protect your
        data.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Your Rights
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        You may request access to, correction of, or deletion of your personal
        data by contacting us.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Contact Us
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        For privacy-related inquiries, email us at{' '}
        <Typography
          component="a"
          href="mailto:privacy@harborofhope.org"
          sx={{ color: 'primary.main' }}
        >
          privacy@harborofhope.org
        </Typography>
      </Typography>
    </Container>
  );
}
