import { useEffect, useState, type ReactNode } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
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

/** Build a human-readable summary from the parsed metrics, falling back to summaryText. */
function buildSummary(snapshot: ImpactSnapshot): string {
  const parts: string[] = [];

  if (snapshot.totalResidents != null && snapshot.totalResidents > 0) {
    parts.push(`${snapshot.totalResidents} residents active`);
  }
  if (snapshot.avgHealthScore != null && snapshot.avgHealthScore > 0) {
    parts.push(`avg health score ${snapshot.avgHealthScore.toFixed(2)}`);
  }
  if (snapshot.educationProgress != null && snapshot.educationProgress > 0) {
    parts.push(`education progress ${snapshot.educationProgress.toFixed(1)}%`);
  }
  if (snapshot.donationsTotal != null && snapshot.donationsTotal > 0) {
    parts.push(
      `$${snapshot.donationsTotal.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} in donations`
    );
  }

  if (parts.length > 0) {
    return parts.join(' \u00B7 ');
  }

  // Fall back to the raw summary text, or a generic placeholder
  return snapshot.summaryText ?? 'No detailed metrics available for this period.';
}

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

  // Filter snapshots with at least one metric field present, then sort by month ascending
  const chartData = snapshots
    .filter(
      (s) =>
        s.avgHealthScore !== null ||
        s.educationProgress !== null ||
        s.totalResidents !== null ||
        s.donationsTotal !== null
    )
    .sort((a, b) => (a.month ?? '').localeCompare(b.month ?? ''));

  // Recent snapshots for the updates section (first 5 from original order)
  const recentSnapshots = snapshots.slice(0, 5);

  const paperSx = {
    p: { xs: 3, md: 4 },
    borderRadius: 4,
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    },
  };

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
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Donations']} />
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
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(value: number) => [`${value.toFixed(1)}%`, 'Education Progress']} />
          <Line type="monotone" dataKey="educationProgress" stroke="#5B8C7A" name="Education Progress (%)" strokeWidth={2.5} dot={{ r: 3, fill: '#5B8C7A' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

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
    <Box sx={{ bgcolor: '#FFF8F0', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #D4603F 0%, #E8935A 60%, #F5C89A 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          mb: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 1.5,
              textShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            Public Impact Dashboard
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600 }}
          >
            Anonymized data showing Harbor of Hope's impact over time.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* Charts Section */}
        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ mb: { xs: 6, md: 10 } }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={paperSx}
              onClick={() => setExpandedChart({ title: 'Average Health Score Over Time', content: renderHealthChart(500) })}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 700, color: '#2D2D2D' }}>
                Average Health Score Over Time
              </Typography>
              {renderHealthChart(300)}
              <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                Click to expand
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={paperSx}
              onClick={() => setExpandedChart({ title: 'Monthly Donations', content: renderDonationsChart(500) })}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 700, color: '#2D2D2D' }}>
                Monthly Donations
              </Typography>
              {renderDonationsChart(300)}
              <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                Click to expand
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={paperSx}
              onClick={() => setExpandedChart({ title: 'Total Residents Over Time', content: renderResidentsChart(500) })}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 700, color: '#2D2D2D' }}>
                Total Residents Over Time
              </Typography>
              {renderResidentsChart(300)}
              <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                Click to expand
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={paperSx}
              onClick={() => setExpandedChart({ title: 'Education Progress', content: renderEducationChart(500) })}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 700, color: '#2D2D2D' }}>
                Education Progress
              </Typography>
              {renderEducationChart(300)}
              <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                Click to expand
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Expanded Chart Dialog */}
        <Dialog
          open={expandedChart !== null}
          onClose={() => setExpandedChart(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, p: { xs: 1, md: 2 } },
          }}
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

        {/* Recent Snapshots Section */}
        {recentSnapshots.length > 0 && (
          <Box>
            <Typography
              variant="h4"
              component="h2"
              sx={{ mb: 4, fontWeight: 700, color: '#2D2D2D' }}
            >
              Recent Updates
            </Typography>
            <Grid container spacing={{ xs: 4, md: 6 }}>
              {recentSnapshots.map((snapshot, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                      border: 'none',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3.5 }}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{ fontWeight: 700, color: '#2D2D2D', mb: 1 }}
                      >
                        {snapshot.headline ?? 'Update'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', lineHeight: 1.7 }}
                      >
                        {buildSummary(snapshot)}
                      </Typography>
                      {snapshot.snapshotDate && (
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 2,
                            display: 'block',
                            color: '#D4603F',
                            fontWeight: 600,
                          }}
                        >
                          {new Date(snapshot.snapshotDate).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                            }
                          )}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
}
