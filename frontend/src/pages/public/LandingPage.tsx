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
import { motion } from 'framer-motion';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import SchoolIcon from '@mui/icons-material/School';
import PublicIcon from '@mui/icons-material/Public';
import { Link as RouterLink } from 'react-router-dom';
import { fetchPublicStats } from '../../lib/publicApi';
import type { PublicStats } from '../../types/PublicImpact';
import AnimateOnScroll, { StaggerContainer, StaggerItem } from '../../components/ui/AnimateOnScroll';
import AnimatedCounter from '../../components/ui/AnimatedCounter';

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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
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
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
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
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Button
              variant="contained"
              size="large"
              href="/login"
              aria-label="Support our mission - log in to get started"
              sx={{
                px: 6,
                py: 1.8,
                fontSize: '1.15rem',
                bgcolor: 'white',
                color: '#D4603F',
                fontWeight: 700,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#FFF8F0',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Support Our Mission
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Mission Cards Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <AnimateOnScroll variant="slideUp">
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
              maxWidth: 720,
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.7,
            }}
          >
            We are Harbor of Hope: full of hope, love and new beginnings. Our focus
            is progress in all aspects of life. We treat each other as family where
            each individual is seen, heard and loved. We create fun memories, we
            fight for justice and we acknowledge God in all we do.
          </Typography>
        </AnimateOnScroll>
        <StaggerContainer
          staggerDelay={0.15}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '32px',
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
            <StaggerItem key={card.title} style={{ flex: '1 1 280px', minWidth: 0 }}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
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
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'scale(1.1) rotate(5deg)' },
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
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>

      {/* Learn More CTA */}
      <AnimateOnScroll variant="fade" duration={0.8}>
        <Box
          sx={{
            bgcolor: '#FFF8F0',
            py: { xs: 6, md: 8 },
            textAlign: 'center',
          }}
        >
          <Container maxWidth="sm">
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 700, mb: 2, color: '#2D2D2D' }}
            >
              Want to Know More?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 4 }}
            >
              Learn how Harbor of Hope is achieving our mission through programs that
              address every aspect of a girl&apos;s wellbeing — physical, emotional,
              social, and spiritual.
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/about"
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1.05rem',
                boxShadow: '0 4px 20px rgba(212,96,63,0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 32px rgba(212,96,63,0.4)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Read More About Us
            </Button>
          </Container>
        </Box>
      </AnimateOnScroll>

      {/* Impact Stats Section */}
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
            <AnimateOnScroll variant="slideUp">
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
            </AnimateOnScroll>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: 'white' }} />
              </Box>
            ) : (
              <StaggerContainer
                staggerDelay={0.2}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '48px',
                }}
              >
                {[
                  {
                    value: stats?.totalResidentsServed ?? 0,
                    label: 'Residents Served',
                    isNumber: true,
                  },
                  {
                    value: stats?.totalDonationsReceived ?? 0,
                    label: 'Donations Received',
                    prefix: '$',
                    isNumber: true,
                  },
                  {
                    value: stats?.successfulReintegrations ?? 0,
                    label: 'Successful Reintegrations',
                    isNumber: true,
                  },
                  {
                    value: stats?.reintegrationRate ?? 0,
                    label: 'Reintegration Rate',
                    suffix: '%',
                    isNumber: true,
                  },
                ].map((stat) => (
                  <StaggerItem key={stat.label}>
                    <Box sx={{ textAlign: 'center', minWidth: 140 }}>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' } }}
                      >
                        {stat.isNumber && stat.value ? (
                          <AnimatedCounter
                            value={Number(stat.value)}
                            prefix={stat.prefix}
                            suffix={stat.suffix}
                            duration={2200}
                          />
                        ) : (
                          '\u2014'
                        )}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </Container>
        </Box>
      )}

      {/* Donate CTA Section */}
      <AnimateOnScroll variant="fade" duration={1}>
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
            <AnimateOnScroll variant="slideUp" delay={0.1}>
              <Typography
                variant="h4"
                component="h2"
                sx={{ mb: 3, fontWeight: 700, color: '#2D2D2D' }}
              >
                Make a Difference Today
              </Typography>
            </AnimateOnScroll>
            <AnimateOnScroll variant="slideUp" delay={0.2}>
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
            </AnimateOnScroll>
            <AnimateOnScroll variant="scale" delay={0.4}>
              <Button
                variant="contained"
                size="large"
                href="/register"
                sx={{
                  px: 6,
                  py: 1.8,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 20px rgba(212,96,63,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 32px rgba(212,96,63,0.4)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Support Our Mission
              </Button>
            </AnimateOnScroll>
          </Container>
        </Box>
      </AnimateOnScroll>
    </Box>
  );
}
