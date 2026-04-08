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
import { motion } from 'framer-motion';
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
import AnimateOnScroll, { StaggerContainer, StaggerItem } from '../../components/ui/AnimateOnScroll';
import AnimatedCounter from '../../components/ui/AnimatedCounter';

const paperSx = {
  p: { xs: 3, md: 4 },
  borderRadius: 4,
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  cursor: 'pointer',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
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

  const hasValue = (v: number | null | undefined, min = 0.01) => v != null && v > min;
  const healthData = chartData.filter((d) => hasValue(d.avgHealthScore));
  const donationsData = chartData.filter((d) => hasValue(d.donationsTotal));
  const educationData = chartData.filter((d) => hasValue(d.educationProgress));

  const residentsWithData = chartData.filter((d) => d.totalResidents != null && d.totalResidents > 0);
  const currentResidents = residentsWithData.length > 0
    ? residentsWithData[residentsWithData.length - 1].totalResidents
    : 0;

  function renderHealthChart(height: number) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={healthData}>
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
        <BarChart data={donationsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B6B6B' }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fill: '#6B6B6B' }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Donations']} />
          <Bar dataKey="donationsTotal" fill="#D4603F" name="Donations ($)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  function renderResidentsCard() {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          minHeight: 280,
        }}
      >
        <Typography
          variant="h1"
          sx={{ fontWeight: 800, color: '#D4603F', fontSize: { xs: '4rem', md: '5.5rem' }, lineHeight: 1 }}
        >
          <AnimatedCounter value={currentResidents ?? 0} duration={2000} />
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, color: '#6B6B6B', fontWeight: 500 }}>
          Active Residents
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', textAlign: 'center', maxWidth: 260 }}>
          Girls currently living in our safe homes across Central America
        </Typography>
      </Box>
    );
  }

  function renderEducationChart(height: number) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={educationData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0D6CC" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B6B6B' }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fill: '#6B6B6B' }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Education Progress']} />
          <Line type="monotone" dataKey="educationProgress" stroke="#5B8C7A" name="Education Progress (%)" strokeWidth={2.5} dot={{ r: 3, fill: '#5B8C7A' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  const charts: { title: string; render: (height: number) => ReactNode; isStatCard?: boolean }[] = [
    { title: 'Average Health Score Over Time', render: renderHealthChart },
    { title: 'Monthly Donations', render: renderDonationsChart },
    { title: 'Residents in Our Care', render: renderResidentsCard as any, isStatCard: true },
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
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
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* Charts — 2x2 grid */}
        <StaggerContainer
          staggerDelay={0.15}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '32px',
            marginBottom: '64px',
          }}
        >
          {charts.map((chart) => (
            <StaggerItem key={chart.title}>
              <Paper
                sx={{
                  ...paperSx,
                  ...(chart.isStatCard ? { cursor: 'default', '&:hover': { transform: 'none', boxShadow: paperSx.boxShadow } } : {}),
                }}
                onClick={
                  chart.isStatCard
                    ? undefined
                    : () => setExpandedChart({ title: chart.title, content: chart.render(500) })
                }
              >
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ mb: 3, fontWeight: 700, color: '#2D2D2D' }}
                >
                  {chart.title}
                </Typography>
                <Box sx={{ flex: 1, minHeight: 280 }}>
                  {chart.isStatCard ? chart.render(0) : chart.render(280)}
                </Box>
                {!chart.isStatCard && (
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}
                  >
                    Click to expand
                  </Typography>
                )}
              </Paper>
            </StaggerItem>
          ))}
        </StaggerContainer>

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

        {/* Success Stories */}
        <Box>
          <AnimateOnScroll variant="slideUp">
            <Typography
              variant="h4"
              component="h2"
              sx={{ mb: 2, fontWeight: 700, color: '#2D2D2D', textAlign: 'center' }}
            >
              Stories of Hope
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 5 }}
            >
              Every number represents a life changed. Here are some of the journeys our residents have taken — names changed to protect their privacy.
            </Typography>
          </AnimateOnScroll>
          <StaggerContainer
            staggerDelay={0.1}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '28px',
            }}
          >
            {[
              {
                name: 'Resident, Age 16',
                type: 'Family Reunification',
                quote: 'After 18 months of counseling and education support, this resident was reunited with her family. She now attends school regularly and dreams of becoming a nurse.',
                tag: 'Reintegrated',
                color: '#5B8C7A',
              },
              {
                name: 'Resident, Age 14',
                type: 'Foster Care',
                quote: 'This resident arrived with a critical risk level and no school history. Through 24 counseling sessions and tutoring, her education progress reached 87%. She was placed with a loving foster family in 2025.',
                tag: 'Reintegrated',
                color: '#5B8C7A',
              },
              {
                name: 'Resident, Age 17',
                type: 'Independent Living',
                quote: 'This resident completed a vocational training program while at Harbor of Hope. She now lives independently, works at a local bakery, and mentors younger residents on weekends.',
                tag: 'Independent',
                color: '#26A69A',
              },
              {
                name: 'Resident, Age 13',
                type: 'Education Milestone',
                quote: 'When this resident arrived, she could barely read. After two years of dedicated support, she scored in the top 10% of her class and received a scholarship for secondary school.',
                tag: 'Thriving',
                color: '#E8935A',
              },
              {
                name: 'Resident, Age 15',
                type: 'Health Recovery',
                quote: 'This resident\'s health score improved from 1.2 to 4.5 over 12 months. With consistent medical care and nutrition support, she gained the strength to participate in sports for the first time.',
                tag: 'Recovering',
                color: '#9B59B6',
              },
              {
                name: 'Resident, Age 12',
                type: 'Family Reunification',
                quote: 'After her family completed counseling and home visits confirmed a safe environment, this resident returned home. Regular follow-up visits show she is happy, healthy, and attending school every day.',
                tag: 'Reintegrated',
                color: '#5B8C7A',
              },
            ].map((story) => (
              <StaggerItem key={story.name}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    border: 'none',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    borderTop: `4px solid ${story.color}`,
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Typography
                          variant="subtitle1"
                          component="h3"
                          sx={{ fontWeight: 700, color: '#2D2D2D' }}
                        >
                          {story.name}
                        </Typography>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 0.25,
                            borderRadius: 2,
                            backgroundColor: `${story.color}18`,
                            color: story.color,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {story.tag}
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', lineHeight: 1.8, fontStyle: 'italic' }}
                      >
                        &ldquo;{story.quote}&rdquo;
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ mt: 3, display: 'block', color: story.color, fontWeight: 600 }}
                    >
                      {story.type}
                    </Typography>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Box>
      </Container>
    </Box>
  );
}
