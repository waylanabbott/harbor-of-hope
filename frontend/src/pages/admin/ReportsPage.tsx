import { useEffect, useState, type ReactNode } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Bar,
} from 'recharts';
import {
  fetchDonationTrends,
  fetchSafehouseComparison,
} from '../../lib/reportsApi';
import type {
  DonationTrend,
  SafehouseComparison,
} from '../../types/Reports';
import InsightsPage from './InsightsPage';

export default function ReportsPage() {
  useEffect(() => {
    document.title = 'Reports | Harbor of Hope';
  }, []);

  const [donationTrends, setDonationTrends] = useState<DonationTrend[]>([]);
  const [safehouseComparison, setSafehouseComparison] = useState<SafehouseComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChart, setExpandedChart] = useState<{ title: string; content: ReactNode } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const results = await Promise.allSettled([
          fetchDonationTrends(),
          fetchSafehouseComparison(),
        ]);
        if (cancelled) return;

        if (results[0].status === 'fulfilled') setDonationTrends(results[0].value);
        if (results[1].status === 'fulfilled') setSafehouseComparison(results[1].value);

        const reportsFailed = results.every((r) => r.status === 'rejected');
        if (reportsFailed) setError('Failed to load report data. Please try again later.');
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  // Chart render functions — accept height so expanded view can be taller
  function renderDonationTrends(height: number) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={donationTrends}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
          <YAxis yAxisId="left" tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
            formatter={(value: any, name: any) => {
              if (name === 'Amount ($)') return [`$${Number(value).toLocaleString()}`, name];
              return [value, name];
            }}
          />
          <Legend />
          <Bar dataKey="totalAmount" yAxisId="left" fill="#E8735A" name="Amount ($)" barSize={20} radius={[4, 4, 0, 0]} />
          <Line dataKey="donationCount" yAxisId="right" stroke="#5B8C7A" name="# Donations" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  function renderSafehouseComparison(height: number) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={safehouseComparison}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
          <Legend />
          <Bar dataKey="avgEducationProgress" fill="#5B9BD5" name="Avg Education Progress" radius={[4, 4, 0, 0]} />
          <Bar dataKey="avgHealthScore" fill="#5B8C7A" name="Avg Health Score" radius={[4, 4, 0, 0]} />
          <Bar dataKey="totalIncidents" fill="#E8735A" name="Total Incidents" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const chartPaperSx = {
    p: { xs: 3, md: 4 },
    borderRadius: 4,
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    },
  };

  return (
    <>
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Reports & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Data-driven insights to guide your decision-making
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Charts: Donation Trends + Safehouse Comparison side by side */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 4, md: 5 },
          mb: { xs: 4, md: 5 },
        }}
      >
        <Paper
          sx={chartPaperSx}
          onClick={() => setExpandedChart({ title: 'Donation Trends Over Time', content: renderDonationTrends(500) })}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            Donation Trends Over Time
          </Typography>
          <Box sx={{ flex: 1, minHeight: 350 }}>
            {renderDonationTrends(350)}
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}>
            Click to expand
          </Typography>
        </Paper>

        <Paper
          sx={chartPaperSx}
          onClick={() => setExpandedChart({ title: 'Safehouse Comparison', content: renderSafehouseComparison(500) })}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            Safehouse Comparison
          </Typography>
          <Box sx={{ flex: 1, minHeight: 350 }}>
            {renderSafehouseComparison(350)}
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}>
            Click to expand
          </Typography>
        </Paper>
      </Box>

      {/* Expanded Chart Dialog */}
      <Dialog
        open={expandedChart !== null}
        onClose={() => setExpandedChart(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: { xs: 1, md: 2 } } }}
      >
        {expandedChart && (
          <>
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem', pr: 6 }}>
              {expandedChart.title}
              <IconButton
                onClick={() => setExpandedChart(null)}
                sx={{ position: 'absolute', right: 16, top: 16 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              {expandedChart.content}
            </DialogContent>
          </>
        )}
      </Dialog>

    </Box>

      {/* ML Insights section (formerly standalone Insights page) */}
      <InsightsPage />
    </>
  );
}
