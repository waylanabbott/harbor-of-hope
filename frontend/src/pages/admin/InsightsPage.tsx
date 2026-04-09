import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
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
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ScienceIcon from '@mui/icons-material/Science';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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
  ReferenceLine,
  Legend,
} from 'recharts';
import ExplanatoryInsightsPage from './ExplanatoryInsightsPage';
import {
  fetchChurnPredictions,
  fetchIncidentRiskPredictions,
  fetchCampaignPredictions,
  type ChurnPredictionRow,
  type IncidentRiskPredictionRow,
  type CampaignPredictionRow,
} from '../../lib/mlApi';

/* ─── Static model metadata (from trained pipelines — doesn't change) ─── */

interface Driver {
  name: string;
  impact: number;
  coefficient: number;
  pValue: number;
  interpretation: string;
  isSignificant: boolean;
}

interface Pipeline {
  id: string;
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

const PIPELINES: Pipeline[] = [
  {
    id: 'churn',
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
    id: 'incident-risk',
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
    id: 'campaign',
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

const PIPELINE_COLORS = ['#E8735A', '#5B8C7A', '#9B59B6'];

function riskChipColor(level: string): 'error' | 'warning' | 'success' {
  if (level === 'High') return 'error';
  if (level === 'Medium') return 'warning';
  return 'success';
}

function modelStrength(r2: number): { label: string; color: string } {
  if (r2 >= 0.7) return { label: 'Strong', color: '#5B8C7A' };
  if (r2 >= 0.4) return { label: 'Moderate', color: '#E8935A' };
  return { label: 'Weak', color: '#E8735A' };
}

/* ─── Campaign: Actual vs Predicted Revenue ─── */

function CampaignPredictor({ data }: { data: CampaignPredictionRow[] }) {
  const [sortBy, setSortBy] = useState<'gap' | 'actual' | 'predicted'>('gap');
  const [postType, setPostType] = useState<string>('All');

  const postTypes = useMemo(() => {
    const types = new Set(data.map((d) => d.postType).filter(Boolean));
    return ['All', ...Array.from(types).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    let posts = postType === 'All' ? data : data.filter((d) => d.postType === postType);
    return posts;
  }, [data, postType]);

  // Chart data sorted by selected criteria
  const chartData = useMemo(() => {
    const mapped = filtered.map((d) => ({
      name: `#${d.postId}`,
      postId: d.postId,
      actual: Math.round(d.estimatedDonationValuePhp),
      predicted: Math.round(d.predictedDonationValuePhp),
      gap: Math.round(d.estimatedDonationValuePhp - d.predictedDonationValuePhp),
      platform: d.platform,
      postType: d.postType,
    }));
    if (sortBy === 'gap') mapped.sort((a, b) => a.gap - b.gap);
    else if (sortBy === 'actual') mapped.sort((a, b) => b.actual - a.actual);
    else mapped.sort((a, b) => b.predicted - a.predicted);
    return mapped;
  }, [filtered, sortBy]);

  // Top 15 extremes for each chart
  const revenueTop15 = useMemo(() => {
    const sorted = [...chartData];
    if (sortBy === 'gap') sorted.sort((a, b) => a.gap - b.gap);
    else if (sortBy === 'actual') sorted.sort((a, b) => b.actual - a.actual);
    else sorted.sort((a, b) => b.predicted - a.predicted);
    return sorted.slice(0, 15);
  }, [chartData, sortBy]);

  const gapTop15 = useMemo(() => {
    const sorted = [...chartData].sort((a, b) => a.gap - b.gap);
    const bottom = sorted.slice(0, 15);
    const top = sorted.slice(-15);
    // Merge and deduplicate, keep sorted by gap
    const merged = new Map<number, typeof chartData[0]>();
    bottom.forEach((d) => merged.set(d.postId, d));
    top.forEach((d) => merged.set(d.postId, d));
    return Array.from(merged.values()).sort((a, b) => a.gap - b.gap);
  }, [chartData]);

  // Summary stats
  const overperforming = chartData.filter((d) => d.gap > 0).length;
  const underperforming = chartData.filter((d) => d.gap < 0).length;
  const biggestOver = chartData.length > 0 ? Math.max(...chartData.map((d) => d.gap)) : 0;
  const biggestUnder = chartData.length > 0 ? Math.min(...chartData.map((d) => d.gap)) : 0;

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, mb: 5, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Actual vs. Predicted Post Revenue
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Compare actual donation revenue against ML-predicted values for each post. Green bars exceeded predictions (overperforming), coral bars fell short (underperforming).
      </Typography>

      {/* Controls */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value as 'gap' | 'actual' | 'predicted')}>
            <MenuItem value="gap">Performance Gap</MenuItem>
            <MenuItem value="actual">Actual Revenue</MenuItem>
            <MenuItem value="predicted">Predicted Revenue</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Post Type</InputLabel>
          <Select value={postType} label="Post Type" onChange={(e) => setPostType(e.target.value)}>
            {postTypes.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="overline" color="text.secondary">Overperforming</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#5B8C7A' }}>{overperforming}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="overline" color="text.secondary">Underperforming</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#E8735A' }}>{underperforming}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="overline" color="text.secondary">Biggest Overperformer</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#5B8C7A' }}>
              +{'\u20B1'}{biggestOver.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="overline" color="text.secondary">Biggest Underperformer</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#E8735A' }}>
              {'\u20B1'}{biggestUnder.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Actual vs Predicted Bar Chart — top 15 extremes */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Revenue by Post — Top 15
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing the 15 most extreme posts. Actual (green) vs. predicted (coral) donation revenue.
      </Typography>
      <Box sx={{ height: 480 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueTop15} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `\u20B1${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={60}
              tick={{ fontSize: 11, fill: '#666' }}
            />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload as { postId: number; actual: number; predicted: number; gap: number; platform: string; postType: string };
                return (
                  <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 6px 18px rgba(0,0,0,0.14)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Post #{d.postId}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {d.platform} &middot; {d.postType}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#5B8C7A' }}>
                      Actual: {'\u20B1'}{d.actual.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#E8735A' }}>
                      Predicted: {'\u20B1'}{d.predicted.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5, color: d.gap >= 0 ? '#5B8C7A' : '#E8735A' }}>
                      {d.gap >= 0 ? '+' : ''}{'\u20B1'}{d.gap.toLocaleString()} ({d.gap >= 0 ? 'over' : 'under'}performing)
                    </Typography>
                  </Paper>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value: string) => <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{value}</span>}
            />
            <Bar dataKey="actual" name="Actual Revenue" fill="#5B8C7A" radius={[0, 4, 4, 0]} barSize={10} />
            <Bar dataKey="predicted" name="Predicted Revenue" fill="#E8735A" radius={[0, 4, 4, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Performance Gap Chart */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Performance Gap
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Top 15 overperformers and top 15 underperformers. Green = exceeded expectations, coral = fell short.
        </Typography>
        <Box sx={{ height: 580 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={gapTop15}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}\u20B1${(v / 1000).toFixed(0)}k`}
              />
              <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11, fill: '#666' }} />
              <ReferenceLine x={0} stroke="#999" strokeWidth={1.5} />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload as { postId: number; actual: number; predicted: number; gap: number };
                  return (
                    <Paper sx={{ p: 1.5, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Post #{d.postId}</Typography>
                      <Typography variant="body2">Actual: {'\u20B1'}{d.actual.toLocaleString()}</Typography>
                      <Typography variant="body2">Predicted: {'\u20B1'}{d.predicted.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: d.gap >= 0 ? '#5B8C7A' : '#E8735A' }}>
                        Gap: {d.gap >= 0 ? '+' : ''}{'\u20B1'}{d.gap.toLocaleString()}
                      </Typography>
                    </Paper>
                  );
                }}
              />
              <Bar dataKey="gap" radius={[4, 4, 4, 4]} barSize={12}>
                {gapTop15.map((entry, i) => (
                  <Cell key={i} fill={entry.gap >= 0 ? '#5B8C7A' : '#E8735A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
}

/* ─── Main Component ─── */

export default function InsightsPage() {
  const [topTab, setTopTab] = useState<'predictive' | 'explanatory'>('predictive');
  const [activeTab, setActiveTab] = useState(0);
  const [showTechnical, setShowTechnical] = useState(false);

  // DB-driven prediction data — each fetched independently so one failure doesn't block others
  const [churnData, setChurnData] = useState<ChurnPredictionRow[]>([]);
  const [riskData, setRiskData] = useState<IncidentRiskPredictionRow[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignPredictionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [churn, risk, campaign] = await Promise.allSettled([
        fetchChurnPredictions(),
        fetchIncidentRiskPredictions(),
        fetchCampaignPredictions(),
      ]);
      if (!cancelled) {
        if (churn.status === 'fulfilled') setChurnData(churn.value);
        if (risk.status === 'fulfilled') setRiskData(risk.value);
        if (campaign.status === 'fulfilled') setCampaignData(campaign.value);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleTopTabChange = (_: unknown, v: 'predictive' | 'explanatory') => {
    setTopTab(v);
    setActiveTab(0);
    setShowTechnical(false);
  };

  const topTabBar = (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
      <ToggleButtonGroup
        value={topTab}
        exclusive
        onChange={(_, v) => { if (v) handleTopTabChange(null, v); }}
        sx={{
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: 'none',
          '& .MuiToggleButton-root': {
            border: 'none',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            px: 4,
            py: 1.5,
            gap: 1,
            borderRadius: '24px !important',
            color: '#6B6B6B',
            '&.Mui-selected': {
              bgcolor: '#D4603F',
              color: 'white',
              '&:hover': { bgcolor: '#C0543A' },
            },
          },
        }}
      >
        <ToggleButton value="predictive">
          <TrendingUpIcon fontSize="small" /> Predictive Models
        </ToggleButton>
        <ToggleButton value="explanatory">
          <ScienceIcon fontSize="small" /> Explanatory Models
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );

  const current = PIPELINES[activeTab];
  const color = PIPELINE_COLORS[activeTab] ?? '#D4603F';
  const strength = modelStrength(current.adjRSquared);

  const chartData = current.drivers.map((d) => ({
    name: d.name,
    coefficient: d.coefficient,
    interpretation: d.interpretation,
  }));

  return (
    <Box sx={{ mt: 4 }}>
      {topTabBar}

      {topTab === 'explanatory' ? (
        <ExplanatoryInsightsPage topTabBar={null} />
      ) : (
      <>
        {/* Pipeline sub-tabs */}
        <Paper sx={{ borderRadius: 3, mb: 5, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => { setActiveTab(v); setShowTechnical(false); }}
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{
              sx: {
                height: 3,
                borderRadius: '3px 3px 0 0',
                backgroundColor: PIPELINE_COLORS[activeTab] ?? '#D4603F',
              },
            }}
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', py: 2 } }}
          >
            {PIPELINES.map((p) => (
              <Tab key={p.id} icon={p.icon} iconPosition="start" label={p.friendlyName} />
            ))}
          </Tabs>
        </Paper>

        {/* Loading / Error */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {/* Key Finding + Feature Chart — only for campaign tab */}
        {current.id === 'campaign' && (
          <>
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
          </>
        )}

        {/* ─── Pipeline-Specific Interactive Section ─── */}
        {!loading && (
          <>
            {/* Donor Churn: High-risk donor list */}
            {current.id === 'churn' && churnData.length > 0 && (
              <Paper sx={{ p: { xs: 3, md: 4 }, mb: 5, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Donors Most Likely to Churn
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Ranked by churn probability predicted by the ML pipeline. Reach out to high-risk donors before they lapse.
                </Typography>
                <TableContainer sx={{ maxHeight: 480 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Donor</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Churn Probability</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Risk Level</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {churnData.slice(0, 25).map((row, i) => (
                        <TableRow key={row.id} sx={{ backgroundColor: row.churnRiskLevel === 'High' ? '#E8735A08' : 'transparent' }}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.supporterName}</Typography>
                            {row.email && (
                              <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                            )}
                          </TableCell>
                          <TableCell>{row.supporterType ?? '—'}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                              {(row.churnProbability * 100).toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={row.churnRiskLevel} color={riskChipColor(row.churnRiskLevel)} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {churnData.length > 25 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    Showing top 25 of {churnData.length} donors
                  </Typography>
                )}
              </Paper>
            )}

            {/* Incident Risk: At-risk residents list */}
            {current.id === 'incident-risk' && riskData.length > 0 && (
              <Paper sx={{ p: { xs: 3, md: 4 }, mb: 5, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Residents at Highest Predicted Risk
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Ranked by incident risk probability from the ML pipeline — not the initial intake risk level. Staff should proactively check on high-risk residents.
                </Typography>
                <TableContainer sx={{ maxHeight: 480 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Resident</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Safehouse</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Risk Probability</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Risk Level</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {riskData.slice(0, 25).map((row, i) => (
                        <TableRow key={row.id} sx={{ backgroundColor: row.riskLevel === 'High' ? '#E8735A08' : 'transparent' }}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.residentCode}</Typography>
                          </TableCell>
                          <TableCell>{row.safehouseName ?? '—'}</TableCell>
                          <TableCell>{row.caseStatus ?? '—'}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                              {(row.riskProbability * 100).toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={row.riskLevel} color={riskChipColor(row.riskLevel)} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {riskData.length > 25 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    Showing top 25 of {riskData.length} residents
                  </Typography>
                )}
              </Paper>
            )}

            {/* Campaign: Interactive Predictor */}
            {current.id === 'campaign' && campaignData.length > 0 && (
              <CampaignPredictor data={campaignData} />
            )}
          </>
        )}

        {/* Recommendations + Technical Details — only for campaign tab */}
        {current.id === 'campaign' && (
          <>
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
                    <Typography variant="overline" color="text.secondary">Sample Size</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color }}>{current.sampleSize}</Typography>
                  </CardContent>
                </Card>
              </Box>

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
          </>
        )}
        </>
      )}
    </Box>
  );
}
