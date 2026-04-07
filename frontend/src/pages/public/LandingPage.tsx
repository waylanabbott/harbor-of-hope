import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import SchoolIcon from '@mui/icons-material/School';
import PublicIcon from '@mui/icons-material/Public';
import { fetchPublicStats } from '../../lib/publicApi';
import type { PublicStats } from '../../types/PublicImpact';

export default function LandingPage() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    document.title = 'Home | Harbor of Hope';
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const data = await fetchPublicStats();
        if (!cancelled) {
          setStats(data);
          setStatsLoaded(true);
        }
      } catch {
        // Stats are non-critical for landing page — hide section on failure
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: { xs: 12, md: 20 },
          textAlign: 'center',
          overflow: 'hidden',
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
            background: 'linear-gradient(135deg, rgba(180,75,45,0.75) 0%, rgba(160,65,40,0.65) 50%, rgba(200,120,70,0.7) 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2.4rem', md: '3.6rem' },
              textShadow: '0 2px 12px rgba(0,0,0,0.3)',
              lineHeight: 1.2,
            }}
          >
            Harbor of Hope
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{
              opacity: 0.95,
              mb: 5,
              maxWidth: 560,
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.35rem' },
              lineHeight: 1.6,
              textShadow: '0 1px 6px rgba(0,0,0,0.2)',
            }}
          >
            Safe homes for girls who are survivors of trafficking in Central
            America
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="#donate"
            aria-label="Support our mission - scroll to learn more"
            sx={{
              px: 6,
              py: 1.8,
              fontSize: '1.15rem',
              bgcolor: 'white',
              color: '#D4603F',
              fontWeight: 700,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: '#FFF8F0',
                boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
              },
            }}
          >
            Support Our Mission
          </Button>
        </Container>
      </Box>

      {/* Mission Cards Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontWeight: 700,
            color: '#2D2D2D',
          }}
        >
          Our Mission
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            mb: 6,
            color: 'text.secondary',
            maxWidth: 600,
            mx: 'auto',
            fontSize: '1.1rem',
            lineHeight: 1.7,
          }}
        >
          We provide safety, healing, and opportunity to survivors of
          trafficking through three pillars of support.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 4, sm: 5 },
            justifyContent: 'center',
            alignItems: 'stretch',
          }}
        >
          {[
            {
              icon: <VolunteerActivismIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
              iconBg: 'rgba(212,96,63,0.1)',
              title: 'Safe Homes',
              text: 'Providing secure, nurturing environments for girls rescued from trafficking in Central America.',
            },
            {
              icon: <SchoolIcon sx={{ fontSize: 36, color: 'secondary.main' }} />,
              iconBg: 'rgba(91,140,122,0.1)',
              title: 'Education & Healing',
              text: 'Comprehensive programs including education, therapy, and life skills training for recovery and growth.',
            },
            {
              icon: <PublicIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
              iconBg: 'rgba(212,96,63,0.1)',
              title: 'Community Impact',
              text: 'Building partnerships with local communities to prevent trafficking and support survivors\u2019 reintegration.',
            },
          ].map((card) => (
            <Card
              key={card.title}
              sx={{
                flex: '1 1 0',
                minWidth: 0,
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent
                sx={{
                  p: 4,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: card.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700, color: '#2D2D2D' }}>
                  {card.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {card.text}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Impact Stats Section — only rendered when stats loaded successfully */}
      {(loading || statsLoaded) && (
        <Box
          sx={{
            background:
              'linear-gradient(135deg, #D4603F 0%, #C4533A 100%)',
            color: 'white',
            py: { xs: 8, md: 10 },
          }}
        >
          <Container>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                textAlign: 'center',
                mb: 6,
                fontWeight: 700,
              }}
            >
              Our Impact
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: 'white' }} />
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: { xs: 4, md: 8 },
                }}
              >
                {[
                  { value: stats?.totalResidentsServed ?? '—', label: 'Residents Served' },
                  {
                    value: stats?.totalDonationsReceived != null
                      ? `$${Math.round(stats.totalDonationsReceived).toLocaleString()}`
                      : '—',
                    label: 'Donations Received',
                  },
                  { value: stats?.successfulReintegrations ?? '—', label: 'Successful Reintegrations' },
                  {
                    value: stats?.reintegrationRate != null
                      ? `${stats.reintegrationRate}%`
                      : '—',
                    label: 'Reintegration Rate',
                  },
                ].map((stat) => (
                  <Box key={stat.label} sx={{ textAlign: 'center', minWidth: 140 }}>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' } }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Container>
        </Box>
      )}

      {/* Donate CTA Section */}
      <Box
        id="donate"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'url(/hero-2.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 248, 240, 0.85)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container
          maxWidth="sm"
          sx={{ py: { xs: 10, md: 14 }, textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{ mb: 3, fontWeight: 700, color: '#2D2D2D' }}
          >
            Make a Difference Today
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 5,
              color: 'text.secondary',
              lineHeight: 1.7,
              fontSize: '1.1rem',
            }}
          >
            Harbor of Hope relies on the generosity of donors like you. Contact us
            to learn how your contribution can change lives.
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="mailto:donate@harborofhope.org"
            sx={{
              px: 6,
              py: 1.8,
              fontSize: '1.1rem',
              boxShadow: '0 4px 20px rgba(212,96,63,0.3)',
              '&:hover': {
                boxShadow: '0 6px 24px rgba(212,96,63,0.4)',
              },
            }}
          >
            Support Our Mission
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
