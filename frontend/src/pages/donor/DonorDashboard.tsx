import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
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
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { fetchMyImpact } from '../../lib/donorPortalApi';
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

export default function DonorDashboard() {
  useEffect(() => {
    document.title = 'My Impact | Harbor of Hope';
  }, []);

  const [impact, setImpact] = useState<DonorImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMyImpact();
        if (!cancelled) setImpact(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load impact data'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

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
      {/* Issue 19: Warm gradient hero banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #D4603F 0%, #E8935A 50%, #F5C89A 100%)',
          color: 'white',
          py: { xs: 5, md: 7 },
          px: 3,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 1,
              textShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            Thank you for your support!
          </Typography>
          <Typography
            variant="body1"
            sx={{ opacity: 0.95, maxWidth: 520, mx: 'auto' }}
          >
            Your generosity helps us provide safety, healing, and hope to
            survivors of trafficking. Here is how your contributions are making a
            difference.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards -- Issue 20: variant h5 + formatted dates */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: 'primary.main' }}
                >
                  ${(impact?.totalDonated ?? 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Donated
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {impact?.donationCount ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Donations Made
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatDate(impact?.firstDonationDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  First Donation
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatDate(impact?.latestDonationDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latest Donation
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Allocation Breakdown */}
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Where Your Donations Go
        </Typography>
        {impact && impact.allocations.length > 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, overflowX: 'auto' }}>
            <Table aria-label="Donation allocations">
              <TableHead>
                <TableRow>
                  <TableCell scope="col">Safehouse</TableCell>
                  <TableCell scope="col">Program Area</TableCell>
                  <TableCell scope="col" align="right">Amount Allocated</TableCell>
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
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            No allocation data available yet.
          </Typography>
        )}

        {/* Navigation Link */}
        <Button
          variant="outlined"
          component={RouterLink}
          to="/donor/donations"
          endIcon={<ArrowForwardIcon />}
        >
          View Full Donation History
        </Button>
      </Container>
    </Box>
  );
}
