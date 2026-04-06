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
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
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
import { fetchMlPrediction } from '../../lib/mlApi';
import type {
  DonationTrend,
  ResidentOutcome,
  SafehouseComparison,
  MlPredictionResponse,
} from '../../types/Reports';

const PIE_COLORS = ['#5B8C7A', '#E8735A', '#5B9BD5', '#E6A817', '#9B59B6'];

export default function ReportsPage() {
  const [donationTrends, setDonationTrends] = useState<DonationTrend[]>([]);
  const [residentOutcomes, setResidentOutcomes] = useState<ResidentOutcome[]>(
    []
  );
  const [safehouseComparison, setSafehouseComparison] = useState<
    SafehouseComparison[]
  >([]);
  const [socialMediaPrediction, setSocialMediaPrediction] =
    useState<MlPredictionResponse | null>(null);
  const [counselingPrediction, setCounselingPrediction] =
    useState<MlPredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mlSocialError, setMlSocialError] = useState(false);
  const [mlCounselingError, setMlCounselingError] = useState(false);

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
          fetchMlPrediction('social-media', {
            platform: 'Facebook',
            post_type: 'Photo',
            media_type: 'Image',
            has_cta: 1,
            day_of_week: 3,
            hour_posted: 14,
          }),
          fetchMlPrediction('counseling', {
            session_type: 'Individual',
            intervention_used: 1,
            session_duration_minutes: 60,
            emotional_state_start: 3,
            topics_discussed_count: 4,
          }),
        ]);

        if (cancelled) return;

        // Handle each result individually
        if (results[0].status === 'fulfilled') {
          setDonationTrends(results[0].value);
        }
        if (results[1].status === 'fulfilled') {
          setResidentOutcomes(results[1].value);
        }
        if (results[2].status === 'fulfilled') {
          setSafehouseComparison(results[2].value);
        }
        if (results[3].status === 'fulfilled') {
          setSocialMediaPrediction(results[3].value);
        } else {
          setMlSocialError(true);
        }
        if (results[4].status === 'fulfilled') {
          setCounselingPrediction(results[4].value);
        } else {
          setMlCounselingError(true);
        }

        // Set top-level error only if all 3 report APIs failed
        const reportsFailed = [results[0], results[1], results[2]].every(
          (r) => r.status === 'rejected'
        );
        if (reportsFailed) {
          setError('Failed to load report data. Please try again later.');
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'An unexpected error occurred.'
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
        Reports and Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Data-driven insights and ML-powered recommendations
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Row 1: Donation Trends + Resident Outcomes */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Donation Trends Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={donationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v: number) =>
                    `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                  }
                />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Amount ($)')
                      return [`$${value.toLocaleString()}`, name];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar
                  dataKey="totalAmount"
                  yAxisId="left"
                  fill="#E8735A"
                  name="Amount ($)"
                  barSize={20}
                />
                <Line
                  dataKey="donationCount"
                  yAxisId="right"
                  stroke="#5B8C7A"
                  name="# Donations"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reintegration Status
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={residentOutcomes}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {residentOutcomes.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Row 2: Safehouse Comparison */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Safehouse Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={safehouseComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="avgHealthScore"
                  fill="#5B8C7A"
                  name="Avg Health Score"
                />
                <Bar
                  dataKey="avgEducationProgress"
                  fill="#5B9BD5"
                  name="Avg Education Progress"
                />
                <Bar
                  dataKey="totalIncidents"
                  fill="#E8735A"
                  name="Total Incidents"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Row 3: ML Insight Cards */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TipsAndUpdatesIcon
                  sx={{ mr: 1, color: '#E6A817', fontSize: 28 }}
                />
                <Typography variant="h6">
                  Social Media Posting Recommendations
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                ML-powered insights from post effectiveness analysis
              </Typography>

              {mlSocialError ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  ML predictions unavailable -- ensure Flask API is running on
                  port 5050
                </Alert>
              ) : socialMediaPrediction === null ? (
                <>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="rectangular" height={120} sx={{ mt: 1 }} />
                </>
              ) : (
                <>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, mb: 2, color: '#5B8C7A' }}
                  >
                    Predicted Engagement Score:{' '}
                    {socialMediaPrediction.prediction[0].toFixed(1)}
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Posts with images outperform text-only posts" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Including a call-to-action increases engagement" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Mid-week posts (Tue-Thu) tend to perform better" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Afternoon posting (2-4 PM) shows higher reach" />
                    </ListItem>
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PsychologyIcon
                  sx={{ mr: 1, color: '#9B59B6', fontSize: 28 }}
                />
                <Typography variant="h6">
                  Counseling Effectiveness Insights
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                ML-powered analysis of session outcomes
              </Typography>

              {mlCounselingError ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  ML predictions unavailable -- ensure Flask API is running on
                  port 5050
                </Alert>
              ) : counselingPrediction === null ? (
                <>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="rectangular" height={120} sx={{ mt: 1 }} />
                </>
              ) : (
                <>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, mb: 2, color: '#5B8C7A' }}
                  >
                    Predicted Emotional Improvement:{' '}
                    {counselingPrediction.prediction[0].toFixed(2)} points
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Individual sessions show stronger emotional improvement than group sessions" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Sessions using structured interventions have measurably better outcomes" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Longer sessions (45-60 min) correlate with greater improvement" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Starting emotional state is the strongest predictor of improvement magnitude" />
                    </ListItem>
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
