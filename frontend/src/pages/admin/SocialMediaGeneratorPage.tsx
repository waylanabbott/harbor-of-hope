import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  LinearProgress,
  Badge,
  Collapse,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import EmailIcon from '@mui/icons-material/Email';
import CampaignIcon from '@mui/icons-material/Campaign';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { fetchPublicStats } from '../../lib/publicApi';
import type { PublicStats } from '../../types/PublicImpact';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Platform = 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'email';
type Goal = 'donations' | 'volunteers' | 'awareness' | 'event';
type Tone = 'hopeful' | 'urgent' | 'grateful' | 'inspiring';

interface GeneratedPost {
  id: string;
  short: string;
  long: string;
  hashtags: string[];
  cta: string;
  platform: Platform;
  goal: Goal;
  tone: Tone;
  savedAt?: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  facebook: <FacebookIcon />,
  instagram: <InstagramIcon />,
  tiktok: <CampaignIcon />,
  twitter: <XIcon />,
  email: <EmailIcon />,
};

const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'X (Twitter)',
  email: 'Email Newsletter',
};

const PLATFORM_TIPS: Record<Platform, string> = {
  facebook: 'Best with 1-3 paragraphs, an image, and a direct link.',
  instagram: 'Keep it visual. Use line breaks between ideas. Hashtags in first comment work too.',
  tiktok: 'Short, punchy hook in the first line. Speak directly to the viewer.',
  twitter: 'Under 280 characters for the short version. Thread the long version.',
  email: 'Subject line = short version. Body = long version + CTA button.',
};

const PLATFORM_CHAR_LIMITS: Record<Platform, { short: number; long: number }> = {
  facebook: { short: 500, long: 63206 },
  instagram: { short: 500, long: 2200 },
  tiktok: { short: 150, long: 4000 },
  twitter: { short: 280, long: 25000 },
  email: { short: 120, long: 10000 },
};

const BEST_TIMES: Record<Platform, string> = {
  facebook: 'Tue–Thu, 9–11 AM or 1–3 PM',
  instagram: 'Mon/Wed/Fri, 11 AM–1 PM or 7–9 PM',
  tiktok: 'Tue–Thu, 2–5 PM or 7–9 PM',
  twitter: 'Mon–Fri, 8–10 AM or 12–1 PM',
  email: 'Tue/Thu, 10 AM or 2 PM',
};

const TONE_EMOJIS: Record<Tone, string[]> = {
  hopeful: ['🌱', '✨', '🌟', '💛', '🕊️'],
  urgent: ['🚨', '⏰', '❗', '🆘', '💔'],
  grateful: ['🙏', '💖', '🤗', '💕', '🌻'],
  inspiring: ['💪', '🔥', '⭐', '🌈', '🦋'],
};

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  hopeful: 'Warm, optimistic, forward-looking',
  urgent: 'Time-sensitive, action-driven, direct',
  grateful: 'Thankful, heartfelt, donor-centered',
  inspiring: 'Story-driven, empowering, transformational',
};

/* ------------------------------------------------------------------ */
/*  Expanded template library                                          */
/* ------------------------------------------------------------------ */

const OPENINGS: Record<Tone, string[]> = {
  hopeful: [
    'Every girl deserves a future filled with hope.',
    'Hope starts with a single act of kindness.',
    'A new beginning is possible for every child.',
    'When we come together, hope grows.',
    'Behind every number is a girl with a name, a dream, and a future.',
    'Small steps today create giant leaps for these girls tomorrow.',
    'Hope isn\'t just a word here — it\'s what we build every single day.',
    'Picture this: a girl who once had nothing, now laughing, learning, dreaming.',
  ],
  urgent: [
    'Right now, girls in Central America need your help.',
    'The need is urgent — and every moment matters.',
    'We can\'t wait. These children need safety today.',
    'Time is running out for girls trapped in trafficking.',
    'Every day without action is another day a child suffers.',
    'This isn\'t something that can wait until tomorrow.',
    'While you read this, a girl somewhere is waiting for rescue.',
    'The clock is ticking — but YOU can change the outcome.',
  ],
  grateful: [
    'Because of YOU, lives are changing.',
    'We are endlessly grateful for your generosity.',
    'Thank you for believing in these girls\' futures.',
    'Your support makes miracles happen every day.',
    'We couldn\'t do this without people like you.',
    'Every donation, every share, every prayer — it all matters. Thank you.',
    'You showed up for these girls when they needed it most.',
    'Gratitude doesn\'t even begin to cover what your support means.',
  ],
  inspiring: [
    'She walked into our home afraid. Today, she walks with confidence.',
    'From survivor to thriver — this is what your support creates.',
    'Imagine a world where every child feels safe and loved.',
    'One girl. One chance. One life transformed.',
    'She used to hide. Now she leads. That\'s the power of Harbor of Hope.',
    'They told her she\'d never recover. They were wrong.',
    'What does transformation look like? It looks like a girl finding her voice again.',
    'The girl who once couldn\'t look anyone in the eye? She just graduated.',
  ],
};

const MIDDLES: Record<Goal, string[]> = {
  donations: [
    'Your donation provides meals, education, counseling, and a safe home for survivors of trafficking.',
    'Every dollar goes directly toward healing — nutritious food, therapy, schooling, and a loving environment.',
    'A gift of any size changes a life. $25 feeds a girl for a week. $100 covers a month of counseling.',
    'When you give, you\'re not just donating — you\'re giving a girl her childhood back.',
    'Your generosity funds everything from school supplies to trauma therapy. Every cent counts.',
    'Think about what $50 means to you. To a girl in our program, it means safety, meals, and hope for an entire week.',
  ],
  volunteers: [
    'We need passionate people to join our mission — whether locally or from afar.',
    'Volunteers are the backbone of Harbor of Hope. Your time and skills can change everything.',
    'From mentoring to fundraising events, there are so many ways to get involved.',
    'You don\'t need to be in Central America to make a difference. Remote volunteers help with social media, translations, fundraising, and more.',
    'Our volunteers say it transforms their lives too. Come see for yourself.',
    'Whether you can give an hour or a year, we have a place for you.',
  ],
  awareness: [
    'Harbor of Hope provides safety, healing, and new beginnings for girls who are survivors of trafficking in Central America.',
    'Most people don\'t know that thousands of children are trapped in trafficking right now. Sharing this post helps change that.',
    'We treat each other as family where each individual is seen, heard and loved.',
    'Awareness is the first step toward change. When more people know, more people act.',
    'Trafficking isn\'t just something that happens "somewhere else." It\'s happening now, and these girls need us.',
    'Our mission is simple: give every girl a safe home, professional care, and a real chance at life.',
  ],
  event: [
    'Join us for an unforgettable event supporting the girls of Harbor of Hope.',
    'Mark your calendar! We\'re hosting an event to raise awareness and funds for our mission.',
    'Come be part of something bigger — an evening of hope, community, and impact.',
    'This isn\'t just an event — it\'s a movement. And we want you to be part of it.',
    'Great food, inspiring stories, and a chance to change lives. What more could you ask for?',
    'Bring a friend. Bring your family. Let\'s fill the room with people who care.',
  ],
};

const CTAS: Record<Goal, string[]> = {
  donations: [
    'Donate today at the link in our bio.',
    'Give the gift of hope — donate now.',
    'Click the link to make your contribution.',
    'Every gift matters. Donate today.',
    'Ready to change a life? The link is in our bio.',
    'Join hundreds of donors who are making a difference. Give now.',
  ],
  volunteers: [
    'Ready to make a difference? Reach out to us today.',
    'Sign up to volunteer — we\'d love to have you on our team.',
    'DM us or visit our website to learn how you can help.',
    'Drop a comment below if you\'re interested — we\'ll reach out!',
    'Fill out our volunteer form (link in bio) and let\'s get started.',
  ],
  awareness: [
    'Share this post to spread the word.',
    'Follow us and help us reach more people.',
    'Tag someone who needs to hear this story.',
    'Help us raise awareness — every share counts.',
    'Double-tap if you stand with these girls.',
    'Share this with someone who cares. Together we\'re louder.',
  ],
  event: [
    'RSVP now — link in bio!',
    'Save your spot today. We can\'t wait to see you there.',
    'Register now and be part of the change.',
    'Grab your tickets before they\'re gone — link in bio!',
    'Tag someone you\'d bring with you!',
  ],
};

const HASHTAG_SETS: Record<Goal, string[][]> = {
  donations: [
    ['#HarborOfHope', '#GiveHope', '#DonateToday', '#EndTrafficking', '#ChangeALife'],
    ['#HarborOfHope', '#HopeInAction', '#FightTrafficking', '#GrowthAndRenewal', '#GiveBack'],
    ['#HarborOfHope', '#DonateForGood', '#EveryDollarCounts', '#HopeStartsHere', '#NonprofitLife'],
    ['#HarborOfHope', '#BeAHero', '#GiveHopeToday', '#EndChildTrafficking', '#TransformLives'],
  ],
  volunteers: [
    ['#HarborOfHope', '#VolunteerWithUs', '#MakeADifference', '#CommunityImpact', '#JoinTheFight'],
    ['#HarborOfHope', '#BeTheChange', '#VolunteerLife', '#HelpingHands', '#EndTrafficking'],
    ['#HarborOfHope', '#VolunteerOpportunity', '#GiveYourTime', '#NonprofitVolunteer', '#DoGood'],
  ],
  awareness: [
    ['#HarborOfHope', '#EndTrafficking', '#SafeHomes', '#GrowthAndRenewal', '#HopeForGirls'],
    ['#HarborOfHope', '#AwarenessMatters', '#SurvivorStories', '#BreakTheSilence', '#ProtectChildren'],
    ['#HarborOfHope', '#KnowTheNumbers', '#StandWithSurvivors', '#SpeakUp', '#ChildSafety'],
    ['#HarborOfHope', '#HumanTraffickingAwareness', '#NotForSale', '#FreedomForAll', '#HopeOverFear'],
  ],
  event: [
    ['#HarborOfHope', '#HopeEvent', '#CommunityForChange', '#FundraisingEvent', '#TogetherWeHeal'],
    ['#HarborOfHope', '#JoinUs', '#EventForHope', '#MakeAnImpact', '#GrowthAndRenewal'],
    ['#HarborOfHope', '#SaveTheDate', '#HopeGala', '#CommunityEvent', '#FundraiserNight'],
  ],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'hoh_saved_posts';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function charColor(len: number, max: number): 'success' | 'warning' | 'error' {
  const pct = len / max;
  if (pct < 0.75) return 'success';
  if (pct < 0.95) return 'warning';
  return 'error';
}

function loadSaved(): GeneratedPost[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function persistSaved(posts: GeneratedPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function generatePost(
  platform: Platform,
  goal: Goal,
  tone: Tone,
  customTopic: string,
  stats: PublicStats | null,
  includeEmojis: boolean,
): GeneratedPost {
  const emojis = TONE_EMOJIS[tone];
  const e1 = pick(emojis);
  const e2 = pick(emojis.filter((e) => e !== e1));

  const opening = pick(OPENINGS[tone]);
  const middle = pick(MIDDLES[goal]);
  const cta = pick(CTAS[goal]);
  const hashtags = pick(HASHTAG_SETS[goal]);

  let statLine = '';
  if (stats) {
    const lines = [
      `We've served ${stats.totalResidentsServed} residents and counting.`,
      `${stats.successfulReintegrations} girls have been successfully reintegrated into safe families.`,
      `Our reintegration rate is ${stats.reintegrationRate}% — and growing.`,
      `Over $${Math.round(stats.totalDonationsReceived).toLocaleString()} in donations received from generous supporters like you.`,
    ];
    statLine = ' ' + pick(lines);
  }

  let topicLine = '';
  if (customTopic.trim()) {
    topicLine = `\n\n${customTopic.trim()}`;
  }

  const useEmoji = includeEmojis;

  const shortPost =
    platform === 'twitter'
      ? `${useEmoji ? e1 + ' ' : ''}${opening} ${cta}`.slice(0, 275)
      : `${useEmoji ? e1 + ' ' : ''}${opening}${topicLine}\n\n${cta} ${useEmoji ? e2 : ''}`.trim();

  const longPost = `${useEmoji ? e1 + ' ' : ''}${opening}${topicLine}\n\n${middle}${statLine}\n\n${cta} ${useEmoji ? e2 : ''}`.trim();

  return {
    id: uid(),
    short: shortPost,
    long: longPost,
    hashtags,
    cta,
    platform,
    goal,
    tone,
  };
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function CharCounter({ text, max }: { text: string; max: number }) {
  const len = text.length;
  const pct = Math.min((len / max) * 100, 100);
  const color = charColor(len, max);
  return (
    <Box sx={{ mt: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Character count
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color:
              color === 'success'
                ? 'success.main'
                : color === 'warning'
                  ? 'warning.main'
                  : 'error.main',
          }}
        >
          {len.toLocaleString()} / {max.toLocaleString()}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={color}
        sx={{ height: 5, borderRadius: 3 }}
      />
    </Box>
  );
}

interface PostCardProps {
  post: GeneratedPost;
  label: string;
  text: string;
  borderColor: string;
  labelColor: string;
  charLimit: number;
  onCopy: (text: string, label: string) => void;
  onSave: (post: GeneratedPost) => void;
  isSaved: boolean;
}

function PostCard({
  post,
  label,
  text,
  borderColor,
  labelColor,
  charLimit,
  onCopy,
  onSave,
  isSaved,
}: PostCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        border: `2px solid ${borderColor}`,
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {PLATFORM_ICONS[post.platform]}
            <Typography
              variant="overline"
              sx={{ fontWeight: 700, color: labelColor, letterSpacing: 1 }}
            >
              {label}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={isSaved ? 'Saved!' : 'Save to favorites'}>
              <IconButton size="small" onClick={() => onSave(post)} color={isSaved ? 'primary' : 'default'}>
                {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title={`Copy ${label.toLowerCase()}`}>
              <IconButton size="small" onClick={() => onCopy(text, label)}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: '#2D2D2D' }}
        >
          {text}
        </Typography>
        <CharCounter text={text} max={charLimit} />
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SocialMediaGeneratorPage() {
  useEffect(() => {
    document.title = 'Social Media Generator | Harbor of Hope';
  }, []);

  const [platform, setPlatform] = useState<Platform>('instagram');
  const [goal, setGoal] = useState<Goal>('awareness');
  const [tone, setTone] = useState<Tone>('hopeful');
  const [customTopic, setCustomTopic] = useState('');
  const [variations, setVariations] = useState<GeneratedPost[]>([]);
  const [activeVar, setActiveVar] = useState(0);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [saved, setSaved] = useState<GeneratedPost[]>(loadSaved);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    fetchPublicStats().then(setStats).catch(() => {});
  }, []);

  const limits = useMemo(() => PLATFORM_CHAR_LIMITS[platform], [platform]);
  const platformTip = useMemo(() => PLATFORM_TIPS[platform], [platform]);
  const bestTime = useMemo(() => BEST_TIMES[platform], [platform]);

  const handleGenerate = useCallback(() => {
    const posts = Array.from({ length: 3 }, () =>
      generatePost(platform, goal, tone, customTopic, stats, includeEmojis),
    );
    setVariations(posts);
    setActiveVar(0);
  }, [platform, goal, tone, customTopic, stats, includeEmojis]);

  async function handleCopy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(label);
    setCopied(true);
  }

  function handleSave(post: GeneratedPost) {
    setSaved((prev) => {
      const exists = prev.some((p) => p.id === post.id);
      const next = exists
        ? prev.filter((p) => p.id !== post.id)
        : [{ ...post, savedAt: Date.now() }, ...prev].slice(0, 50);
      persistSaved(next);
      return next;
    });
  }

  function handleDeleteSaved(id: string) {
    setSaved((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persistSaved(next);
      return next;
    });
  }

  const isSaved = (id: string) => saved.some((p) => p.id === id);

  const current = variations[activeVar] ?? null;

  return (
    <Box>
      {/* Hero */}
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
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 1.5,
              textShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            Social Media Post Generator
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.95, maxWidth: 600, mx: 'auto', fontWeight: 400 }}
          >
            Create on-brand posts for any platform in seconds. Pick your options, generate 3 variations, and save your favorites.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '380px 1fr' },
            gap: 4,
            alignItems: 'start',
          }}
        >
          {/* ─── Left: Controls ─── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Configure Your Post
              </Typography>

              {/* Platform */}
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={platform}
                  label="Platform"
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                >
                  {(Object.keys(PLATFORM_LABELS) as Platform[]).map((p) => (
                    <MenuItem key={p} value={p}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {PLATFORM_ICONS[p]}
                        {PLATFORM_LABELS[p]}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Alert severity="info" sx={{ borderRadius: 2, py: 0.5 }} icon={<AccessTimeIcon />}>
                <strong>Best times to post:</strong> {bestTime}
              </Alert>

              {/* Goal */}
              <FormControl fullWidth>
                <InputLabel>Goal</InputLabel>
                <Select
                  value={goal}
                  label="Goal"
                  onChange={(e) => setGoal(e.target.value as Goal)}
                >
                  <MenuItem value="donations">Drive Donations</MenuItem>
                  <MenuItem value="volunteers">Recruit Volunteers</MenuItem>
                  <MenuItem value="awareness">Raise Awareness</MenuItem>
                  <MenuItem value="event">Promote an Event</MenuItem>
                </Select>
              </FormControl>

              {/* Tone */}
              <FormControl fullWidth>
                <InputLabel>Tone</InputLabel>
                <Select
                  value={tone}
                  label="Tone"
                  onChange={(e) => setTone(e.target.value as Tone)}
                >
                  {(Object.keys(TONE_DESCRIPTIONS) as Tone[]).map((t) => (
                    <MenuItem key={t} value={t}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {t}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {TONE_DESCRIPTIONS[t]}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Alert
                severity="info"
                variant="outlined"
                sx={{ borderRadius: 2, py: 0.5 }}
              >
                <strong>Tone preview:</strong>{' '}
                {TONE_EMOJIS[tone].join(' ')} — {TONE_DESCRIPTIONS[tone]}
              </Alert>

              {/* Emoji toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={includeEmojis}
                    onChange={(e) => setIncludeEmojis(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Include Emojis
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {includeEmojis
                        ? TONE_EMOJIS[tone].slice(0, 3).join(' ')
                        : 'Text only'}
                    </Typography>
                  </Box>
                }
                sx={{ ml: 0 }}
              />

              {/* Custom topic */}
              <TextField
                label="Custom Topic or Detail (optional)"
                placeholder="e.g. 'We just opened our 3rd safehouse!' or 'Giving Tuesday is next week'"
                multiline
                rows={3}
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                fullWidth
              />

              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={handleGenerate}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(212,96,63,0.3)',
                }}
              >
                Generate 3 Variations
              </Button>
            </Paper>

            {/* Saved posts panel */}
            <Paper
              sx={{
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 3,
                  py: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => setShowSaved((v) => !v)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookmarkIcon sx={{ color: '#E8935A' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Saved Posts
                  </Typography>
                  <Badge badgeContent={saved.length} color="primary" sx={{ ml: 1 }} />
                </Box>
                {showSaved ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              <Collapse in={showSaved}>
                <Divider />
                {saved.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2">
                      No saved posts yet. Click the bookmark icon on any generated post to save it.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {saved.map((s) => (
                      <Box
                        key={s.id}
                        sx={{
                          px: 3,
                          py: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            mb: 0.5,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {PLATFORM_ICONS[s.platform]}
                            <Chip
                              label={s.goal}
                              size="small"
                              sx={{ textTransform: 'capitalize', fontSize: '0.7rem', height: 22 }}
                            />
                            <Chip
                              label={s.tone}
                              size="small"
                              variant="outlined"
                              sx={{ textTransform: 'capitalize', fontSize: '0.7rem', height: 22 }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0 }}>
                            <Tooltip title="Copy short version">
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(s.short, 'Saved post')}
                              >
                                <ContentCopyIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteSaved(s.id)}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            color: 'text.secondary',
                            lineHeight: 1.5,
                          }}
                        >
                          {s.short}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Collapse>
            </Paper>
          </Box>

          {/* ─── Right: Output ─── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {variations.length === 0 ? (
              <Paper
                sx={{
                  p: 6,
                  borderRadius: 4,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <AutoAwesomeIcon
                  sx={{ fontSize: 48, color: '#E8935A', mb: 2, opacity: 0.5 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Your posts will appear here
                </Typography>
                <Typography variant="body2">
                  Choose your platform, goal, and tone, then click <strong>Generate 3 Variations</strong>.
                </Typography>
              </Paper>
            ) : (
              <>
                {/* Variation tabs */}
                <Paper
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                  }}
                >
                  <Tabs
                    value={activeVar}
                    onChange={(_, v) => setActiveVar(v)}
                    variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 2,
                      },
                    }}
                    TabIndicatorProps={{
                      sx: {
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                        backgroundColor: '#E8735A',
                      },
                    }}
                  >
                    <Tab label="Variation A" icon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                    <Tab label="Variation B" icon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                    <Tab label="Variation C" icon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                  </Tabs>
                </Paper>

                {current && (
                  <>
                    {/* Short */}
                    <PostCard
                      post={current}
                      label="Short Version"
                      text={current.short}
                      borderColor="rgba(212,96,63,0.15)"
                      labelColor="#D4603F"
                      charLimit={limits.short}
                      onCopy={handleCopy}
                      onSave={handleSave}
                      isSaved={isSaved(current.id)}
                    />

                    {/* Long */}
                    <PostCard
                      post={current}
                      label="Long Version"
                      text={current.long}
                      borderColor="rgba(91,140,122,0.15)"
                      labelColor="#5B8C7A"
                      charLimit={limits.long}
                      onCopy={handleCopy}
                      onSave={handleSave}
                      isSaved={isSaved(current.id)}
                    />

                    {/* Copy full post (short + hashtags) */}
                    <Button
                      variant="outlined"
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={() =>
                        handleCopy(
                          `${current.short}\n\n${current.hashtags.join(' ')}`,
                          'Full post + hashtags',
                        )
                      }
                      sx={{
                        borderRadius: 3,
                        fontWeight: 600,
                        textTransform: 'none',
                        py: 1.5,
                      }}
                    >
                      Copy Short Version + Hashtags (Ready to Paste)
                    </Button>

                    {/* Hashtags */}
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1.5,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Suggested Hashtags
                        </Typography>
                        <Tooltip title="Copy all hashtags">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleCopy(current.hashtags.join(' '), 'Hashtags')
                            }
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {current.hashtags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            sx={{
                              fontWeight: 600,
                              backgroundColor: 'rgba(212,96,63,0.08)',
                              color: '#D4603F',
                              border: '1px solid rgba(212,96,63,0.2)',
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>

                    {/* Platform tip */}
                    <Alert
                      severity="info"
                      sx={{ borderRadius: 3 }}
                      icon={PLATFORM_ICONS[platform]}
                    >
                      <strong>{PLATFORM_LABELS[platform]} tip:</strong> {platformTip}
                    </Alert>

                    <Divider />

                    {/* Regenerate */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Button
                        variant="text"
                        startIcon={<RefreshIcon />}
                        onClick={handleGenerate}
                        sx={{
                          fontWeight: 600,
                          textTransform: 'none',
                          color: '#E8735A',
                        }}
                      >
                        Not quite right? Generate 3 more
                      </Button>
                    </Box>

                    {/* Brand voice */}
                    <Alert
                      severity="success"
                      sx={{ borderRadius: 3 }}
                      icon={<AutoAwesomeIcon />}
                    >
                      <strong>Brand voice reminder:</strong> Harbor of Hope's voice is warm,
                      hopeful, and family-oriented. Always center the girls' dignity and
                      progress — never use pity-based language.
                    </Alert>
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message={`${copiedField} copied to clipboard`}
      />
    </Box>
  );
}
