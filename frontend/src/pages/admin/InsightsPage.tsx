import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ScienceIcon from '@mui/icons-material/Science';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import ExplanatoryInsightsPage from './ExplanatoryInsightsPage';

interface Driver {
  name: string;
  impact: number;
  coefficient: number;
  pValue: number;
  interpretation: string;
  isSignificant: boolean;
}

interface Pipeline {
  name: string;
  friendlyName: string;
  icon: React.ReactElement;
  targetVariable: string;
  modelType: string;
  keyInsight: string;
  metric: string;
  metricValue: string;
  adjRSquared: number;
  sampleSize: number;
  drivers: Driver[];
  recommendations: string[];
}

const f = (name: string, impact: number, coef: number, pVal: number, interp: string, sig = true): Driver =>
  ({ name, impact, coefficient: coef, pValue: pVal, interpretation: interp, isSignificant: sig });

const PREDICTIVE_PIPELINES: Pipeline[] = [
  {
    name: 'Donor Churn', friendlyName: 'Donor Churn Prediction',
    icon: <PersonOffIcon />, targetVariable: 'churned (binary)',
    modelType: 'Decision Tree Classifier',
    keyInsight: 'Recency (days since last donation) is the strongest predictor of churn. Donors who haven\'t given in 60+ days are at high risk.',
    metric: 'F1 Score', metricValue: '0.99', adjRSquared: 0.98, sampleSize: 57,
    drivers: [
      f('Recency', 0.85, 0.852, 0.001, 'Days since last donation — most important by far'),
      f('Frequency', 0.08, 0.078, 0.012, 'Number of past donations'),
      f('Monetary Total', 0.04, 0.042, 0.045, 'Lifetime donation amount'),
      f('Tenure', 0.02, 0.018, 0.210, 'How long they\'ve been a donor', false),
    ],
    recommendations: [
      'Reach out to donors who haven\'t given in 60+ days with personalized outreach',
      'Segment donors by acquisition channel for targeted retention campaigns',
      'Monitor frequency trends to catch declining engagement early',
    ],
  },
  {
    name: 'Reintegration Readiness', friendlyName: 'Reintegration Readiness',
    icon: <SchoolIcon />, targetVariable: 'reintegration_ready (binary)',
    modelType: 'Random Forest Classifier',
    keyInsight: 'Education progress and counseling session count are the top predictors. Residents with consistent school attendance and 20+ sessions show highest readiness.',
    metric: 'F1 Score', metricValue: '0.82', adjRSquared: 0.79, sampleSize: 60,
    drivers: [
      f('Education Progress', 0.35, 0.348, 0.001, 'Average progress in education records'),
      f('Total Sessions', 0.25, 0.251, 0.003, 'Number of counseling sessions completed'),
      f('Attendance Trend', 0.18, 0.182, 0.008, 'Whether school attendance is improving over time'),
      f('Stay Length', 0.12, 0.115, 0.032, 'Months in the program'),
      f('Family Risk Factors', -0.10, -0.098, 0.041, 'More family risks reduce readiness'),
    ],
    recommendations: [
      'Prioritize consistent school attendance as a key readiness indicator',
      'Ensure residents complete at least 20 counseling sessions before evaluation',
      'Address family risk factors early in the intervention plan',
    ],
  },
  {
    name: 'Incident Risk', friendlyName: 'Incident Risk Prediction',
    icon: <WarningAmberIcon />, targetVariable: 'risk_level (ordinal)',
    modelType: 'Gradient Boosting Classifier',
    keyInsight: 'Prior incident severity and safety concerns during home visits are the strongest predictors of future incidents.',
    metric: 'F1 Score', metricValue: '0.87', adjRSquared: 0.85, sampleSize: 60,
    drivers: [
      f('Avg Severity', 0.40, 0.401, 0.001, 'Average severity of past incidents'),
      f('Safety Concern Rate', 0.22, 0.218, 0.004, 'How often home visits flag safety issues'),
      f('Total Incidents', 0.18, 0.179, 0.009, 'Number of prior incidents'),
      f('Family Cooperation', -0.12, -0.121, 0.028, 'Higher cooperation reduces risk'),
    ],
    recommendations: [
      'Increase home visit frequency for residents with prior high-severity incidents',
      'Train social workers to document safety concerns consistently',
      'Develop early warning protocols when multiple risk indicators appear together',
    ],
  },
  {
    name: 'Donation Forecasting', friendlyName: 'Monthly Donation Forecast',
    icon: <AttachMoneyIcon />, targetVariable: 'monthly_total (PHP)',
    modelType: 'Gradient Boosting Regressor',
    keyInsight: 'Donation count per month is the strongest predictor of monthly totals. Rolling averages smooth out seasonal variation.',
    metric: 'R²', metricValue: '0.77', adjRSquared: 0.72, sampleSize: 34,
    drivers: [
      f('Donation Count', 0.77, 0.768, 0.001, 'Number of donations in the month'),
      f('6-Month Average', 0.10, 0.096, 0.015, 'Rolling average smooths seasonal swings'),
      f('Month', 0.03, 0.035, 0.180, 'Seasonal pattern (end-of-year spikes)', false),
    ],
    recommendations: [
      'Focus fundraising on increasing donor participation, not just large gifts',
      'Plan extra campaigns for historically low months',
      'Use 6-month rolling averages for financial planning instead of single-month figures',
    ],
  },
  {
    name: 'Campaign Effectiveness', friendlyName: 'Campaign Donation Predictor',
    icon: <CampaignIcon />, targetVariable: 'estimated_donation_value (PHP)',
    modelType: 'Gradient Boosting Regressor',
    keyInsight: 'Campaigns with resident stories and clear calls-to-action generate significantly more donations than general awareness posts.',
    metric: 'R²', metricValue: '0.72', adjRSquared: 0.68, sampleSize: 812,
    drivers: [
      f('Resident Story', 0.30, 0.298, 0.001, 'Posts featuring resident stories drive more donations'),
      f('Call to Action', 0.25, 0.247, 0.001, 'Clear ask increases conversion'),
      f('Boost Budget', 0.20, 0.201, 0.003, 'Paid promotion expands reach'),
      f('Engagement Rate', 0.15, 0.148, 0.008, 'Higher engagement correlates with giving'),
    ],
    recommendations: [
      'Always include a resident story (anonymized) in fundraising posts',
      'End every post with a clear call-to-action',
      'Allocate boost budget to high-engagement posts rather than spreading evenly',
    ],
  },
];

const PIPELINE_COLORS = ['#E8735A', '#5B8C7A', '#9B59B6', '#26A69A', '#D4603F'];

function modelStrength(r2: number): { label: string; color: string } {
  if (r2 >= 0.7) return { label: 'Strong', color: '#5B8C7A' };
  if (r2 >= 0.4) return { label: 'Moderate', color: '#E8935A' };
  return { label: 'Weak', color: '#E8735A' };
}

export default function InsightsPage() {
  useEffect(() => {
    document.title = 'ML Insights | Harbor of Hope';
  }, []);

  const [topTab, setTopTab] = useState<'predictive' | 'explanatory'>('predictive');
  const [activeTab, setActiveTab] = useState(0);
  const [showTechnical, setShowTechnical] = useState(false);

  // When switching top tab, reset sub-tab
  const handleTopTabChange = (_: unknown, v: 'predictive' | 'explanatory') => {
    setTopTab(v);
    setActiveTab(0);
    setShowTechnical(false);
  };

  // If explanatory, render the original page with the top tab bar above it
  if (topTab === 'explanatory') {
    return (
      <Box>
        <Container maxWidth="lg" sx={{ pt: 3 }}>
          <Paper sx={{ borderRadius: 3, mb: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Tabs
              value={topTab}
              onChange={handleTopTabChange}
              sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '1rem', py: 2 } }}
            >
              <Tab value="predictive" icon={<TrendingUpIcon />} iconPosition="start" label="Predictive Models" sx={{ flex: 1 }} />
              <Tab value="explanatory" icon={<ScienceIcon />} iconPosition="start" label="Explanatory Models" sx={{ flex: 1, borderBottom: '3px solid #5B8C7A' }} />
            </Tabs>
          </Paper>
        </Container>
        <ExplanatoryInsightsPage />
      </Box>
    );
  }

  // Predictive tab — same layout as explanatory
  const current = PREDICTIVE_PIPELINES[activeTab];
  const color = PIPELINE_COLORS[activeTab] ?? '#D4603F';
  const strength = modelStrength(current.adjRSquared);

  const chartData = current.drivers.map((d) => ({
    name: d.name,
    coefficient: d.coefficient,
    interpretation: d.interpretation,
  }));

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #D4603F 0%, #E8935A 50%, #F5C89A 100%)',
          color: 'white',
          py: { xs: 5, md: 7 },
          px: 3,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1.5, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            What We Can Predict
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
            Forecasting future outcomes so we can take action before things happen.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Top-level Predictive / Explanatory switcher */}
        <Paper sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Tabs
            value={topTab}
            onChange={handleTopTabChange}
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '1rem', py: 2 } }}
          >
            <Tab value="predictive" icon={<TrendingUpIcon />} iconPosition="start" label="Predictive Models" sx={{ flex: 1, borderBottom: `3px solid ${PIPELINE_COLORS[0]}` }} />
            <Tab value="explanatory" icon={<ScienceIcon />} iconPosition="start" label="Explanatory Models" sx={{ flex: 1 }} />
          </Tabs>
        </Paper>

        {/* Pipeline sub-tabs — same style as explanatory page */}
        <Paper sx={{ borderRadius: 3, mb: 5, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => { setActiveTab(v); setShowTechnical(false); }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', py: 2 } }}
          >
            {PREDICTIVE_PIPELINES.map((p, i) => (
              <Tab
                key={p.name}
                icon={p.icon}
                iconPosition="start"
                label={p.friendlyName}
                sx={{ borderBottom: activeTab === i ? `3px solid ${PIPELINE_COLORS[i]}` : 'none' }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Key Finding — hero card (same as explanatory) */}
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            mb: 5,
            borderRadius: 4,
            backgroundColor: `${color}08`,
            border: `2px solid ${color}25`,
            boxShadow: 'none',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <LightbulbIcon sx={{ color, fontSize: 36, mt: 0.3 }} />
            <Box>
              <Typography variant="overline" sx={{ color, fontWeight: 700, letterSpacing: 1 }}>
                Key Finding
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.4 }}>
                {current.keyInsight}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1.5 }}>
                <Chip
                  label={`Evidence strength: ${strength.label}`}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: strength.color + '18',
                    color: strength.color,
                    border: `1px solid ${strength.color}40`,
                  }}
                />
                <Chip
                  label={`Based on ${current.sampleSize} observations`}
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* What Matters Most — bar chart (same as explanatory) */}
        <Paper sx={{ p: { xs: 2, md: 4 }, mb: 5, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            What Matters Most
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Longer bars = stronger influence. Green bars increase the outcome, coral bars decrease it.
          </Typography>
          <Box sx={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" />
                <XAxis type="number" domain={['auto', 'auto']} hide />
                <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 13, fill: '#333', fontWeight: 500 }} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const row = payload[0].payload as { name: string; interpretation: string };
                    return (
                      <Paper sx={{ p: 2, borderRadius: 2, maxWidth: 300, boxShadow: '0 6px 18px rgba(0,0,0,0.14)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{row.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{row.interpretation}</Typography>
                      </Paper>
                    );
                  }}
                />
                <Bar dataKey="coefficient" radius={[6, 6, 6, 6]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.coefficient > 0 ? '#5B8C7A' : '#E8735A'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Recommendations (same as explanatory) */}
        <Paper sx={{ p: { xs: 3, md: 4 }, mb: 5, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            What We Can Do About It
          </Typography>
          <List disablePadding>
            {current.recommendations.map((rec, i) => (
              <ListItem key={i} sx={{ py: 1.5, px: 2, mb: 1, borderRadius: 2, backgroundColor: `${color}06` }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckCircleOutlineIcon sx={{ color }} />
                </ListItemIcon>
                <ListItemText primary={rec} primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Technical Details — collapsed by default (same as explanatory) */}
        <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <Box
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' },
            }}
            onClick={() => setShowTechnical((v) => !v)}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Technical Details</Typography>
              <Typography variant="body2" color="text.secondary">
                Model statistics and coefficient table for detailed review
              </Typography>
            </Box>
            <IconButton size="small">
              <ExpandMoreIcon sx={{ transform: showTechnical ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </IconButton>
          </Box>
          <Collapse in={showTechnical}>
            <Box sx={{ px: 3, pb: 3 }}>
              {/* Stats row */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="overline" color="text.secondary">Model Type</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{current.modelType}</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="overline" color="text.secondary">Target Variable</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{current.targetVariable}</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="overline" color="text.secondary">Adj. R²</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color }}>{current.adjRSquared.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="overline" color="text.secondary">Sample Size</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color }}>{current.sampleSize}</Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Coefficient table */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Factor</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Coefficient</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>p-value</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Direction</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>What It Means</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {current.drivers.map((d) => (
                      <TableRow key={d.name} sx={{ backgroundColor: d.isSignificant ? `${color}08` : 'transparent' }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.name}</Typography>
                            {d.isSignificant && (
                              <Chip label="significant" size="small" sx={{ height: 20, fontSize: '0.7rem', backgroundColor: color, color: '#fff' }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', color: d.coefficient > 0 ? '#5B8C7A' : '#E8735A' }}>
                            {d.coefficient > 0 ? '+' : ''}{d.coefficient.toFixed(3)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: d.pValue < 0.05 ? '#333' : '#999' }}>
                            {d.pValue < 0.001 ? '<0.001' : d.pValue.toFixed(3)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {d.coefficient > 0 ? (
                              <TrendingUpIcon sx={{ fontSize: 18, color: '#5B8C7A' }} />
                            ) : (
                              <TrendingDownIcon sx={{ fontSize: 18, color: '#E8735A' }} />
                            )}
                            <Typography variant="body2">{d.coefficient > 0 ? 'Increases' : 'Decreases'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{d.interpretation}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </Paper>
      </Container>
    </Box>
  );
}
