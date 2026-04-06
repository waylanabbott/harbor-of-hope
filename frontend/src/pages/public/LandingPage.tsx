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
import heroImage from '../../assets/hero.png';
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
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
            Harbor of Hope
          </Typography>
          <Typography variant="h5" component="p" sx={{ opacity: 0.9, mb: 4 }}>
            Safe homes for girls who are survivors of trafficking in Central
            America
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="#donate"
            aria-label="Donate now - scroll to donation section"
            sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
          >
            Donate Now
          </Button>
        </Container>
      </Box>

      {/* Mission Cards Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 4 }}>
          Our Mission
        </Typography>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <VolunteerActivismIcon
                  sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
                />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Safe Homes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Providing secure, nurturing environments for girls rescued from
                  trafficking in Central America.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <SchoolIcon
                  sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }}
                />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Education & Healing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comprehensive programs including education, therapy, and life
                  skills training for recovery and growth.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <PublicIcon
                  sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
                />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Community Impact
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Building partnerships with local communities to prevent
                  trafficking and support survivors' reintegration.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Impact Stats Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container>
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
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {stats?.totalResidentsServed ?? 0}
                    </Typography>
                    <Typography variant="body1">Residents Served</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      $
                      {(
                        stats?.totalDonationsReceived ?? 0
                      ).toLocaleString()}
                    </Typography>
                    <Typography variant="body1">Donations Received</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {stats?.successfulReintegrations ?? 0}
                    </Typography>
                    <Typography variant="body1">
                      Successful Reintegrations
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {stats?.reintegrationRate ?? 0}%
                    </Typography>
                    <Typography variant="body1">Reintegration Rate</Typography>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Donate CTA Section */}
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }} id="donate">
        <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
          Make a Difference Today
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Harbor of Hope relies on the generosity of donors like you. Contact us
          to learn how your contribution can change lives.
        </Typography>
        <Button
          variant="contained"
          size="large"
          href="mailto:donate@harborofhope.org"
        >
          Contact Us to Donate
        </Button>
      </Container>
    </Box>
  );
}
