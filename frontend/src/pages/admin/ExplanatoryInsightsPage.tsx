import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CampaignIcon from '@mui/icons-material/Campaign';
import SchoolIcon from '@mui/icons-material/School';
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
import {
  fetchExplanatoryInsights,
  type ExplanatoryPipeline,
} from '../../lib/explanatoryApi';

const PIPELINE_COLORS = ['#E8735A', '#5B8C7A', '#9B59B6', '#26A69A'];

const PIPELINE_ICONS = [
  <HomeIcon key="visit" />,
  <FavoriteIcon key="counsel" />,
  <CampaignIcon key="social" />,
  <SchoolIcon key="edu" />,
];

const PIPELINE_FRIENDLY_NAMES: Record<string, string> = {
  'Home Visit Outcome Drivers': 'Visit Success Factors',
  'Counseling Session Effectiveness': 'Session Effectiveness',
  'Social Media Engagement Factors': 'What Drives Engagement',
  'Safehouse Resources & Health Outcomes': 'Resources & Health',
};

const FEATURE_LABELS: Record<string, string> = {
  'Family Cooperation': 'Family Cooperation',
  'Safety Concerns Noted': 'Safety Concerns',
  'Family Members Present': 'Family Members Present',
  'Visit Sequence Number': 'Visit Number',
  'Individual Session (vs Group)': 'Individual Session',
  'Session Duration (minutes)': 'Session Duration',
  'Session Sequence Number': 'Session Number',
  'Concerns Flagged': 'Concerns Flagged',
  'Referral Made': 'Referral Made',
  'Starting Emotional State': 'Starting Emotion',
  'Call-to-Action Included': 'Call-to-Action',
  'Resident Story Featured': 'Resident Story',
  'Post Boosted (paid)': 'Boosted Post',
  'Number of Hashtags': 'Hashtag Count',
  'Caption Length': 'Caption Length',
  'Posting Hour': 'Post Time',
  'Counseling Sessions': 'Counseling Sessions',
  'Home Visits': 'Home Visits',
  'Incidents Reported': 'Incidents',
  'Active Residents': 'Active Residents',
  'Education Funding': 'Education Funding',
  'Wellbeing Funding': 'Wellbeing Funding',
  'Operations Funding': 'Operations Funding',
  'Transport Funding': 'Transport Funding',
  'Outreach Funding': 'Outreach Funding',
  'Maintenance Funding': 'Maintenance Funding',
};

const FEATURE_GLOSSARY: Record<string, { title: string; description: string }> = {
  // Pipeline 1 — Home Visits
  'Family Cooperation': {
    title: 'Family Cooperation Level',
    description:
      'How cooperative the family was during the home visit, rated from Uncooperative (1) to Highly Cooperative (4). Higher cooperation strongly predicts better visit outcomes.',
  },
  'Safety Concerns Noted': {
    title: 'Safety Concerns',
    description:
      'Whether the social worker noted safety concerns during the visit. When present, visits are less likely to have favorable outcomes.',
  },
  'Family Members Present': {
    title: 'Family Members Present',
    description:
      'The number of family members who attended the visit. More family involvement reflects engagement with the reintegration process.',
  },
  'Visit Sequence Number': {
    title: 'Visit Number in Series',
    description:
      'How many visits have occurred for this resident so far. Later visits may benefit from an established relationship between the social worker and family.',
  },
  // Pipeline 2 — Counseling
  'Individual Session (vs Group)': {
    title: 'Individual vs Group Session',
    description:
      'Whether the session was one-on-one (Individual) or in a group setting. Individual sessions allow personalized attention.',
  },
  'Session Duration (minutes)': {
    title: 'Session Duration',
    description:
      'How long the counseling session lasted in minutes. Longer sessions provide more time for processing and support.',
  },
  'Session Sequence Number': {
    title: 'Session Number in Series',
    description:
      'How many sessions this resident has had so far. Cumulative sessions can build trust and enable deeper work.',
  },
  'Concerns Flagged': {
    title: 'Concerns Flagged',
    description:
      'Whether the counselor flagged concerns during the session. Flagged concerns may indicate the resident is in a more difficult state.',
  },
  'Referral Made': {
    title: 'Referral Made',
    description:
      'Whether the session resulted in a referral to a specialist. Referrals connect residents with additional support services.',
  },
  'Starting Emotional State': {
    title: 'Starting Emotional State',
    description:
      'The resident\'s emotional state at the start of the session (0\u20135 scale: Distressed to Happy). Residents starting in worse states have more room for improvement, so this is included as a control variable.',
  },
  // Pipeline 3 — Social Media
  'Call-to-Action Included': {
    title: 'Call-to-Action in Post',
    description:
      'Whether the social media post includes a clear ask (donate, share, sign up, etc.). CTAs drive audience interaction.',
  },
  'Resident Story Featured': {
    title: 'Resident Story Featured',
    description:
      'Whether the post includes an anonymized story about a resident. Personal stories increase empathy and engagement.',
  },
  'Post Boosted (paid)': {
    title: 'Boosted / Paid Post',
    description:
      'Whether the post was paid-promoted to reach a larger audience. Boosting increases reach but may change the engagement rate.',
  },
  'Number of Hashtags': {
    title: 'Hashtag Count',
    description:
      'How many hashtags were included in the post. Hashtags increase discoverability but overuse can reduce impact.',
  },
  'Caption Length': {
    title: 'Caption Length',
    description:
      'Character count of the post caption. Longer captions can tell a richer story but may lose casual scrollers.',
  },
  'Posting Hour': {
    title: 'Time of Day Posted',
    description:
      'The hour the post was published (0-23). Posting time affects how many followers see the content in their feed.',
  },
  // Pipeline 4 — Safehouse Resources
  'Counseling Sessions': {
    title: 'Monthly Counseling Sessions',
    description:
      'Number of counseling sessions conducted at the safehouse that month. More sessions indicate higher counseling intensity.',
  },
  'Home Visits': {
    title: 'Monthly Home Visits',
    description:
      'Number of home visits conducted for residents of this safehouse that month. Visits support family engagement.',
  },
  'Incidents Reported': {
    title: 'Monthly Incidents',
    description:
      'Number of incident reports filed at the safehouse that month. Higher counts may indicate behavioral challenges.',
  },
  'Active Residents': {
    title: 'Active Residents',
    description:
      'How many residents are active in a safehouse during a given month. More residents may strain resources.',
  },
  'Education Funding': {
    title: 'Education Funding',
    description:
      'Donations allocated to education programs at this safehouse that month.',
  },
  'Wellbeing Funding': {
    title: 'Wellbeing Funding',
    description:
      'Donations allocated to health, nutrition, and psychological support at this safehouse that month.',
  },
  'Operations Funding': {
    title: 'Operations Funding',
    description:
      'Donations allocated to general operations and overhead at this safehouse that month.',
  },
  'Transport Funding': {
    title: 'Transport Funding',
    description:
      'Donations allocated to transportation for this safehouse that month.',
  },
  'Outreach Funding': {
    title: 'Outreach Funding',
    description:
      'Donations allocated to outreach and community engagement at this safehouse that month.',
  },
  'Maintenance Funding': {
    title: 'Maintenance Funding',
    description:
      'Donations allocated to facility maintenance at this safehouse that month.',
  },
};

function getFeatureLabel(name: string): string {
  return FEATURE_LABELS[name] ?? name;
}

interface ExplanatoryInsightsPageProps {
  topTabBar?: React.ReactNode;
}

export default function ExplanatoryInsightsPage({ topTabBar }: ExplanatoryInsightsPageProps = {}) {
  useEffect(() => {
    document.title = 'Insights | Harbor of Hope';
  }, []);

  const [pipelines, setPipelines] = useState<ExplanatoryPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showTechnical, setShowTechnical] = useState(false);
  const [featureInfoOpen, setFeatureInfoOpen] = useState(false);
  const [featureInfoKey, setFeatureInfoKey] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchExplanatoryInsights();
        if (!cancelled) setPipelines(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load insights.'
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
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

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (pipelines.length === 0) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', mt: 2, mb: 6, px: 2 }}>
        {topTabBar}
        <Alert severity="info" sx={{ borderRadius: 2, textAlign: 'left' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            No explanatory results in the database yet
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            The Reports → Explanatory Models tab reads PostgreSQL tables written by the Python job
            (<code>explanatory_insights</code>, <code>explanatory_features</code>). Running the
            <code>.ipynb</code> notebooks updates plots and files under <code>ml-pipelines/</code> but
            does not populate those tables, so the site will stay empty until you run the job against
            the same database the API uses.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            From the <code>jobs</code> folder:
          </Typography>
          <Box
            component="pre"
            sx={{
              m: 0,
              mb: 1.5,
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1,
              fontSize: '0.8rem',
              overflow: 'auto',
            }}
          >
            python run_explanatory_insights.py
          </Box>
          <Typography variant="body2" color="text.secondary">
            To refresh everything (predictive + explanatory):{' '}
            <code>python run_all_predictions.py</code>. Set <code>DB_HOST</code>, <code>DB_USER</code>,{' '}
            <code>DB_PASS</code>, etc. to match your API connection string. On Windows PowerShell, if
            the script errors on Unicode in the console, run{' '}
            <code>$env:PYTHONUTF8=&apos;1&apos;</code> first.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const current = pipelines[activeTab];
  const color = PIPELINE_COLORS[activeTab] ?? '#5B8C7A';

  const driversChartData =
    current?.topFeatures?.slice(0, 8).map((f) => ({
      name: getFeatureLabel(f.name),
      rawName: f.name,
      coefficient: Number(f.coefficient.toFixed(3)),
      pValue: f.pValue,
      isSignificant: f.isSignificant,
      interpretation: f.interpretation,
      direction: f.direction,
    })) ?? [];

  // Look up feature info: first try glossary (raw keys), then check chart data
  // for the interpretation from the database
  const chartEntry = driversChartData.find(
    (d) => d.rawName === featureInfoKey || d.name === featureInfoKey
  );
  const featureInfo =
    FEATURE_GLOSSARY[featureInfoKey] ??
    (featureInfoKey
      ? {
          title: chartEntry?.name ?? getFeatureLabel(featureInfoKey),
          description:
            chartEntry?.interpretation ??
            `${chartEntry?.direction ?? 'Affects'} the outcome (coefficient: ${chartEntry?.coefficient ?? '—'})`,
        }
      : null);

  function openFeatureInfo(featureName: string) {
    setFeatureInfoKey(featureName);
    setFeatureInfoOpen(true);
  }

  function modelStrength(r2: number): { label: string; color: string } {
    if (r2 >= 0.5) return { label: 'Strong', color: '#5B8C7A' };
    if (r2 >= 0.15) return { label: 'Moderate', color: '#E8935A' };
    return { label: 'Exploratory', color: '#999' };
  }

  const strength = modelStrength(current?.adjRSquared ?? 0);

  // When topTabBar is null, we're rendered inline inside InsightsPage (no hero/container needed)
  const inline = topTabBar === null;

  const content = (
    <>
      {/* Topic Tabs */}
      <Paper
        sx={{
          borderRadius: 3,
          mb: 5,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => {
            setActiveTab(v);
            setShowTechnical(false);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              py: 2,
            },
          }}
          TabIndicatorProps={{
            sx: {
              height: 3,
              borderRadius: '3px 3px 0 0',
              backgroundColor: PIPELINE_COLORS[activeTab] ?? '#E8735A',
            },
          }}
        >
          {pipelines.map((p, i) => (
            <Tab
              key={p.pipelineId}
              icon={PIPELINE_ICONS[i]}
              iconPosition="start"
              label={
                PIPELINE_FRIENDLY_NAMES[p.pipelineName] ?? p.pipelineName
              }
            />
          ))}
        </Tabs>
      </Paper>

        {current && (
          <>
            {/* Key Finding — hero card */}
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
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <LightbulbIcon sx={{ color, fontSize: 36, mt: 0.3 }} />
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ color, fontWeight: 700, letterSpacing: 1 }}
                  >
                    Key Finding
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, mb: 1, lineHeight: 1.4 }}
                  >
                    {current.keyInsight}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      flexWrap: 'wrap',
                      mt: 1.5,
                    }}
                  >
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

            {/* What Matters Most — adaptive visualization based on significance */}
            <Paper
              sx={{
                p: { xs: 2, md: 4 },
                mb: 5,
                borderRadius: 3,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                What Matters Most
              </Typography>

              {(() => {
                const sigFeatures = driversChartData.filter((d) => d.isSignificant);
                const nonSigFeatures = driversChartData.filter((d) => !d.isSignificant);
                const sigCount = sigFeatures.length;

                // 0 significant: informational callout
                if (sigCount === 0) {
                  return (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 500, mx: 'auto' }}>
                        With {current.sampleSize} observations, no individual factor reached statistical significance (p &lt; 0.05).
                        This is common with small samples — it doesn&apos;t mean nothing matters, just that we can&apos;t be confident with this data alone.
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 3, mb: 2, color: '#6B6B6B' }}>
                        Strongest Associations (not statistically significant)
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 500, mx: 'auto' }}>
                        {driversChartData.slice(0, 4).map((d) => (
                          <Box
                            key={d.rawName}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'rgba(0,0,0,0.02)',
                            }}
                          >
                            <Box sx={{
                              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                              bgcolor: d.coefficient > 0 ? '#5B8C7A' : '#E8735A',
                              opacity: 0.5,
                            }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{d.interpretation}</Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#999', whiteSpace: 'nowrap' }}>
                              p = {d.pValue?.toFixed(3) ?? '—'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  );
                }

                // 1-2 significant: highlight cards + muted list
                if (sigCount <= 2) {
                  return (
                    <Box sx={{ pt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {sigCount === 1 ? 'One factor' : 'Two factors'} reached statistical significance (p &lt; 0.05).
                      </Typography>
                      {/* Significant features as prominent cards */}
                      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                        {sigFeatures.map((d) => (
                          <Box
                            key={d.rawName}
                            sx={{
                              flex: '1 1 280px',
                              p: 3,
                              borderRadius: 3,
                              border: `2px solid ${d.coefficient > 0 ? '#5B8C7A' : '#E8735A'}`,
                              bgcolor: d.coefficient > 0 ? 'rgba(91,140,122,0.06)' : 'rgba(232,115,90,0.06)',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Box sx={{
                                width: 12, height: 12, borderRadius: '50%',
                                bgcolor: d.coefficient > 0 ? '#5B8C7A' : '#E8735A',
                              }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {d.name}
                              </Typography>
                              <Chip label="significant" size="small" color="success" sx={{ ml: 'auto', height: 22, fontSize: '0.7rem' }} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                              {d.interpretation}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 3 }}>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                Coefficient: <strong>{d.coefficient > 0 ? '+' : ''}{d.coefficient.toFixed(3)}</strong>
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                p-value: <strong>{d.pValue?.toFixed(4) ?? '—'}</strong>
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                      {/* Non-significant features as muted list */}
                      {nonSigFeatures.length > 0 && (
                        <>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#999', mb: 1.5 }}>
                            Not statistically significant
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {nonSigFeatures.map((d) => (
                              <Box
                                key={d.rawName}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  p: 1,
                                  borderRadius: 1.5,
                                  bgcolor: 'rgba(0,0,0,0.015)',
                                }}
                              >
                                <Box sx={{
                                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                  bgcolor: d.coefficient > 0 ? '#5B8C7A' : '#E8735A',
                                  opacity: 0.35,
                                }} />
                                <Typography variant="body2" sx={{ color: '#999', flex: 1 }}>{d.name}</Typography>
                                <Typography variant="caption" sx={{ color: '#bbb' }}>
                                  p = {d.pValue?.toFixed(2) ?? '—'}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </>
                      )}
                    </Box>
                  );
                }

                // 3+ significant: bar chart (data supports it)
                return (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Longer bars = stronger influence. Green bars increase the outcome, coral bars decrease it.
                      {sigCount < driversChartData.length && ` ${sigCount} of ${driversChartData.length} factors are statistically significant.`}
                    </Typography>
                    <Box sx={{ height: 340 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={driversChartData}
                          layout="vertical"
                          margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" />
                          <XAxis type="number" domain={['auto', 'auto']} hide />
                          <YAxis type="category" dataKey="name" width={180}
                            tick={{ fontSize: 13, fill: '#333', fontWeight: 500 }} />
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (!active || !payload || payload.length === 0) return null;
                              const row = payload[0]?.payload as
                                | { name: string; rawName: string; interpretation: string; isSignificant: boolean }
                                | undefined;
                              if (!row) return null;
                              return (
                                <Paper sx={{ p: 2, borderRadius: 2, maxWidth: 300, boxShadow: '0 6px 18px rgba(0,0,0,0.14)' }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    {row.name} {row.isSignificant && '(significant)'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">{row.interpretation}</Typography>
                                </Paper>
                              );
                            }}
                          />
                          <Bar dataKey="coefficient" radius={[6, 6, 6, 6]} cursor="pointer"
                            onClick={(data: any) => {
                              const name = data?.payload?.rawName;
                              if (typeof name === 'string' && name.length > 0) openFeatureInfo(name);
                            }}
                          >
                            {driversChartData.map((entry, index) => (
                              <Cell key={index}
                                fill={entry.coefficient > 0 ? '#5B8C7A' : '#E8735A'}
                                opacity={entry.isSignificant ? 1 : 0.3}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </>
                );
              })()}
            </Paper>

            {/* Recommendations — open by default, prominent */}
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                mb: 5,
                borderRadius: 3,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                What We Can Do About It
              </Typography>
              <List disablePadding>
                {current.recommendations.map((rec, i) => (
                  <ListItem
                    key={i}
                    sx={{
                      py: 1.5,
                      px: 2,
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: `${color}06`,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircleOutlineIcon sx={{ color }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={rec}
                      primaryTypographyProps={{
                        variant: 'body1',
                        fontWeight: 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Technical Details — collapsed by default */}
            <Paper
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                overflow: 'hidden',
              }}
            >
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
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Technical Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Model statistics and coefficient table for detailed review
                  </Typography>
                </Box>
                <IconButton size="small">
                  <ExpandMoreIcon
                    sx={{
                      transform: showTechnical
                        ? 'rotate(180deg)'
                        : 'none',
                      transition: 'transform 0.2s',
                    }}
                  />
                </IconButton>
              </Box>
              <Collapse in={showTechnical}>
                <Box sx={{ px: 3, pb: 3 }}>
                  {/* Stats row */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr 1fr 1fr',
                      },
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography
                          variant="overline"
                          color="text.secondary"
                        >
                          Model Type
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600 }}
                        >
                          {current.modelType}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography
                          variant="overline"
                          color="text.secondary"
                        >
                          Target Variable
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600 }}
                        >
                          {current.targetVariable}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography
                          variant="overline"
                          color="text.secondary"
                        >
                          Sample Size
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 700, color }}
                        >
                          {current.sampleSize}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      Coefficients describe <strong>correlations in historical data</strong>, not proven
                      cause-and-effect. These patterns help identify what to investigate further, not what
                      to assume as fact. Surprising signs can reflect confounding, selection effects, or
                      limited sample sizes.
                    </Typography>
                  </Alert>

                  {/* Coefficients table */}
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>
                            Factor
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            Coefficient
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            p-value
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            Direction
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            Statistical note
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {current.topFeatures.map((f) => (
                          <TableRow
                            key={f.name}
                            sx={{
                              backgroundColor: f.isSignificant
                                ? `${color}08`
                                : 'transparent',
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {getFeatureLabel(f.name)}
                                </Typography>
                                {f.isSignificant && (
                                  <Chip
                                    label="significant"
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.7rem',
                                      backgroundColor: color,
                                      color: '#fff',
                                    }}
                                  />
                                )}
                                <Tooltip title="Learn more" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => openFeatureInfo(f.name)}
                                    sx={{ p: 0.25 }}
                                  >
                                    <InfoOutlinedIcon
                                      sx={{
                                        fontSize: 16,
                                        color: 'text.secondary',
                                      }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  fontFamily: 'monospace',
                                  color:
                                    f.coefficient > 0
                                      ? '#5B8C7A'
                                      : '#E8735A',
                                }}
                              >
                                {f.coefficient > 0 ? '+' : ''}
                                {f.coefficient.toFixed(3)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'monospace',
                                  color:
                                    f.pValue < 0.05 ? '#333' : '#999',
                                }}
                              >
                                {f.pValue < 0.001
                                  ? '<0.001'
                                  : f.pValue.toFixed(3)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                {f.coefficient > 0 ? (
                                  <TrendingUpIcon
                                    sx={{
                                      fontSize: 18,
                                      color: '#5B8C7A',
                                    }}
                                  />
                                ) : (
                                  <TrendingDownIcon
                                    sx={{
                                      fontSize: 18,
                                      color: '#E8735A',
                                    }}
                                  />
                                )}
                                <Typography variant="body2">
                                  {f.direction}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {f.interpretation}
                              </Typography>
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
  );

  return (
    <>
      {inline ? content : (
        <Box>
          {/* Hero — only shown in standalone mode */}
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
                What Drives Our Impact
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
                We analyzed our data to understand what factors matter most for the outcomes we care about.
              </Typography>
            </Container>
          </Box>
          <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
            {topTabBar}
            {content}
          </Container>
        </Box>
      )}

      {/* Feature Info Dialog */}
      <Dialog
        open={featureInfoOpen}
        onClose={() => setFeatureInfoOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {featureInfo?.title ?? 'Feature'}
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {featureInfo?.description ?? ''}
          </Typography>
          <Button
            variant="contained"
            onClick={() => setFeatureInfoOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
