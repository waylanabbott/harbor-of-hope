import { useEffect, useState } from 'react';
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
} from '@mui/material';
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

export default function PublicImpactPage() {
  const [snapshots, setSnapshots] = useState<ImpactSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        Public Impact Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Anonymized data showing Harbor of Hope's impact over time.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Average Health Score Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avgHealthScore"
                  stroke="#5B8C7A"
                  name="Avg Health Score"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly Donations
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="donationsTotal"
                  fill="#E8735A"
                  name="Donations ($)"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Total Residents Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="totalResidents"
                  stroke="#E8735A"
                  name="Total Residents"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Education Progress
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="educationProgress"
                  stroke="#5B8C7A"
                  name="Education Progress (%)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Snapshots Section */}
      {recentSnapshots.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Recent Updates
          </Typography>
          <Grid container spacing={2}>
            {recentSnapshots.map((snapshot, index) => (
              <Grid size={{ xs: 12 }} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">
                      {snapshot.headline ?? 'Update'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {snapshot.summaryText}
                    </Typography>
                    {snapshot.snapshotDate && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block' }}
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
  );
}
