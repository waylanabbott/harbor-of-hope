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

export default function DonorDashboard() {
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Your Impact
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        See how your contributions are making a difference.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography
                variant="h4"
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
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {impact?.firstDonationDate
                  ? new Date(impact.firstDonationDate).toLocaleDateString()
                  : '-'}
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
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {impact?.latestDonationDate
                  ? new Date(impact.latestDonationDate).toLocaleDateString()
                  : '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latest Donation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Allocation Breakdown */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Where Your Donations Go
      </Typography>
      {impact && impact.allocations.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Safehouse</TableCell>
                <TableCell>Program Area</TableCell>
                <TableCell align="right">Amount Allocated</TableCell>
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
  );
}
