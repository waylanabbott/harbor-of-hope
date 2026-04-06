import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
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

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const data = await fetchPublicStats();
        if (!cancelled) setStats(data);
      } catch {
        // Stats are non-critical for landing page
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
          background:
            'linear-gradient(135deg, #D4603F 0%, #E8935A 40%, #F5C89A 75%, #FFF8F0 100%)',
          color: 'white',
          py: { xs: 10, md: 16 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 70%)',
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
              textShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
              textShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
          >
            Safe homes for girls who are survivors of trafficking in Central
            America
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="#donate"
            aria-label="Donate now - scroll to donation section"
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
            Donate Now
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
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: 'rgba(212,96,63,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <VolunteerActivismIcon
                    sx={{ fontSize: 36, color: 'primary.main' }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 1.5, fontWeight: 700, color: '#2D2D2D' }}
                >
                  Safe Homes
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', lineHeight: 1.7 }}
                >
                  Providing secure, nurturing environments for girls rescued from
                  trafficking in Central America.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: 'rgba(91,140,122,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <SchoolIcon
                    sx={{ fontSize: 36, color: 'secondary.main' }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 1.5, fontWeight: 700, color: '#2D2D2D' }}
                >
                  Education & Healing
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', lineHeight: 1.7 }}
                >
                  Comprehensive programs including education, therapy, and life
                  skills training for recovery and growth.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: 'rgba(212,96,63,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <PublicIcon
                    sx={{ fontSize: 36, color: 'primary.main' }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 1.5, fontWeight: 700, color: '#2D2D2D' }}
                >
                  Community Impact
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', lineHeight: 1.7 }}
                >
                  Building partnerships with local communities to prevent
                  trafficking and support survivors' reintegration.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Impact Stats Section */}
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
          <Grid container spacing={4}>
            {loading ? (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress sx={{ color: 'white' }} />
                </Box>
              </Grid>
            ) : (
              <>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '2rem', md: '3rem' },
                      }}
                    >
                      {stats?.totalResidentsServed ?? 0}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ opacity: 0.9, mt: 1 }}
                    >
                      Residents Served
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '2rem', md: '3rem' },
                      }}
                    >
                      $
                      {(
                        stats?.totalDonationsReceived ?? 0
                      ).toLocaleString()}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ opacity: 0.9, mt: 1 }}
                    >
                      Donations Received
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '2rem', md: '3rem' },
                      }}
                    >
                      {stats?.successfulReintegrations ?? 0}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ opacity: 0.9, mt: 1 }}
                    >
                      Successful Reintegrations
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '2rem', md: '3rem' },
                      }}
                    >
                      {stats?.reintegrationRate ?? 0}%
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ opacity: 0.9, mt: 1 }}
                    >
                      Reintegration Rate
                    </Typography>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Donate CTA Section */}
      <Box sx={{ bgcolor: '#FFF8F0' }}>
        <Container
          maxWidth="sm"
          sx={{ py: { xs: 10, md: 14 }, textAlign: 'center' }}
          id="donate"
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
            Contact Us to Donate
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
