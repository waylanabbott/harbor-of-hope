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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SchoolIcon from '@mui/icons-material/School';
import CampaignIcon from '@mui/icons-material/Campaign';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
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
  <WarningAmberIcon key="risk" />,
  <SchoolIcon key="edu" />,
  <CampaignIcon key="social" />,
  <AccountBalanceIcon key="fund" />,
];

// Friendly names for tab labels
const PIPELINE_FRIENDLY_NAMES: Record<string, string> = {
  'Risk Factors': 'What Drives Risk',
  'Education & Reintegration': 'Path to Reintegration',
  'Social Media & Donations': 'What Drives Donations',
  'Funding & Outcomes': 'How Funding Creates Impact',
};

// Plain-English labels for feature names
const FEATURE_LABELS: Record<string, string> = {
  avg_severity: 'Incident Severity',
  total_incidents: 'Number of Incidents',
  safety_concern_rate: 'Safety Concerns in Visits',
  avg_family_coop: 'Family Cooperation',
  avg_attendance: 'School Attendance',
  progress_rate: 'Counseling Progress',
  attendance_slope: 'Attendance Trend',
  avg_progress: 'Education Progress',
  stay_months: 'Length of Stay',
  total_sessions: 'Counseling Sessions',
  family_risk_count: 'Family Risk Factors',
  has_call_to_action: 'Has Call-to-Action',
  features_resident_story: 'Resident Story Featured',
  is_boosted: 'Boosted Post',
  boost_budget_php: 'Boost Budget',
  Wellbeing: 'Wellbeing Spending',
  Education: 'Education Spending',
  Operations: 'Operations Spending',
  Transport: 'Transport Spending',
  capacity_girls: 'Safehouse Capacity',
  active_residents: 'Active Residents',
};

const FEATURE_GLOSSARY: Record<string, { title: string; description: string }> = {
  avg_severity: {
    title: 'Average Incident Severity',
    description:
      'The average seriousness level of incidents reported for a resident. Higher means more severe incidents overall.',
  },
  total_incidents: {
    title: 'Total Incidents',
    description:
      'The number of incident reports associated with a resident. More incidents indicate higher risk.',
  },
  safety_concern_rate: {
    title: 'Safety Concerns in Home Visits',
    description:
      'The percentage of home visits where safety concerns were noted. Higher means concerns were flagged more often.',
  },
  avg_family_coop: {
    title: 'Family Cooperation Score',
    description:
      'How cooperative the family is during home visits. Higher means more cooperative families, which supports better outcomes.',
  },
  avg_attendance: {
    title: 'School Attendance Rate',
    description:
      'The average attendance rate across education records. Higher means the resident attends school more consistently.',
  },
  progress_rate: {
    title: 'Counseling Progress Rate',
    description:
      'The share of counseling sessions where staff noted progress. Higher means more frequent progress.',
  },
  attendance_slope: {
    title: 'Attendance Trend',
    description:
      'Whether school attendance is improving or declining over time. Positive means attendance is trending upward.',
  },
  avg_progress: {
    title: 'Average Education Progress',
    description:
      'The average progress percentage in education records. Higher means stronger educational growth.',
  },
  stay_months: {
    title: 'Length of Stay',
    description:
      'How long the resident has been in the program (in months). Longer stays provide more time for services and recovery.',
  },
  total_sessions: {
    title: 'Total Counseling Sessions',
    description:
      'The total number of counseling sessions a resident has received. More sessions generally support better outcomes.',
  },
  family_risk_count: {
    title: 'Family Risk Factors',
    description:
      'A count of family risk indicators (solo parent, indigenous, parent with disability, informal settler, etc.).',
  },
  has_call_to_action: {
    title: 'Has a Call-to-Action',
    description:
      'Whether the social media post clearly asks the audience to take action (donate, share, sign up, etc.).',
  },
  features_resident_story: {
    title: 'Features a Resident Story',
    description:
      'Whether the post includes an anonymized story about a resident, which increases empathy and giving.',
  },
  is_boosted: {
    title: 'Boosted Post',
    description: 'Whether the post was paid/boosted to reach more people.',
  },
  boost_budget_php: {
    title: 'Boost Budget (PHP)',
    description:
      'The amount spent to promote the post. Higher investment means more paid reach.',
  },
  Wellbeing: {
    title: 'Wellbeing Allocation',
    description:
      'Amount allocated to wellbeing spending (health, nutrition, psychological support) for a safehouse each month.',
  },
  Education: {
    title: 'Education Allocation',
    description:
      'Amount allocated to education spending for a safehouse each month.',
  },
  Operations: {
    title: 'Operations Allocation',
    description:
      'Amount allocated to operations/overhead for a safehouse each month.',
  },
  Transport: {
    title: 'Transport Allocation',
    description:
      'Amount allocated to transport spending for a safehouse each month.',
  },
  capacity_girls: {
    title: 'Safehouse Capacity',
    description:
      'The designed capacity of the safehouse (how many girls it can serve).',
  },
  active_residents: {
    title: 'Active Residents',
    description:
      'How many residents are active in a safehouse during a given month.',
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

  const current = pipelines[activeTab];
  const color = PIPELINE_COLORS[activeTab] ?? '#5B8C7A';

  const driversChartData =
    current?.topFeatures?.slice(0, 6).map((f) => ({
      name: getFeatureLabel(f.name),
      rawName: f.name,
      coefficient: Number(f.coefficient.toFixed(3)),
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

  // Strength label for R²
  function modelStrength(r2: number): { label: string; color: string } {
    if (r2 >= 0.7) return { label: 'Strong', color: '#5B8C7A' };
    if (r2 >= 0.4) return { label: 'Moderate', color: '#E8935A' };
    return { label: 'Weak', color: '#E8735A' };
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

            {/* What Matters Most — bar chart with friendly labels */}
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
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Longer bars = stronger influence. Green bars increase the
                outcome, coral bars decrease it. Click any bar to learn more.
              </Typography>
              <Box sx={{ height: 340 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={driversChartData}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E0D6CC"
                    />
                    <XAxis type="number" domain={['auto', 'auto']} hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={180}
                      tick={{ fontSize: 13, fill: '#333', fontWeight: 500 }}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0)
                          return null;
                        const row = payload[0]?.payload as
                          | {
                              name: string;
                              rawName: string;
                              interpretation: string;
                              direction: string;
                            }
                          | undefined;
                        if (!row) return null;
                        return (
                          <Paper
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              maxWidth: 300,
                              boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, mb: 0.5 }}
                            >
                              {row.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {row.interpretation}
                            </Typography>
                          </Paper>
                        );
                      }}
                    />
                    <Bar
                      dataKey="coefficient"
                      radius={[6, 6, 6, 6]}
                      cursor="pointer"
                      onClick={(data: any) => {
                        const name = data?.payload?.rawName;
                        if (typeof name === 'string' && name.length > 0)
                          openFeatureInfo(name);
                      }}
                    >
                      {driversChartData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.coefficient > 0 ? '#5B8C7A' : '#E8735A'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
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
                            What It Means
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
