import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Alert,
  Button,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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
    document.title = 'Dashboard | Harbor of Hope';
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadStats();
    return () => { cancelled = true; };
  }, []);

  const metrics = [
    { title: 'Total Residents', value: stats?.totalResidents ?? 0, icon: <PeopleIcon /> },
    { title: 'Active Cases', value: stats?.activeCases ?? 0, icon: <AssignmentIcon /> },
    { title: 'Total Donations', value: `$${(stats?.totalDonations ?? 0).toLocaleString()}`, icon: <AttachMoneyIcon /> },
    { title: 'Reintegration Rate', value: `${stats?.reintegrationRate ?? 0}%`, icon: <TrendingUpIcon /> },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Harbor of Hope Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview as of April 2026
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Metric Cards — even 4-column grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: { xs: 2, sm: 2.5, md: 3 },
          mb: 6,
        }}
      >
        {metrics.map((m) => (
          <Box key={m.title}>
            {loading ? (
              <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
            ) : (
              <MetricCard title={m.title} value={m.value} icon={m.icon} />
            )}
          </Box>
        ))}
      </Box>

      {/* OKR Gauge — centered */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
        <Paper
          sx={{
            maxWidth: 440,
            width: '100%',
            p: 4,
            textAlign: 'center',
            borderRadius: 4,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
          variant="outlined"
        >
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
            Reintegration OKR
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Target: 80%
          </Typography>
          {loading ? (
            <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
          ) : (
            <ReintegrationGauge rate={stats?.reintegrationRate ?? 0} />
          )}
        </Paper>
      </Box>

      {/* Bottom Tables — side by side with proper gaps */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 4, md: 5 },
          mb: 4,
        }}
      >
        {/* Recent Donations */}
        <Box>
          <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 700 }}>
            Recent Donations
          </Typography>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: 'auto', borderRadius: 3 }}
          >
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
                      <TableCell align="right">${d.amount.toLocaleString()}</TableCell>
                      <TableCell>{d.donationType ?? '-'}</TableCell>
                      <TableCell>
                        {d.donationDate ? new Date(d.donationDate).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button component={RouterLink} to="/admin/donors" size="small" endIcon={<ArrowForwardIcon />}>
              View All Donors
            </Button>
          </Box>
        </Box>

        {/* Residents Needing Attention */}
        <Box>
          <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 700 }}>
            Residents Needing Attention
          </Typography>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: 'auto', borderRadius: 3 }}
          >
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
                      <TableCell><RiskBadge level={r.currentRiskLevel} /></TableCell>
                      <TableCell>{r.caseStatus ?? '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button component={RouterLink} to="/admin/residents" size="small" endIcon={<ArrowForwardIcon />}>
              View All Residents
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
