import { useEffect, useState, useMemo } from 'react';
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
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
} from 'recharts';
import { fetchMyDonations } from '../../lib/donorPortalApi';
import { fetchImpactSnapshots } from '../../lib/publicApi';
import type { DonorDonation } from '../../types/DonorPortal';
import type { ImpactSnapshot } from '../../types/PublicImpact';

export default function DonorHistoryPage() {
  useEffect(() => {
    document.title = 'My Donations | Harbor of Hope';
  }, []);

  const [donations, setDonations] = useState<DonorDonation[]>([]);
  const [snapshots, setSnapshots] = useState<ImpactSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [donationData, snapshotData] = await Promise.all([
          fetchMyDonations().catch(() => [] as DonorDonation[]),
          fetchImpactSnapshots().catch(() => [] as ImpactSnapshot[]),
        ]);
        if (!cancelled) {
          setDonations(donationData);
          setSnapshots(snapshotData);
        }
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

  // Build chart: org-wide totals + user's donations as separate series
  const chartData = useMemo(() => {
    // Org-wide donations from impact snapshots
    const orgByMonth: Record<string, number> = {};
    for (const s of snapshots) {
      if (s.month && s.donationsTotal != null) {
        orgByMonth[s.month] = (orgByMonth[s.month] ?? 0) + s.donationsTotal;
      }
    }

    // User's own donations separately
    const userByMonth: Record<string, number> = {};
    for (const d of donations) {
      if (!d.donationDate) continue;
      const date = new Date(d.donationDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      userByMonth[key] = (userByMonth[key] ?? 0) + d.amount;
    }

    // Combine all months
    const allMonths = new Set([
      ...Object.keys(orgByMonth),
      ...Object.keys(userByMonth),
    ]);

    return Array.from(allMonths)
      .sort()
      .map((month) => ({
        month,
        org: orgByMonth[month] ?? 0,
        yours: userByMonth[month] ?? 0,
      }));
  }, [snapshots, donations]);

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
      {/* Hero banner matching dashboard */}
      <Box
        sx={{
          background:
            'linear-gradient(135deg, #D4603F 0%, #E8935A 50%, #F5C89A 100%)',
          color: 'white',
          py: { xs: 5, md: 6 },
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
              textShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            Your Donation History
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Monthly Donations Chart — always shown with org-wide data */}
        {chartData.length > 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 4 },
              mb: 5,
              borderRadius: 3,
              maxWidth: 900,
              mx: 'auto',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}
            >
              Monthly Donations
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} stackOffset="none">
                <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#6B6B6B' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: '#6B6B6B' }}
                  tickFormatter={(v: number) => `$${v.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: any, name: any) => [
                    `$${Number(value).toLocaleString()}`,
                    name,
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="org"
                  stackId="donations"
                  fill="#D4603F"
                  name="All Donations"
                />
                <Bar
                  dataKey="yours"
                  stackId="donations"
                  fill="#5B8C7A"
                  name="Your Donation"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        )}

        {/* Donations Table */}
        {donations.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No personal donations found for your account.
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Make your first donation from the dashboard!
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              mb: 5,
              overflowX: 'auto',
              borderRadius: 3,
              maxWidth: 900,
              mx: 'auto',
            }}
          >
            <Table aria-label="Donation history">
              <TableHead>
                <TableRow>
                  <TableCell scope="col">Date</TableCell>
                  <TableCell scope="col">Type</TableCell>
                  <TableCell scope="col">Campaign</TableCell>
                  <TableCell scope="col" align="right">
                    Amount
                  </TableCell>
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

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/donor/dashboard"
            startIcon={<ArrowBackIcon />}
            size="large"
            sx={{ borderRadius: 2, px: 4 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
