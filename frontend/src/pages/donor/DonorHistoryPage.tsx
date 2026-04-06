import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchMyDonations } from '../../lib/donorPortalApi';
import type { DonorDonation } from '../../types/DonorPortal';

export default function DonorHistoryPage() {
  const [donations, setDonations] = useState<DonorDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMyDonations();
        if (!cancelled) setDonations(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load donations'
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
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Your Donation History
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {donations.length === 0 ? (
        <Box sx={{ py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No donations found for your account.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, overflowX: 'auto' }}>
          <Table aria-label="Donation history">
            <TableHead>
              <TableRow>
                <TableCell scope="col">Date</TableCell>
                <TableCell scope="col">Type</TableCell>
                <TableCell scope="col">Campaign</TableCell>
                <TableCell scope="col" align="right">Amount</TableCell>
                <TableCell scope="col">Recurring</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.donationId}>
                  <TableCell>
                    {donation.donationDate
                      ? new Date(donation.donationDate).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>{donation.donationType ?? '-'}</TableCell>
                  <TableCell>{donation.campaignName ?? '-'}</TableCell>
                  <TableCell align="right">
                    ${donation.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={donation.isRecurring ? 'Yes' : 'No'}
                      color={donation.isRecurring ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Button
        variant="text"
        component={RouterLink}
        to="/donor/dashboard"
        startIcon={<ArrowBackIcon />}
      >
        Back to Dashboard
      </Button>
    </Container>
  );
}
