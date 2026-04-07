import { useEffect, useState, type ReactNode } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  PieChart,
  Pie,
  Cell,
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
  fetchResidentOutcomes,
  fetchSafehouseComparison,
} from '../../lib/reportsApi';
import {
  fetchSocialMediaPredictions,
  fetchCounselingPredictions,
} from '../../lib/mlApi';
import type {
  DonationTrend,
  ResidentOutcome,
  SafehouseComparison,
} from '../../types/Reports';
import type {
  SocialMediaPredictionRow,
  CounselingPredictionRow,
} from '../../lib/mlApi';

const PIE_COLORS = ['#5B8C7A', '#E8735A', '#5B9BD5', '#E6A817', '#9B59B6'];

export default function ReportsPage() {
  useEffect(() => {
    document.title = 'Reports | Harbor of Hope';
  }, []);

  const [donationTrends, setDonationTrends] = useState<DonationTrend[]>([]);
  const [residentOutcomes, setResidentOutcomes] = useState<ResidentOutcome[]>([]);
  const [safehouseComparison, setSafehouseComparison] = useState<SafehouseComparison[]>([]);
  const [socialMediaPredictions, setSocialMediaPredictions] = useState<SocialMediaPredictionRow[] | null>(null);
  const [counselingPredictions, setCounselingPredictions] = useState<CounselingPredictionRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mlSocialError, setMlSocialError] = useState(false);
  const [mlCounselingError, setMlCounselingError] = useState(false);
  const [expandedChart, setExpandedChart] = useState<{ title: string; content: ReactNode } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const results = await Promise.allSettled([
          fetchDonationTrends(),
          fetchResidentOutcomes(),
          fetchSafehouseComparison(),
          fetchSocialMediaPredictions(),
          fetchCounselingPredictions(),
        ]);
        if (cancelled) return;

        if (results[0].status === 'fulfilled') setDonationTrends(results[0].value);
        if (results[1].status === 'fulfilled') setResidentOutcomes(results[1].value);
        if (results[2].status === 'fulfilled') setSafehouseComparison(results[2].value);
        if (results[3].status === 'fulfilled') setSocialMediaPredictions(results[3].value);
        else setMlSocialError(true);
        if (results[4].status === 'fulfilled') setCounselingPredictions(results[4].value);
        else setMlCounselingError(true);

        const reportsFailed = [results[0], results[1], results[2]].every(
          (r) => r.status === 'rejected'
        );
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

  const avgPredictedEngagement =
    socialMediaPredictions && socialMediaPredictions.length > 0
      ? socialMediaPredictions.reduce((sum, p) => sum + p.predictedEngagementRate, 0) / socialMediaPredictions.length
      : 0;

  const avgPredictedImprovement =
    counselingPredictions && counselingPredictions.length > 0
      ? counselingPredictions.reduce((sum, p) => sum + p.predictedImprovement, 0) / counselingPredictions.length
      : 0;

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

  function renderReintegrationPie(height: number, outerRadius: number) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={residentOutcomes}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="45%"
            outerRadius={outerRadius}
            label={false}
          >
            {residentOutcomes.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
            formatter={(value: any, name: any) => [value, name]}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            formatter={(value: string) => {
              const item = residentOutcomes.find((o) => o.status === value);
              const total = residentOutcomes.reduce((s, o) => s + o.count, 0);
              const pct = item && total > 0 ? ((item.count / total) * 100).toFixed(0) : '0';
              return `${value} (${pct}%)`;
            }}
          />
        </PieChart>
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

      {/* Row 1: Donation Trends + Reintegration Status */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' },
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
          onClick={() => setExpandedChart({ title: 'Reintegration Status', content: renderReintegrationPie(500, 180) })}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            Reintegration Status
          </Typography>
          <Box sx={{ flex: 1, minHeight: 350, display: 'flex', alignItems: 'center' }}>
            {renderReintegrationPie(320, 100)}
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}>
            Click to expand
          </Typography>
        </Paper>
      </Box>

      {/* Row 2: Safehouse Comparison — full width */}
      <Paper
        sx={{ ...chartPaperSx, mb: { xs: 4, md: 5 } }}
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

      {/* Row 3: ML Insight Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 4, md: 5 },
        }}
      >
        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TipsAndUpdatesIcon sx={{ mr: 1.5, color: '#E6A817', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Social Media Posting Recommendations
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {socialMediaPredictions
                ? `Based on analysis of ${socialMediaPredictions.length} social media posts`
                : 'Pre-computed insights from post effectiveness analysis'}
            </Typography>

            {mlSocialError ? (
              <Alert severity="info">
                ML predictions unavailable -- run the inference pipeline to populate prediction tables
              </Alert>
            ) : (
              <>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#5B8C7A' }}>
                  Avg Predicted Engagement: {avgPredictedEngagement.toFixed(4)}
                </Typography>
                <List dense>
                  {[
                    'Posts with images outperform text-only posts',
                    'Including a call-to-action increases engagement',
                    'Mid-week posts (Tue-Thu) tend to perform better',
                    'Afternoon posting (2-4 PM) shows higher reach',
                  ].map((text) => (
                    <ListItem key={text} sx={{ py: 0.75 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleOutlineIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PsychologyIcon sx={{ mr: 1.5, color: '#9B59B6', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Counseling Effectiveness Insights
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {counselingPredictions
                ? `Based on analysis of ${counselingPredictions.length} counseling sessions`
                : 'Pre-computed analysis of session outcomes'}
            </Typography>

            {mlCounselingError ? (
              <Alert severity="info">
                ML predictions unavailable -- run the inference pipeline to populate prediction tables
              </Alert>
            ) : (
              <>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#5B8C7A' }}>
                  Avg Predicted Improvement: {avgPredictedImprovement.toFixed(2)} points
                </Typography>
                <List dense>
                  {[
                    'Individual sessions show stronger emotional improvement than group sessions',
                    'Sessions using structured interventions have measurably better outcomes',
                    'Longer sessions (45-60 min) correlate with greater improvement',
                    'Starting emotional state is the strongest predictor of improvement magnitude',
                  ].map((text) => (
                    <ListItem key={text} sx={{ py: 0.75 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleOutlineIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
