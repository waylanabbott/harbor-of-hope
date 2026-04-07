import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Snackbar,
  Divider,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { fetchMyImpact, createDonation } from '../../lib/donorPortalApi';
import type { DonorImpact } from '../../types/DonorPortal';

const dateFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', dateFormatOptions);
}

const donationTypes = ['One-Time', 'Monthly', 'Annual', 'Memorial'];
const campaigns = [
  'General Fund',
  'Safe Home Construction',
  'Education Program',
  'Medical Care',
  'Counseling Services',
];

export default function DonorDashboard() {
  useEffect(() => {
    document.title = 'My Dashboard | Harbor of Hope';
  }, []);

  const [impact, setImpact] = useState<DonorImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Donation form state
  const [amount, setAmount] = useState('');
  const [donationType, setDonationType] = useState('One-Time');
  const [campaign, setCampaign] = useState('General Fund');
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [donateError, setDonateError] = useState<string | null>(null);

  const loadImpact = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMyImpact();
      setImpact(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load impact data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImpact();
  }, []);

  const handleDonate = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    try {
      setSubmitting(true);
      setDonateError(null);
      await createDonation({
        amount: numAmount,
        donationType,
        campaignName: campaign,
        isRecurring: donationType === 'Monthly' || donationType === 'Annual',
      });
      setAmount('');
      setSuccessOpen(true);
      // Refresh impact stats to reflect the new donation
      await loadImpact();
    } catch (err) {
      setDonateError(
        err instanceof Error ? err.message : 'Failed to process donation'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero banner */}
      <Box
        sx={{
          background:
            'linear-gradient(135deg, #D4603F 0%, #E8935A 50%, #F5C89A 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          px: 3,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 1.5,
              textShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            Thank you for your support!
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.95, maxWidth: 560, mx: 'auto', fontWeight: 400 }}
          >
            Your generosity helps us provide safety, healing, and hope to
            survivors of trafficking. Here is how your contributions are making a
            difference.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: { xs: 3, md: 5 },
            mb: 8,
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          {[
            {
              label: 'Total Donated',
              value: `$${(impact?.totalDonated ?? 0).toLocaleString()}`,
              color: 'primary.main',
            },
            { label: 'Donations Made', value: impact?.donationCount ?? 0 },
            {
              label: 'First Donation',
              value: formatDate(impact?.firstDonationDate),
            },
            {
              label: 'Latest Donation',
              value: formatDate(impact?.latestDonationDate),
            },
          ].map((card) => (
            <Card
              key={card.label}
              sx={{
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <CardContent sx={{ py: 4, px: 2 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: card.color ?? 'text.primary',
                    mb: 1,
                  }}
                >
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Make a Donation Section */}
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            mb: 6,
            borderRadius: 3,
            maxWidth: 600,
            mx: 'auto',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
          variant="outlined"
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <VolunteerActivismIcon
              sx={{ fontSize: 40, color: 'primary.main', mb: 1 }}
            />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              Make a Donation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Support our mission to provide safety and healing
            </Typography>
          </Box>

          {donateError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {donateError}
            </Alert>
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <TextField
              label="Amount ($)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: 1, step: 1 }}
              fullWidth
              placeholder="50"
            />
            <TextField
              select
              label="Donation Type"
              value={donationType}
              onChange={(e) => setDonationType(e.target.value)}
              fullWidth
            >
              {donationTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Campaign"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              fullWidth
            >
              {campaigns.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              size="large"
              onClick={handleDonate}
              disabled={!amount || parseFloat(amount) <= 0 || submitting}
              sx={{
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 2,
              }}
            >
              {submitting ? 'Processing...' : 'Donate Now'}
            </Button>
          </Box>
        </Paper>

        <Divider sx={{ mb: 5 }} />

        {/* Allocation Breakdown */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}
        >
          Where Your Donations Go
        </Typography>
        {impact && impact.allocations.length > 0 ? (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              mb: 5,
              overflowX: 'auto',
              maxWidth: 700,
              mx: 'auto',
              borderRadius: 3,
            }}
          >
            <Table aria-label="Donation allocations">
              <TableHead>
                <TableRow>
                  <TableCell scope="col">Safehouse</TableCell>
                  <TableCell scope="col">Program Area</TableCell>
                  <TableCell scope="col" align="right">
                    Amount Allocated
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {impact.allocations.map((alloc, index) => (
                  <TableRow key={index}>
                    <TableCell>{alloc.safehouseName ?? '-'}</TableCell>
                    <TableCell>{alloc.programArea ?? '-'}</TableCell>
                    <TableCell align="right">
                      ${alloc.totalAllocated.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 5, textAlign: 'center' }}
          >
            No allocation data available yet.
          </Typography>
        )}

        {/* Navigation Link */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/donor/donations"
            endIcon={<ArrowForwardIcon />}
            size="large"
            sx={{ borderRadius: 2, px: 4 }}
          >
            View Full Donation History
          </Button>
        </Box>
      </Container>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        message="Thank you! Your donation has been recorded."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
