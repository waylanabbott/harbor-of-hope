import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Alert,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MetricCard from '../../components/ui/MetricCard';
import ReintegrationGauge from '../../components/charts/ReintegrationGauge';
import RiskBadge from '../../components/ui/RiskBadge';
import { fetchDashboardStats } from '../../lib/dashboardApi';
import type { DashboardStats } from '../../types/Dashboard';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load dashboard'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={120} />
          ) : (
            <MetricCard
              title="Total Residents"
              value={stats?.totalResidents ?? 0}
              icon={<PeopleIcon />}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={120} />
          ) : (
            <MetricCard
              title="Active Cases"
              value={stats?.activeCases ?? 0}
              icon={<AssignmentIcon />}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={120} />
          ) : (
            <MetricCard
              title="Total Donations"
              value={`$${(stats?.totalDonations ?? 0).toLocaleString()}`}
              icon={<AttachMoneyIcon />}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={120} />
          ) : (
            <MetricCard
              title="Reintegration Rate"
              value={`${stats?.reintegrationRate ?? 0}%`}
              icon={<TrendingUpIcon />}
            />
          )}
        </Grid>
      </Grid>

      {/* OKR Gauge */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Box sx={{ maxWidth: 400, width: '100%' }}>
          {loading ? (
            <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
          ) : (
            <ReintegrationGauge rate={stats?.reintegrationRate ?? 0} />
          )}
        </Box>
      </Box>

      {/* Bottom Tables */}
      <Grid container spacing={3}>
        {/* Recent Donations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Recent Donations
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small" aria-label="Recent donations">
              <TableHead>
                <TableRow>
                  <TableCell scope="col">Supporter</TableCell>
                  <TableCell scope="col" align="right">Amount</TableCell>
                  <TableCell scope="col">Type</TableCell>
                  <TableCell scope="col">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                    </TableRow>
                  ))
                ) : stats?.recentDonations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No recent donations
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stats?.recentDonations.map((d) => (
                    <TableRow key={d.donationId}>
                      <TableCell>{d.supporterName ?? 'Anonymous'}</TableCell>
                      <TableCell align="right">
                        ${d.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{d.donationType ?? '-'}</TableCell>
                      <TableCell>
                        {d.donationDate
                          ? new Date(d.donationDate).toLocaleDateString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Residents Needing Attention */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Residents Needing Attention
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small" aria-label="Residents needing attention">
              <TableHead>
                <TableRow>
                  <TableCell scope="col">Case #</TableCell>
                  <TableCell scope="col">Safehouse</TableCell>
                  <TableCell scope="col">Risk Level</TableCell>
                  <TableCell scope="col">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                    </TableRow>
                  ))
                ) : stats?.residentsNeedingAttention.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No residents need attention
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stats?.residentsNeedingAttention.map((r) => (
                    <TableRow key={r.residentId}>
                      <TableCell>{r.caseControlNo ?? '-'}</TableCell>
                      <TableCell>{r.safehouseName ?? '-'}</TableCell>
                      <TableCell>
                        <RiskBadge level={r.currentRiskLevel} />
                      </TableCell>
                      <TableCell>{r.caseStatus ?? '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}
