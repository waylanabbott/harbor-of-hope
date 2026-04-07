import { useEffect, useState, type ReactNode } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Card,
  CardContent,
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
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  Bar,
} from 'recharts';
import { fetchImpactSnapshots } from '../../lib/publicApi';
import type { ImpactSnapshot } from '../../types/PublicImpact';

function buildSummary(snapshot: ImpactSnapshot): string {
  const parts: string[] = [];
  if (snapshot.totalResidents != null && snapshot.totalResidents > 0)
    parts.push(`${snapshot.totalResidents} residents active`);
  if (snapshot.avgHealthScore != null && snapshot.avgHealthScore > 0)
    parts.push(`avg health score ${snapshot.avgHealthScore.toFixed(2)}`);
  if (snapshot.educationProgress != null && snapshot.educationProgress > 0)
    parts.push(`education progress ${snapshot.educationProgress.toFixed(1)}%`);
  if (snapshot.donationsTotal != null && snapshot.donationsTotal > 0)
    parts.push(
      `$${snapshot.donationsTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} in donations`
    );
  return parts.length > 0
    ? parts.join(' \u00B7 ')
    : snapshot.summaryText ?? 'No detailed metrics available for this period.';
}

const paperSx = {
  p: { xs: 3, md: 4 },
  borderRadius: 4,
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  },
};

export default function PublicImpactPage() {
  const [snapshots, setSnapshots] = useState<ImpactSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChart, setExpandedChart] = useState<{
    title: string;
    content: ReactNode;
  } | null>(null);

  useEffect(() => {
    document.title = 'Impact | Harbor of Hope';
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchImpactSnapshots();
        if (!cancelled) setSnapshots(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load impact data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  const chartData = snapshots
    .filter(
      (s) =>
        s.avgHealthScore !== null ||
        s.educationProgress !== null ||
        s.totalResidents !== null ||
        s.donationsTotal !== null
    )
    .sort((a, b) => (a.month ?? '').localeCompare(b.month ?? ''));

  const recentSnapshots = snapshots.slice(0, 6);

  function renderHealthChart(height: number) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B6B6B' }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fill: '#6B6B6B' }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
          <Line type="monotone" dataKey="avgHealthScore" stroke="#5B8C7A" name="Avg Health Score" strokeWidth={2.5} dot={{ r: 3, fill: '#5B8C7A' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  function renderDonationsChart(height: number) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B6B6B' }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fill: '#6B6B6B' }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Donations']} />
          <Bar dataKey="donationsTotal" fill="#D4603F" name="Donations ($)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  function renderResidentsChart(height: number) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B6B6B' }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fill: '#6B6B6B' }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
          <Line type="monotone" dataKey="totalResidents" stroke="#D4603F" name="Total Residents" strokeWidth={2.5} dot={{ r: 3, fill: '#D4603F' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  function renderEducationChart(height: number) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B6B6B' }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fill: '#6B6B6B' }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Education Progress']} />
          <Line type="monotone" dataKey="educationProgress" stroke="#5B8C7A" name="Education Progress (%)" strokeWidth={2.5} dot={{ r: 3, fill: '#5B8C7A' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  const charts = [
    { title: 'Average Health Score Over Time', render: renderHealthChart },
    { title: 'Monthly Donations', render: renderDonationsChart },
    { title: 'Total Residents Over Time', render: renderResidentsChart },
    { title: 'Education Progress', render: renderEducationChart },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#FFF8F0', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: { xs: 6, md: 8 },
          backgroundImage: 'url(/hero-1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(180,75,45,0.8) 0%, rgba(200,120,70,0.75) 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 800, mb: 1.5, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            Public Impact Dashboard
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600 }}>
            Anonymized data showing Harbor of Hope&apos;s impact over time.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* Charts — 2x2 grid with generous gaps */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 4, md: 5 },
            mb: { xs: 8, md: 10 },
          }}
        >
          {charts.map((chart) => (
            <Paper
              key={chart.title}
              sx={paperSx}
              onClick={() =>
                setExpandedChart({ title: chart.title, content: chart.render(500) })
              }
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{ mb: 3, fontWeight: 700, color: '#2D2D2D' }}
              >
                {chart.title}
              </Typography>
              <Box sx={{ flex: 1, minHeight: 280 }}>{chart.render(280)}</Box>
              <Typography
                variant="caption"
                sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}
              >
                Click to expand
              </Typography>
            </Paper>
          ))}
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
              <DialogContent sx={{ pt: 2 }}>{expandedChart.content}</DialogContent>
            </>
          )}
        </Dialog>

        {/* Recent Updates — 3-column grid, equal-height cards */}
        {recentSnapshots.length > 0 && (
          <Box>
            <Typography
              variant="h4"
              component="h2"
              sx={{ mb: 5, fontWeight: 700, color: '#2D2D2D', textAlign: 'center' }}
            >
              Recent Updates
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: { xs: 3, md: 4 },
              }}
            >
              {recentSnapshots.map((snapshot, index) => (
                <Card
                  key={index}
                  sx={{
                    borderRadius: 4,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    border: 'none',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 4,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        component="h3"
                        sx={{ fontWeight: 700, color: '#2D2D2D', mb: 1.5, lineHeight: 1.4 }}
                      >
                        {snapshot.headline ?? 'Update'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', lineHeight: 1.7 }}
                      >
                        {buildSummary(snapshot)}
                      </Typography>
                    </Box>
                    {snapshot.snapshotDate && (
                      <Typography
                        variant="caption"
                        sx={{ mt: 3, display: 'block', color: '#D4603F', fontWeight: 600 }}
                      >
                        {new Date(snapshot.snapshotDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
