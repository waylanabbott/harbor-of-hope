import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Divider,
  Avatar,
} from '@mui/material';
import { motion } from 'framer-motion';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SecurityIcon from '@mui/icons-material/Security';
import ChurchIcon from '@mui/icons-material/Church';
import PsychologyIcon from '@mui/icons-material/Psychology';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import AnimateOnScroll, { StaggerContainer, StaggerItem } from '../../components/ui/AnimateOnScroll';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface ProgramSection {
  title: string;
  icon: React.ReactNode;
  color: string;
  image: string;
  quote: string;
  description: string[];
  note?: string;
}

const PROGRAMS: ProgramSection[] = [
  {
    title: 'Physiological Needs',
    icon: <LocalHospitalIcon />,
    color: '#D4603F',
    image: '/about/physiological.jpg',
    quote:
      '\u201CHarbor of Hope helped me to end the abuse I had been experiencing since preschool. They are the family that helped me to overcome everything I was afraid of and to heal from the abuse I experienced. And because of Harbor of Hope, I felt the true love of a family.\u201D',
    description: [
      'To provide for the physical needs of each girl, Harbor of Hope provides nutritious meals, vitamins, comfortable beds for adequate sleep, and appropriate exercise for their growing bodies.',
      'Harbor of Hope also coordinates with doctors and hospitals nearby to provide needed services such as medical and dental care for all their physical needs.',
    ],
  },
  {
    title: 'Biological Needs',
    icon: <SecurityIcon />,
    color: '#5B8C7A',
    image: '/about/biological.jpg',
    quote:
      '\u201CAt 13 years old I thought my life was hopeless, that there was nowhere to turn, because the abuse done to me was so painful! In the last year and a half at Harbor of Hope I found light and help to make sense of my life. Harbor of Hope is where I experienced love and I received help in my healing process and with my fight for justice.\u201D',
    description: [
      'The safe house that shelters the girls is surrounded by a protection wall with cameras and is built strong for the constant tropical storms.',
      'Each staff member is well trained to comfort and care for the children so they are safe and they feel safe.',
    ],
  },
  {
    title: 'Spiritual Needs',
    icon: <ChurchIcon />,
    color: '#5B9BD5',
    image: '/about/spiritual.jpg',
    quote:
      '\u201CIf I were to describe Harbor of Hope, it would be \u201CHOME\u201D. It was one of the best times of my life where I found safety and healing from abuse. Harbor of Hope means a lot to me and all of the girls who were survivors as well. Harbor of Hope extends help and does not ask anything in return. They helped us grow and progress. I love how they taught us to become resilient and grow our faith in the gospel of Jesus Christ. As we went to church, I loved that we, residents, went together and were willing to learn. Harbor of Hope has instilled in us forever memories and valuable knowledge to keep.\u201D',
    description: [
      'Each child is invited daily to participate in singing songs of praise and in group prayers and scripture reading. Each week the children are invited to church services and to spiritual activities.',
      'Many of the girls learn to pray for their first time at Harbor of Hope and most say that they found their healing through prayer.',
    ],
    note: '*No child is forced or coerced to attend or believe anything that is offered.',
  },
  {
    title: 'Psychological Needs',
    icon: <PsychologyIcon />,
    color: '#E6A817',
    image: '/about/psychological.jpg',
    quote:
      '\u201CHarbor of Hope directs us through life\u2019s challenges and difficult times. I\u2019m grateful for the times when we would share what we learned during group sessions, or when we would write in our journals. I loved when we would play instruments and of course compose songs about what Harbor of Hope means to us.\u201D',
    description: [
      'Each week the girls are taught the principles of emotional resilience and are coached in using those principles as difficulties inevitably arise.',
      'The girls are walked through the skills of resolving conflict, finding healthy ways to cope and healthy thinking patterns.',
    ],
  },
  {
    title: 'Social Needs',
    icon: <Diversity3Icon />,
    color: '#9B59B6',
    image: '/about/social.jpg',
    quote:
      '\u201COne thing I will always remember from my stay is how we, residents, created such a beautiful connection. Sometimes, we had misunderstandings or conflicts but we learned to forgive, understand our imperfections, and most of all, love our sisters. We built a long term support system who checks on each other even after leaving the shelter.\u201D',
    description: [
      'One thing that makes Harbor of Hope unique is that although most of the girls who come are teenagers, there are no cliques, popularity contests or ranks.',
      'Each girl is taught that she is divine and that her worth is eternal, just as all the others at the shelter. The girls learn to overcome their differences and find comfort in friendships they never imagined possible.',
    ],
  },
  {
    title: 'Love and Belonging',
    icon: <FavoriteIcon />,
    color: '#E8735A',
    image: '/about/love.jpg',
    quote:
      '\u201CHarbor of Hope for me is a family. The staff helped me understand myself and my life circumstances. They helped me find answers to my questions and they gave me the love and attention I never had from my own family. I will never forget the time when I was at my lowest and the Mamas and the management gave me comfort and told me that all of my sufferings had purpose. During that time I found relief and hope. I\u2019m also grateful that we got to celebrate our birthdays there; it made us feel seen and loved.\u201D',
    description: [
      'Friendship, inclusion, respect, and intimacy in friendships and family relationships are essential to a happy life.',
      'Many of the girls do not have healthy relationships outside of Harbor of Hope and come to see the staff and fellow residents as their closest friends and family. Those relationships make life fulfilling and worthwhile.',
    ],
  },
];

const TESTIMONIALS = [
  {
    text: 'Harbor of Hope helped me to end the abuse I had been experiencing since preschool. They are the family that helped me to overcome everything I was afraid of and to heal from the abuse I experienced.',
    attribution: 'Former Resident',
  },
  {
    text: 'At 13 years old I thought my life was hopeless, that there was nowhere to turn. In the last year and a half at Harbor of Hope I found light and help to make sense of my life.',
    attribution: 'Former Resident',
  },
  {
    text: 'If I were to describe Harbor of Hope, it would be \u201CHOME\u201D. It was one of the best times of my life where I found safety and healing from abuse.',
    attribution: 'Former Resident',
  },
  {
    text: 'Harbor of Hope directs us through life\u2019s challenges and difficult times. I\u2019m grateful for the times when we would share what we learned during group sessions.',
    attribution: 'Former Resident',
  },
];

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function ProgramCard({ program, index }: { program: ProgramSection; index: number }) {
  const isReversed = index % 2 === 1;

  return (
    <AnimateOnScroll variant={isReversed ? 'slideLeft' : 'slideRight'} duration={0.7}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: {
            xs: 'column',
            md: isReversed ? 'row-reverse' : 'row',
          },
          mb: 6,
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Box
          sx={{
            flex: '0 0 40%',
            minHeight: { xs: 260, md: 360 },
            bgcolor: '#f0ebe6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={program.image}
            alt={program.title}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.style.display = 'none';
            }}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          />
        </Box>

        <Box sx={{ flex: 1, p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar sx={{ bgcolor: program.color, width: 44, height: 44 }}>
              {program.icon}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2D2D2D' }}>
              {program.title}
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              bgcolor: 'rgba(91,140,122,0.06)',
              borderLeft: `4px solid ${program.color}`,
              p: 2.5,
              mb: 3,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.7 }}
            >
              {program.quote}
            </Typography>
          </Paper>

          {program.description.map((para, i) => (
            <Typography
              key={i}
              variant="body1"
              sx={{ color: 'text.secondary', lineHeight: 1.8, mb: i < program.description.length - 1 ? 2 : 0 }}
            >
              {para}
            </Typography>
          ))}

          {program.note && (
            <Typography variant="caption" sx={{ mt: 2, color: 'text.disabled', fontStyle: 'italic' }}>
              {program.note}
            </Typography>
          )}
        </Box>
      </Paper>
    </AnimateOnScroll>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About | Harbor of Hope';
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: { xs: 10, md: 16 },
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
            background: 'linear-gradient(135deg, rgba(91,140,122,0.82) 0%, rgba(45,45,45,0.75) 100%)',
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
              variant="h3"
              component="h1"
              sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3rem' }, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
            >
              About Harbor of Hope
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Typography
              variant="h6"
              component="p"
              sx={{ opacity: 0.93, maxWidth: 640, mx: 'auto', lineHeight: 1.7, textShadow: '0 1px 6px rgba(0,0,0,0.2)' }}
            >
              We are Harbor of Hope: full of hope, love and new beginnings. Our focus
              is progress in all aspects of life. We treat each other as family where
              each individual is seen, heard and loved. We create fun memories, we
              fight for justice and we acknowledge God in all we do.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Programs and Services Grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <AnimateOnScroll variant="slideUp">
          <Typography
            variant="h4"
            component="h2"
            sx={{ textAlign: 'center', fontWeight: 700, mb: 2, color: '#2D2D2D' }}
          >
            Our Programs and Services
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', mb: 8, color: 'text.secondary', maxWidth: 640, mx: 'auto', lineHeight: 1.7 }}
          >
            Harbor of Hope addresses the whole person — physical, emotional, social,
            and spiritual — so every girl can heal and thrive.
          </Typography>
        </AnimateOnScroll>

        {/* Quick-glance icon cards */}
        <StaggerContainer
          staggerDelay={0.08}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '24px',
            marginBottom: '64px',
          }}
        >
          {PROGRAMS.map((p) => (
            <StaggerItem key={p.title}>
              <Card
                sx={{
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'transform .3s ease, box-shadow .3s ease',
                  '&:hover': { transform: 'translateY(-6px) scale(1.02)', boxShadow: '0 12px 32px rgba(0,0,0,0.12)' },
                  cursor: 'pointer',
                }}
                onClick={() => {
                  document.getElementById(p.title.toLowerCase().replace(/\s+/g, '-'))?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Box
                  sx={{
                    height: 160,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(240, 235, 230, 0.85)',
                    background:
                      'radial-gradient(circle at 30% 20%, rgba(212,96,63,0.10), transparent 55%), radial-gradient(circle at 70% 80%, rgba(91,140,122,0.10), transparent 55%)',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: p.color,
                      width: 76,
                      height: 76,
                      boxShadow: '0 10px 26px rgba(0,0,0,0.12)',
                      transition: 'transform 0.3s ease',
                      '.MuiCard-root:hover &': { transform: 'scale(1.1)' },
                    }}
                  >
                    <Box sx={{ fontSize: 36, display: 'flex', alignItems: 'center' }}>{p.icon}</Box>
                  </Avatar>
                </Box>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2D2D2D', fontSize: '0.85rem' }}>
                    {p.title}
                  </Typography>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Detailed sections */}
        {PROGRAMS.map((p, idx) => (
          <Box key={p.title} id={p.title.toLowerCase().replace(/\s+/g, '-')}>
            <ProgramCard program={p} index={idx} />
          </Box>
        ))}
      </Container>

      {/* Testimonials */}
      <Box sx={{ bgcolor: '#FFF8F0', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <AnimateOnScroll variant="slideUp">
            <Typography
              variant="h4"
              component="h2"
              sx={{ textAlign: 'center', fontWeight: 700, mb: 6, color: '#2D2D2D' }}
            >
              Voices of Hope
            </Typography>
          </AnimateOnScroll>
          <StaggerContainer
            staggerDelay={0.12}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '32px',
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <StaggerItem key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    height: '100%',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <FormatQuoteIcon
                    sx={{ fontSize: 40, color: 'rgba(212,96,63,0.15)', position: 'absolute', top: 16, left: 16 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.8, mb: 2, mt: 2 }}
                  >
                    &ldquo;{t.text}&rdquo;
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                    &mdash; {t.attribution}
                  </Typography>
                </Paper>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Box>

      {/* Get to Know Us */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="md">
          <AnimateOnScroll variant="scale" duration={0.8}>
            <Box
              component="img"
              src="/about/get-to-know.jpg"
              alt="Get to know Harbor of Hope"
              sx={{
                width: '100%',
                maxWidth: 520,
                mx: 'auto',
                mb: { xs: 5, md: 6 },
                display: 'block',
                aspectRatio: '1 / 1.15',
                objectFit: 'cover',
                borderRadius: '999px',
              }}
            />
          </AnimateOnScroll>
          <AnimateOnScroll variant="slideUp" delay={0.1}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                mb: 4,
                fontWeight: 800,
                color: '#E8735A',
                fontFamily: '"Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive',
                letterSpacing: 0.5,
              }}
            >
              Get to know Us
            </Typography>
          </AnimateOnScroll>

          <AnimateOnScroll variant="slideUp" delay={0.2}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '12px 1fr' },
                gap: { xs: 2, sm: 3 },
                alignItems: 'start',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: { xs: 56, sm: 72 },
                  bgcolor: '#E8735A',
                  borderRadius: 8,
                  mx: { xs: 0, sm: 0 },
                }}
              />

              <Box>
                <Typography
                  variant="h6"
                  component="p"
                  sx={{
                    fontWeight: 800,
                    color: '#2D2D2D',
                    lineHeight: 1.6,
                    mb: 4,
                    fontSize: { xs: '1.05rem', sm: '1.2rem' },
                  }}
                >
                  Harbor of Hope is a 501c3 organization (EIN 81-3220618) created to meet the needs of children-survivors of sexual abuse and sex trafficking in Central America by providing a safe haven and professional rehabilitation services so children can successfully reintegrate back into family life and society.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.9, fontSize: '1.05rem' }}>
                    There is a great need for residential shelters in Central America for children who are trapped in abuse or who are sexually trafficked. Harbor of Hope has stepped up to fill the need for female survivors between the ages of 8 to 18.
                  </Typography>

                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.9, fontSize: '1.05rem' }}>
                    Harbor of Hope has two residential style shelters, that caters to up to 20 children each. The children are rescued by the local police department or anti-trafficking agents who refer the children through the Department of Social Welfare and Development (DSWD) to Harbor of Hope. The social worker in the sanctuary will assist the child in transitioning into their new environment.
                  </Typography>

                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.9, fontSize: '1.05rem' }}>
                    Once in the home, the children will be provided with counseling, medical services, daily needs and an individualized education. Partners of Harbor of Hope will be working toward justice for each child in order to ensure a safe reintegration into society. Harbor of Hope believes that the family unit is the ideal place for any child and will coordinate with the DSWD to find suitable families for each child. Whether a child is placed with their birth family, a foster family or an adoptive family, Harbor of Hope will provide family counseling to assist in the transition.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </AnimateOnScroll>
        </Container>
      </Box>
    </Box>
  );
}
