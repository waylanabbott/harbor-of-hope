import { useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  Box,
  Container,
  Divider,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy | Harbor of Hope';
  }, []);

  const handleRevokeConsent = () => {
    Cookies.remove('harborCookieConsent');
    Cookies.remove('fontSize');
    window.location.reload();
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Page header */}
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

      {/* Data Controller */}
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Data Controller
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Harbor of Hope (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is the
        data controller responsible for your personal data. For privacy
        inquiries, contact us at{' '}
        <Typography
          component="a"
          href="mailto:privacy@harborofhope.org"
          sx={{ color: 'primary.main' }}
        >
          privacy@harborofhope.org
        </Typography>
        .
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* What We Collect */}
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        What Personal Data We Collect
      </Typography>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ mb: 2, borderRadius: 2 }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Data Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Examples</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Legal Basis (GDPR)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Account Information</TableCell>
              <TableCell>Email address, hashed password</TableCell>
              <TableCell>
                Contract performance (Art. 6(1)(b)) &mdash; necessary to
                provide your account
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Donation Records</TableCell>
              <TableCell>Amount, date, campaign, type</TableCell>
              <TableCell>
                Contract performance (Art. 6(1)(b)) &mdash; necessary to
                process your donation and display your history
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Essential Cookies</TableCell>
              <TableCell>
                Authentication session, CSRF token, cookie consent choice
              </TableCell>
              <TableCell>
                Legitimate interest (Art. 6(1)(f)) &mdash; required for site
                security and functionality
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Preference Cookies</TableCell>
              <TableCell>Text size setting</TableCell>
              <TableCell>
                Consent (Art. 6(1)(a)) &mdash; only set after you click
                &quot;Accept All Cookies&quot;
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        We do not collect analytics, tracking, or advertising data. We do not
        use third-party tracking pixels or social media trackers.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Cookies */}
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Cookies We Use
      </Typography>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ mb: 2, borderRadius: 2 }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Cookie Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Purpose</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                .AspNetCore.Identity.Application
              </TableCell>
              <TableCell>Essential</TableCell>
              <TableCell>Keeps you logged in</TableCell>
              <TableCell>Session</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                .AspNetCore.Antiforgery.*
              </TableCell>
              <TableCell>Essential</TableCell>
              <TableCell>
                Protects against cross-site request forgery
              </TableCell>
              <TableCell>Session</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>harborCookieConsent</TableCell>
              <TableCell>Essential</TableCell>
              <TableCell>Records your cookie consent choice</TableCell>
              <TableCell>1 year</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>fontSize</TableCell>
              <TableCell>Preference</TableCell>
              <TableCell>Remembers your preferred text size (small, medium, large)</TableCell>
              <TableCell>1 year</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 3 }} />

      {/* How We Use Data */}
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        How We Use Your Data
      </Typography>
      <Box component="ul" sx={{ pl: 3, mb: 2 }}>
        <li>
          <Typography variant="body1">
            To authenticate you and maintain your session
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            To display your personal donation history and impact (donors only)
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            To show aggregated, anonymized impact statistics to the public
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            To remember your display preferences (with consent)
          </Typography>
        </li>
      </Box>
      <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
        We never sell, rent, or share your personal data with third parties for
        marketing purposes.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Data Sharing */}
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Data Sharing and Transfers
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Your data is stored on servers in the United States (Microsoft Azure and
        Neon). If you are accessing from outside the US, your data will be
        transferred internationally. We rely on standard contractual clauses and
        industry-standard encryption to protect data in transit and at rest.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Data Retention */}
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Data Retention
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        We retain your account data and donation records for as long as your
        account is active. If you request account deletion, we will remove your
        personal data within 30 days, except where retention is required by law
        (e.g., financial records for tax purposes).
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* GDPR Rights */}
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Your Rights Under GDPR
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        If you are in the European Economic Area (EEA), you have the following
        rights under the General Data Protection Regulation:
      </Typography>
      <Box component="ul" sx={{ pl: 3, mb: 2 }}>
        <li>
          <Typography variant="body1">
            <strong>Right of access</strong> (Art. 15) &mdash; Request a copy of
            all personal data we hold about you
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>Right to rectification</strong> (Art. 16) &mdash; Request
            correction of inaccurate data
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>Right to erasure</strong> (Art. 17) &mdash; Request deletion
            of your personal data (&quot;right to be forgotten&quot;)
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>Right to restrict processing</strong> (Art. 18) &mdash;
            Request that we limit how we use your data
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>Right to data portability</strong> (Art. 20) &mdash; Receive
            your data in a structured, machine-readable format
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>Right to object</strong> (Art. 21) &mdash; Object to
            processing based on legitimate interest
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>Right to withdraw consent</strong> (Art. 7(3)) &mdash;
            Withdraw cookie consent at any time using the button below
          </Typography>
        </li>
      </Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        To exercise any of these rights, email{' '}
        <Typography
          component="a"
          href="mailto:privacy@harborofhope.org"
          sx={{ color: 'primary.main' }}
        >
          privacy@harborofhope.org
        </Typography>
        . We will respond within 30 days.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Data Security */}
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Data Security
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        We protect your data with HTTPS encryption in transit, bcrypt password
        hashing, role-based access controls, Content Security Policy headers,
        and HSTS. We regularly review our security practices.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Children */}
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Children&apos;s Privacy
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Our website is not directed at children under 16. We do not knowingly
        collect personal data from children. Resident data displayed in the
        system is accessible only to authorized case managers and is never
        exposed publicly.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Manage Consent */}
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Manage Your Cookie Consent
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        You can withdraw your cookie consent at any time. This will remove all
        non-essential cookies and show the consent banner again on your next
        visit.
      </Typography>
      <Button
        variant="outlined"
        onClick={handleRevokeConsent}
        sx={{ borderRadius: 2, mb: 2 }}
      >
        Revoke Cookie Consent
      </Button>

      <Divider sx={{ my: 3 }} />

      {/* Contact */}
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>
        Contact Us
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        For any privacy-related inquiries, data requests, or complaints, contact
        us at{' '}
        <Typography
          component="a"
          href="mailto:privacy@harborofhope.org"
          sx={{ color: 'primary.main' }}
        >
          privacy@harborofhope.org
        </Typography>
        . If you believe your data protection rights have been violated, you
        have the right to lodge a complaint with your local data protection
        authority.
      </Typography>
    </Container>
  );
}
