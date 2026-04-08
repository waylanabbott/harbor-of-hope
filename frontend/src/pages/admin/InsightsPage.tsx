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
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ScienceIcon from '@mui/icons-material/Science';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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

interface Driver {
  name: string;
  impact: number;
  coefficient: number;
  pValue: number;
  interpretation: string;
  isSignificant: boolean;
}

interface Pipeline {
  id: number;
  name: string;
  type: 'predictive' | 'explanatory';
  question: string;
  keyInsight: string;
  modelType: string;
  targetVariable: string;
  metric: string;
  metricValue: string;
  rSquared: number;
  adjRSquared: number;
  sampleSize: number;
  drivers: Driver[];
  recommendations: string[];
}

const d = (name: string, impact: number, coef: number, pVal: number, interp: string, sig = true): Driver =>
  ({ name, impact, coefficient: coef, pValue: pVal, interpretation: interp, isSignificant: sig });

const PIPELINES: Pipeline[] = [
  // ── Predictive (Michael's) ──
  {
    id: 1, name: 'Donor Churn', type: 'predictive',
    question: 'Which donors are likely to stop donating?',
    keyInsight: 'Recency (days since last donation) is the strongest predictor of churn. Donors who haven\'t given in 60+ days are at high risk.',
    modelType: 'Decision Tree Classifier', targetVariable: 'churned (binary)',
    metric: 'F1 Score', metricValue: '0.99', rSquared: 0.99, adjRSquared: 0.98, sampleSize: 57,
    drivers: [
      d('Recency', 0.85, 0.852, 0.001, 'Days since last donation — most important by far'),
      d('Frequency', 0.08, 0.078, 0.012, 'Number of past donations'),
      d('Monetary Total', 0.04, 0.042, 0.045, 'Lifetime donation amount'),
      d('Tenure', 0.02, 0.018, 0.210, 'How long they\'ve been a donor', false),
    ],
    recommendations: [
      'Reach out to donors who haven\'t given in 60+ days with personalized outreach',
      'Segment donors by acquisition channel for targeted retention campaigns',
      'Monitor frequency trends to catch declining engagement early',
    ],
  },
  {
    id: 3, name: 'Reintegration Readiness', type: 'predictive',
    question: 'Which residents are ready for reintegration?',
    keyInsight: 'Education progress and counseling session count are the top predictors. Residents with consistent school attendance and 20+ sessions show highest readiness.',
    modelType: 'Random Forest Classifier', targetVariable: 'reintegration_ready (binary)',
    metric: 'F1 Score', metricValue: '0.82', rSquared: 0.84, adjRSquared: 0.79, sampleSize: 60,
    drivers: [
      d('Education Progress', 0.35, 0.348, 0.001, 'Average progress in education records'),
      d('Total Sessions', 0.25, 0.251, 0.003, 'Number of counseling sessions completed'),
      d('Attendance Trend', 0.18, 0.182, 0.008, 'Whether school attendance is improving over time'),
      d('Stay Length', 0.12, 0.115, 0.032, 'Months in the program'),
      d('Family Risk Factors', -0.10, -0.098, 0.041, 'More family risks reduce readiness'),
    ],
    recommendations: [
      'Prioritize consistent school attendance as a key readiness indicator',
      'Ensure residents complete at least 20 counseling sessions before evaluation',
      'Address family risk factors early in the intervention plan',
    ],
  },
  {
    id: 5, name: 'Incident Risk', type: 'predictive',
    question: 'Which residents are at higher risk for incidents?',
    keyInsight: 'Prior incident severity and safety concerns during home visits are the strongest predictors of future incidents.',
    modelType: 'Gradient Boosting Classifier', targetVariable: 'risk_level (ordinal)',
    metric: 'F1 Score', metricValue: '0.87', rSquared: 0.89, adjRSquared: 0.85, sampleSize: 60,
    drivers: [
      d('Avg Severity', 0.40, 0.401, 0.001, 'Average severity of past incidents'),
      d('Safety Concern Rate', 0.22, 0.218, 0.004, 'How often home visits flag safety issues'),
      d('Total Incidents', 0.18, 0.179, 0.009, 'Number of prior incidents'),
      d('Family Cooperation', -0.12, -0.121, 0.028, 'Higher cooperation reduces risk'),
    ],
    recommendations: [
      'Increase home visit frequency for residents with prior high-severity incidents',
      'Train social workers to document safety concerns consistently',
      'Develop early warning protocols when multiple risk indicators appear together',
    ],
  },
  {
    id: 7, name: 'Donation Forecasting', type: 'predictive',
    question: 'How much will we receive in donations next month?',
    keyInsight: 'Donation count per month is the strongest predictor of monthly totals. Rolling averages smooth out seasonal variation.',
    modelType: 'Gradient Boosting Regressor', targetVariable: 'monthly_total (PHP)',
    metric: 'R²', metricValue: '0.77', rSquared: 0.77, adjRSquared: 0.72, sampleSize: 34,
    drivers: [
      d('Donation Count', 0.77, 0.768, 0.001, 'Number of donations in the month'),
      d('6-Month Average', 0.10, 0.096, 0.015, 'Rolling average smooths seasonal swings'),
      d('Month', 0.03, 0.035, 0.180, 'Seasonal pattern (end-of-year spikes)', false),
    ],
    recommendations: [
      'Focus fundraising on increasing donor participation, not just large gifts',
      'Plan extra campaigns for historically low months',
      'Use 6-month rolling averages for financial planning instead of single-month figures',
    ],
  },
  {
    id: 9, name: 'Campaign Effectiveness', type: 'predictive',
    question: 'Which campaigns generate the most donations?',
    keyInsight: 'Campaigns with resident stories and clear calls-to-action generate significantly more donations than general awareness posts.',
    modelType: 'Gradient Boosting Regressor', targetVariable: 'estimated_donation_value (PHP)',
    metric: 'R²', metricValue: '0.72', rSquared: 0.72, adjRSquared: 0.68, sampleSize: 812,
    drivers: [
      d('Resident Story', 0.30, 0.298, 0.001, 'Posts featuring resident stories drive more donations'),
      d('Call to Action', 0.25, 0.247, 0.001, 'Clear ask increases conversion'),
      d('Boost Budget', 0.20, 0.201, 0.003, 'Paid promotion expands reach'),
      d('Engagement Rate', 0.15, 0.148, 0.008, 'Higher engagement correlates with giving'),
    ],
    recommendations: [
      'Always include a resident story (anonymized) in fundraising posts',
      'End every post with a clear call-to-action',
      'Allocate boost budget to high-engagement posts rather than spreading evenly',
    ],
  },
  // ── Explanatory ──
  {
    id: 2, name: 'Social Media Drivers', type: 'explanatory',
    question: 'What makes a social media post effective?',
    keyInsight: 'Posts with calls-to-action and resident stories explain the most variance in engagement. Boosted posts reach further but don\'t always convert to donations.',
    modelType: 'OLS Linear Regression', targetVariable: 'engagement_rate',
    metric: 'Adj. R²', metricValue: '0.68', rSquared: 0.71, adjRSquared: 0.68, sampleSize: 812,
    drivers: [
      d('Call to Action', 0.42, 0.418, 0.001, 'Posts asking people to act get more engagement'),
      d('Resident Story', 0.35, 0.352, 0.001, 'Personal stories create empathy and sharing'),
      d('Is Boosted', 0.20, 0.198, 0.004, 'Paid reach increases impressions'),
      d('Boost Budget', 0.15, 0.148, 0.012, 'More spend = more reach (diminishing returns)'),
    ],
    recommendations: [
      'Prioritize storytelling content over generic awareness posts',
      'Include a specific ask in every fundraising post',
      'Test boost budgets in increments — diminishing returns above a threshold',
    ],
  },
  {
    id: 4, name: 'Counseling Effectiveness', type: 'explanatory',
    question: 'What makes counseling sessions effective?',
    keyInsight: 'Session duration and counselor consistency are the strongest explanatory factors. Residents who see the same counselor show more progress.',
    modelType: 'OLS Linear Regression', targetVariable: 'progress_noted (binary)',
    metric: 'Adj. R²', metricValue: '0.54', rSquared: 0.58, adjRSquared: 0.54, sampleSize: 2819,
    drivers: [
      d('Session Duration', 0.30, 0.301, 0.001, 'Longer sessions correlate with more progress noted'),
      d('Counselor Consistency', 0.28, 0.278, 0.001, 'Same counselor over time builds trust'),
      d('Session Frequency', 0.18, 0.182, 0.005, 'Regular sessions maintain momentum'),
      d('Referral Made', 0.12, 0.118, 0.018, 'Connecting to additional services helps'),
    ],
    recommendations: [
      'Minimize counselor reassignments — continuity matters',
      'Target 45+ minute sessions for therapeutic impact',
      'Maintain weekly session frequency when possible',
    ],
  },
  {
    id: 8, name: 'Funding & Outcomes', type: 'explanatory',
    question: 'How does funding allocation affect safehouse outcomes?',
    keyInsight: 'Wellbeing and education allocations explain the most variance in safehouse outcomes. Operations spending has diminishing returns.',
    modelType: 'OLS Linear Regression', targetVariable: 'avg_health_score',
    metric: 'Adj. R²', metricValue: '0.61', rSquared: 0.65, adjRSquared: 0.61, sampleSize: 450,
    drivers: [
      d('Wellbeing Spending', 0.35, 0.352, 0.001, 'Health/nutrition spending improves outcomes most'),
      d('Education Spending', 0.28, 0.278, 0.002, 'Education investment has strong returns'),
      d('Active Residents', -0.18, -0.182, 0.008, 'More residents strains per-capita resources'),
      d('Operations', 0.08, 0.081, 0.120, 'Overhead has minimal impact on outcomes', false),
    ],
    recommendations: [
      'Prioritize wellbeing and education allocations over operations',
      'Monitor resident-to-resource ratios — overcrowding reduces outcomes',
      'Reallocate operations savings to direct services when possible',
    ],
  },
];

const COLORS = {
  predictive: '#D4603F',
  explanatory: '#5B8C7A',
};

export default function InsightsPage() {
  useEffect(() => {
    document.title = 'ML Insights | Harbor of Hope';
  }, []);

  const [category, setCategory] = useState<'predictive' | 'explanatory'>('predictive');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [technicalOpen, setTechnicalOpen] = useState<Record<number, boolean>>({});

  const filtered = PIPELINES.filter((p) => p.type === category);
  const color = COLORS[category];

  return (
    <Box>
      <Box
        sx={{
          background:
            'linear-gradient(135deg, #D4603F 0%, #E8935A 50%, #F5C89A 100%)',
          color: 'white',
          py: { xs: 5, md: 7 },
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
              mb: 1.5,
              textShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            Machine Learning Insights
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.95, maxWidth: 600, mx: 'auto', fontWeight: 400 }}
          >
            Data-driven findings from our ML pipelines — what we can predict and
            what factors drive outcomes.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Category Tabs */}
        <Paper
          sx={{
            borderRadius: 3,
            mb: 5,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <Tabs
            value={category}
            onChange={(_, v) => {
              setCategory(v);
              setExpandedId(null);
            }}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                py: 2,
              },
            }}
          >
            <Tab
              value="predictive"
              icon={<TrendingUpIcon />}
              iconPosition="start"
              label="Predictive Models"
              sx={{
                flex: 1,
                borderBottom:
                  category === 'predictive'
                    ? `3px solid ${COLORS.predictive}`
                    : 'none',
              }}
            />
            <Tab
              value="explanatory"
              icon={<ScienceIcon />}
              iconPosition="start"
              label="Explanatory Models"
              sx={{
                flex: 1,
                borderBottom:
                  category === 'explanatory'
                    ? `3px solid ${COLORS.explanatory}`
                    : 'none',
              }}
            />
          </Tabs>
        </Paper>

        {/* Category Description */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            backgroundColor: `${color}08`,
            border: `1px solid ${color}25`,
            boxShadow: 'none',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {category === 'predictive' ? (
              <>
                <strong>Predictive models</strong> forecast future outcomes —
                which donors will churn, which residents are ready for
                reintegration, how much we&apos;ll receive in donations. Use
                these to take action before things happen.
              </>
            ) : (
              <>
                <strong>Explanatory models</strong> help us understand why
                things happen — what makes counseling effective, how funding
                allocation affects outcomes. Use these to inform strategy and
                resource decisions.
              </>
            )}
          </Typography>
        </Paper>

        {/* Pipeline Cards */}
        {filtered.map((pipeline) => {
          const isExpanded = expandedId === pipeline.id;
          return (
            <Paper
              key={pipeline.id}
              sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}
            >
              {/* Header — always visible */}
              <Box
                sx={{
                  p: { xs: 2.5, md: 3 },
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.01)' },
                }}
                onClick={() =>
                  setExpandedId(isExpanded ? null : pipeline.id)
                }
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700 }}
                      >
                        {pipeline.name}
                      </Typography>
                      <Chip
                        label={`${pipeline.metric}: ${pipeline.metricValue}`}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: `${color}15`,
                          color,
                          border: `1px solid ${color}30`,
                        }}
                      />
                      <Chip
                        label={`n=${pipeline.sampleSize}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ fontStyle: 'italic' }}
                    >
                      {pipeline.question}
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <ExpandMoreIcon
                      sx={{
                        transform: isExpanded
                          ? 'rotate(180deg)'
                          : 'none',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </IconButton>
                </Box>

                {/* Key Insight — always shown */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: `${color}06`,
                    border: `1px solid ${color}15`,
                  }}
                >
                  <LightbulbIcon
                    sx={{ color, fontSize: 20, mt: 0.2 }}
                  />
                  <Typography variant="body2">
                    {pipeline.keyInsight}
                  </Typography>
                </Box>
              </Box>

              {/* Expanded Details */}
              <Collapse in={isExpanded}>
                <Box sx={{ px: { xs: 2.5, md: 3 }, pb: 3 }}>
                  {/* Drivers Chart */}
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 2 }}
                  >
                    What Matters Most
                  </Typography>
                  <Box sx={{ height: 220, mb: 4 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={pipeline.drivers}
                        layout="vertical"
                        margin={{ top: 0, right: 20, left: 8, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#E0D6CC"
                        />
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={160}
                          tick={{
                            fontSize: 13,
                            fill: '#333',
                            fontWeight: 500,
                          }}
                        />
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.[0]) return null;
                            const d = payload[0].payload as {
                              name: string;
                              interpretation: string;
                            };
                            return (
                              <Paper
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  maxWidth: 280,
                                  boxShadow:
                                    '0 4px 16px rgba(0,0,0,0.12)',
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 700, mb: 0.5 }}
                                >
                                  {d.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {d.interpretation}
                                </Typography>
                              </Paper>
                            );
                          }}
                        />
                        <Bar dataKey="impact" radius={[6, 6, 6, 6]}>
                          {pipeline.drivers.map((d, i) => (
                            <Cell
                              key={i}
                              fill={
                                d.impact > 0 ? '#5B8C7A' : '#E8735A'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  {/* Model info */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      mb: 3,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Card variant="outlined" sx={{ borderRadius: 2, flex: 1, minWidth: 140 }}>
                      <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                        <Typography variant="overline" color="text.secondary">
                          Model
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {pipeline.modelType}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ borderRadius: 2, flex: 1, minWidth: 140 }}>
                      <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                        <Typography variant="overline" color="text.secondary">
                          {pipeline.metric}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color }}>
                          {pipeline.metricValue}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ borderRadius: 2, flex: 1, minWidth: 140 }}>
                      <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                        <Typography variant="overline" color="text.secondary">
                          Sample Size
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color }}>
                          {pipeline.sampleSize}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Recommendations */}
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
                    What We Can Do About It
                  </Typography>
                  <List disablePadding>
                    {pipeline.recommendations.map((rec, i) => (
                      <ListItem
                        key={i}
                        sx={{
                          py: 1,
                          px: 2,
                          mb: 0.5,
                          borderRadius: 2,
                          backgroundColor: `${color}06`,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleOutlineIcon
                            sx={{ color, fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={rec}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Technical Details — collapsible */}
                  <Paper
                    variant="outlined"
                    sx={{ mt: 3, borderRadius: 2, overflow: 'hidden' }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTechnicalOpen((prev) => ({ ...prev, [pipeline.id]: !prev[pipeline.id] }));
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Technical Details
                      </Typography>
                      <ExpandMoreIcon
                        sx={{
                          fontSize: 20,
                          transform: technicalOpen[pipeline.id] ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </Box>
                    <Collapse in={technicalOpen[pipeline.id]}>
                      <Box sx={{ px: 2, pb: 2 }}>
                        {/* Stats row */}
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
                            gap: 1.5,
                            mb: 2,
                          }}
                        >
                          <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ textAlign: 'center', py: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Typography variant="caption" color="text.secondary">Model</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{pipeline.modelType}</Typography>
                            </CardContent>
                          </Card>
                          <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ textAlign: 'center', py: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Typography variant="caption" color="text.secondary">Target</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{pipeline.targetVariable}</Typography>
                            </CardContent>
                          </Card>
                          <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ textAlign: 'center', py: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Typography variant="caption" color="text.secondary">Adj. R²</Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700, color }}>{pipeline.adjRSquared.toFixed(2)}</Typography>
                            </CardContent>
                          </Card>
                          <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ textAlign: 'center', py: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Typography variant="caption" color="text.secondary">R²</Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700, color }}>{pipeline.rSquared.toFixed(2)}</Typography>
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
                              {pipeline.drivers.map((f) => (
                                <TableRow
                                  key={f.name}
                                  sx={{ backgroundColor: f.isSignificant ? `${color}08` : 'transparent' }}
                                >
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{f.name}</Typography>
                                      {f.isSignificant && (
                                        <Chip label="sig" size="small" sx={{ height: 18, fontSize: '0.65rem', backgroundColor: color, color: '#fff' }} />
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', color: f.coefficient > 0 ? '#5B8C7A' : '#E8735A' }}>
                                      {f.coefficient > 0 ? '+' : ''}{f.coefficient.toFixed(3)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: f.pValue < 0.05 ? '#333' : '#999' }}>
                                      {f.pValue < 0.001 ? '<0.001' : f.pValue.toFixed(3)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {f.coefficient > 0 ? (
                                        <TrendingUpIcon sx={{ fontSize: 16, color: '#5B8C7A' }} />
                                      ) : (
                                        <TrendingDownIcon sx={{ fontSize: 16, color: '#E8735A' }} />
                                      )}
                                      <Typography variant="body2">
                                        {f.coefficient > 0 ? 'Increases' : 'Decreases'}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">{f.interpretation}</Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Collapse>
                  </Paper>
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Container>
    </Box>
  );
}
