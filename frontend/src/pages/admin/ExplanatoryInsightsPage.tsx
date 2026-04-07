import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
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
import ScienceIcon from '@mui/icons-material/Science';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import {
  fetchExplanatoryInsights,
  type ExplanatoryPipeline,
} from '../../lib/explanatoryApi';

const PIPELINE_COLORS = ['#E8735A', '#5B8C7A', '#9B59B6', '#26A69A'];

const FEATURE_GLOSSARY: Record<string, { title: string; description: string }> = {
  // Pipeline 1 (Risk)
  avg_severity: {
    title: 'Average incident severity',
    description:
      'The average seriousness level of incidents reported for a resident (low/medium/high converted to numbers). Higher means more severe incidents overall.',
  },
  total_incidents: {
    title: 'Total incidents',
    description:
      'The number of incident reports associated with a resident. Higher means more incidents occurred.',
  },
  safety_concern_rate: {
    title: 'Safety concern rate (home visits)',
    description:
      'The share of home visits where safety concerns were noted. Higher means concerns were flagged more often.',
  },
  avg_family_coop: {
    title: 'Average family cooperation',
    description:
      'A score summarizing how cooperative the family is during home visits (cooperative/neutral/uncooperative). Higher means more cooperative.',
  },
  avg_attendance: {
    title: 'Average school attendance',
    description:
      'The average attendance rate across education records for a resident. Higher means the resident attends more consistently.',
  },
  progress_rate: {
    title: 'Counseling progress rate',
    description:
      'The share of counseling sessions where staff noted progress. Higher means progress was noted more often.',
  },

  // Pipeline 2 (Reintegration)
  attendance_slope: {
    title: 'Attendance trend (momentum)',
    description:
      'Whether attendance is improving or declining over time. Positive means attendance is trending up month-to-month; negative means it’s trending down.',
  },
  avg_progress: {
    title: 'Average education progress',
    description:
      'The average progress percentage recorded in education records. Higher means more educational progress on average.',
  },
  stay_months: {
    title: 'Length of stay (months)',
    description:
      'How long the resident has been in the program (converted to months). Longer stays can give more time for services and reintegration steps.',
  },
  total_sessions: {
    title: 'Total counseling sessions',
    description:
      'The total number of counseling/process sessions recorded for the resident. Higher means the resident received more sessions.',
  },
  family_risk_count: {
    title: 'Family risk factors count',
    description:
      'A simple count of family risk indicators (e.g., solo parent, indigenous, parent PWD, informal settler). Higher means more risk flags.',
  },

  // Pipeline 3 (Social media -> donations)
  has_call_to_action: {
    title: 'Has a call-to-action (CTA)',
    description:
      'Whether the post clearly asks the audience to do something (donate, share, sign up, etc.).',
  },
  features_resident_story: {
    title: 'Features a resident story',
    description:
      'Whether the post includes a story about a resident (anonymized), which can increase empathy and giving.',
  },
  is_boosted: {
    title: 'Boosted post',
    description:
      'Whether the post was paid/boosted to reach more people.',
  },
  boost_budget_php: {
    title: 'Boost budget (PHP)',
    description:
      'The amount spent to boost/promote the post. Higher means more paid reach.',
  },

  // Pipeline 4 (Funding -> outcomes)
  Wellbeing: {
    title: 'Wellbeing allocation',
    description:
      'Amount allocated to wellbeing-related spending (health, nutrition, psychological support, etc.) for a safehouse-month.',
  },
  Education: {
    title: 'Education allocation',
    description:
      'Amount allocated to education-related spending for a safehouse-month.',
  },
  Operations: {
    title: 'Operations allocation',
    description:
      'Amount allocated to operations/overhead for a safehouse-month.',
  },
  Transport: {
    title: 'Transport allocation',
    description:
      'Amount allocated to transport-related spending for a safehouse-month.',
  },
  capacity_girls: {
    title: 'Safehouse capacity',
    description:
      'The designed capacity of the safehouse (number of girls it can serve).',
  },
  active_residents: {
    title: 'Active residents',
    description:
      'How many residents are active in a safehouse-month. Higher can create capacity strain on average outcomes.',
  },
};

export default function ExplanatoryInsightsPage() {
  useEffect(() => {
    document.title = 'Explanatory Insights | Harbor of Hope';
  }, []);

  const [pipelines, setPipelines] = useState<ExplanatoryPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedRecs, setExpandedRecs] = useState<Record<number, boolean>>({});
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
      name: f.name,
      coefficient: Number(f.coefficient.toFixed(3)),
      isSignificant: f.isSignificant,
    })) ?? [];

  const featureInfo =
    FEATURE_GLOSSARY[featureInfoKey] ??
    (featureInfoKey
      ? {
          title: featureInfoKey,
          description:
            'This is a feature name used in the model. If it’s unfamiliar, check the “Interpretation” column in the Feature Coefficients table below for the plain-English meaning.',
        }
      : null);

  function openFeatureInfo(featureName: string) {
    setFeatureInfoKey(featureName);
    setFeatureInfoOpen(true);
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1 }}
        >
          <ScienceIcon sx={{ fontSize: 32, color: '#5B8C7A' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Explanatory Model Insights
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Simple takeaways first, with the detailed coefficient table below
        </Typography>
      </Box>

      {/* Pipeline Tabs */}
      <Paper
        sx={{ borderRadius: 3, mb: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
          }}
        >
          {pipelines.map((p, i) => (
            <Tab
              key={p.pipelineId}
              label={p.pipelineName}
              sx={{
                borderBottom: activeTab === i ? `3px solid ${PIPELINE_COLORS[i]}` : 'none',
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {current && (
        <>
          {/* What am I looking at? */}
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              What you’re looking at
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Each tab answers one question (risk, reintegration, donations, or funding).
              The goal is to explain what factors move the outcome — not to “predict perfectly.”
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Read it in this order: <strong>Key Insight</strong> → <strong>Top Drivers</strong> →
              <strong> Recommendations</strong> → (optional) <strong>Feature Coefficients</strong>.
            </Typography>
          </Paper>

          {/* Summary Cards Row */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
              gap: 3,
              mb: 4,
            }}
          >
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                borderTop: `4px solid ${color}`,
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="overline" color="text.secondary">
                  Model Type
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {current.modelType}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Target: {current.targetVariable}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                borderTop: `4px solid ${color}`,
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.75 }}>
                  <Typography variant="overline" color="text.secondary">
                    Adj. R²
                  </Typography>
                  <Tooltip
                    title={
                      <Box sx={{ maxWidth: 320 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                          What does Adj. R² mean?
                        </Typography>
                        <Typography variant="body2">
                          It’s a 0–1 score that summarizes how much of the outcome this model can explain using the features shown.
                          Higher means the model fits the data better. “Adjusted” means it penalizes adding extra variables.
                        </Typography>
                      </Box>
                    }
                    placement="top"
                    arrow
                  >
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color }}
                >
                  {current.adjRSquared.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  R² = {current.rSquared.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                borderTop: `4px solid ${color}`,
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="overline" color="text.secondary">
                  Sample Size
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color }}
                >
                  {current.sampleSize}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  observations
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Key Insight */}
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              backgroundColor: `${color}0A`,
              border: `1px solid ${color}30`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <LightbulbIcon sx={{ color, mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Key Insight
                </Typography>
                <Typography variant="body1">{current.keyInsight}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Visual: Top Drivers */}
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Top Drivers (simple view)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Longer bars matter more. Right = increases the outcome, left = decreases. (This is a summary; the full detail is in the table.)
            </Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={driversChartData}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" />
                  <XAxis
                    type="number"
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={160}
                    tick={({ x, y, payload }: any) => (
                      <g
                        transform={`translate(${x},${y})`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const name = payload?.value;
                          if (typeof name === 'string' && name.length > 0) openFeatureInfo(name);
                        }}
                      >
                        <text x={0} y={0} dy={4} textAnchor="end" fill="#666" fontSize={12}>
                          {payload?.value}
                        </text>
                      </g>
                    )}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const row = payload[0]?.payload as
                        | { name: string; coefficient: number; isSignificant: boolean }
                        | undefined;
                      if (!row) return null;

                      return (
                        <Paper
                          sx={{
                            p: 1.25,
                            borderRadius: 2,
                            boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
                            border: '1px solid rgba(0,0,0,0.06)',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {row.name}
                            </Typography>
                            <Tooltip title="What is this?" placement="top" arrow>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFeatureInfo(row.name);
                                }}
                                aria-label={`Explain ${row.name}`}
                                sx={{ p: 0.25 }}
                              >
                                <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            Coefficient (significant: {row.isSignificant ? 'Yes' : 'No'}):{' '}
                            <strong>{row.coefficient}</strong>
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                            Tip: click the bar (or label) to open the explanation.
                          </Typography>
                        </Paper>
                      );
                    }}
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar
                    dataKey="coefficient"
                    fill={color}
                    radius={[6, 6, 6, 6]}
                    onClick={(data: any) => {
                      const name = data?.payload?.name;
                      if (typeof name === 'string' && name.length > 0) openFeatureInfo(name);
                    }}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Feature Coefficients Table */}
          <Paper
            sx={{
              borderRadius: 3,
              mb: 4,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 3, pb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Feature Coefficients
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Standardized coefficients from the explanatory model — blue
                indicates statistical significance (p &lt; 0.05)
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Feature</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Coefficient
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      p-value
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Direction</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Interpretation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {current.topFeatures.map((f) => (
                    <TableRow
                      key={f.name}
                      sx={{
                        backgroundColor: f.isSignificant
                          ? `${PIPELINE_COLORS[activeTab]}08`
                          : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {f.name}
                          </Typography>
                          {f.isSignificant && (
                            <Chip
                              label="sig"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                backgroundColor: color,
                                color: '#fff',
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            color:
                              f.coefficient > 0 ? '#E8735A' : '#5B8C7A',
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
                            color: f.pValue < 0.05 ? '#333' : '#999',
                          }}
                        >
                          {f.pValue < 0.001
                            ? '<0.001'
                            : f.pValue.toFixed(3)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {f.coefficient > 0 ? (
                            <TrendingUpIcon
                              sx={{ fontSize: 18, color: '#E8735A' }}
                            />
                          ) : (
                            <TrendingDownIcon
                              sx={{ fontSize: 18, color: '#5B8C7A' }}
                            />
                          )}
                          <Typography variant="body2">{f.direction}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {f.interpretation}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Recommendations */}
          <Paper
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 3,
                pb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() =>
                setExpandedRecs((prev) => ({
                  ...prev,
                  [activeTab]: !prev[activeTab],
                }))
              }
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Actionable Recommendations
              </Typography>
              <IconButton size="small">
                <ExpandMoreIcon
                  sx={{
                    transform: expandedRecs[activeTab]
                      ? 'rotate(180deg)'
                      : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </IconButton>
            </Box>
            <Collapse in={expandedRecs[activeTab] !== false}>
              <List sx={{ px: 2, pb: 2 }}>
                {current.recommendations.map((rec, i) => (
                  <ListItem key={i} sx={{ py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon
                        sx={{ color }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={rec} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Paper>
        </>
      )}

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
    </Box>
  );
}
