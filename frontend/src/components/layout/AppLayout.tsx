import { useState } from 'react';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Breadcrumbs,
  Link,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MenuIcon from '@mui/icons-material/Menu';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import FontSizeSelector from '../ui/DarkModeToggle';
import Footer from './Footer';
import CookieConsentBanner from '../ui/CookieConsentBanner';
import WaveTransition from '../ui/WaveTransition';

const adminPageNames: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/residents': 'Residents',
  '/admin/donors': 'Supporters',
  '/admin/sessions': 'Sessions',
  '/admin/visits': 'Visits',
  '/admin/reports': 'Reports',
  '/admin/social': 'Social Media',
  '/admin/users': 'Users',
};

function AppLayout() {
  const { authSession, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const isAdminRoute = location.pathname.startsWith('/admin');

  const isAdmin = authSession.roles.includes('Admin');
  const isDonor = authSession.roles.includes('Donor');

  const handleHamburgerClick = () => {
    if (isAdminRoute) {
      // On admin routes, toggle the admin sidebar
      setSidebarOpen((prev) => !prev);
    } else {
      // On public/donor routes, toggle the mobile nav menu
      setMobileMenuOpen(true);
    }
  };

  const navigateAndClose = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        ...(isAdminRoute ? { height: '100vh', overflow: 'hidden' } : { minHeight: '100vh' }),
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/hero-2.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.06,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* Harbor wave page transition */}
      <WaveTransition />

      {/* Skip to main content link for accessibility */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          '&:focus': {
            position: 'static',
            width: 'auto',
            height: 'auto',
            padding: '8px 16px',
            backgroundColor: 'primary.main',
            color: 'white',
            zIndex: 9999,
          },
        }}
      >
        Skip to main content
      </Box>

      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Harbor of Hope logo"
              sx={{
                height: 76,
                width: 76,
                borderRadius: '50%',
                objectFit: 'cover',
                // Tight crop to remove large white padding in source image
                clipPath: 'circle(50% at 54% 40%)',
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Harbor of Hope
            </Typography>
          </Box>

          {/* Hamburger menu button -- visible only on mobile */}
          {!isLoading && isMobile && (
            <IconButton
              color="inherit"
              aria-label="Open navigation menu"
              onClick={handleHamburgerClick}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Desktop navigation buttons -- hidden on mobile */}
          {/* Issue 23: Active page indicator via underline */}
          {!isLoading && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button
                color="inherit"
                component={RouterLink}
                to="/"
                sx={{
                  borderBottom: location.pathname === '/' ? '2px solid white' : '2px solid transparent',
                  borderRadius: 0,
                  pb: 0.5,
                }}
              >
                Home
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/about"
                sx={{
                  borderBottom: location.pathname === '/about' ? '2px solid white' : '2px solid transparent',
                  borderRadius: 0,
                  pb: 0.5,
                }}
              >
                About
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/impact"
                sx={{
                  borderBottom: location.pathname === '/impact' ? '2px solid white' : '2px solid transparent',
                  borderRadius: 0,
                  pb: 0.5,
                }}
              >
                Impact
              </Button>

              {!isAuthenticated ? (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/login"
                    sx={{
                      borderBottom: location.pathname === '/login' ? '2px solid white' : '2px solid transparent',
                      borderRadius: 0,
                      pb: 0.5,
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/register"
                    sx={{
                      borderBottom: location.pathname === '/register' ? '2px solid white' : '2px solid transparent',
                      borderRadius: 0,
                      pb: 0.5,
                    }}
                  >
                    Register
                  </Button>
                </>
              ) : (
                <>
                  {isAdmin && (
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/admin/dashboard"
                      sx={{
                        borderBottom: location.pathname.startsWith('/admin') ? '2px solid white' : '2px solid transparent',
                        borderRadius: 0,
                        pb: 0.5,
                      }}
                    >
                      Admin
                    </Button>
                  )}

                  {isDonor && (
                    <>
                      <Button
                        color="inherit"
                        component={RouterLink}
                        to="/donor/dashboard"
                        sx={{
                          borderBottom: location.pathname === '/donor/dashboard' ? '2px solid white' : '2px solid transparent',
                          borderRadius: 0,
                          pb: 0.5,
                        }}
                      >
                        Donate
                      </Button>
                      <Button
                        color="inherit"
                        component={RouterLink}
                        to="/donor/donations"
                        sx={{
                          borderBottom: location.pathname === '/donor/donations' ? '2px solid white' : '2px solid transparent',
                          borderRadius: 0,
                          pb: 0.5,
                        }}
                      >
                        My Donations
                      </Button>
                    </>
                  )}

                  {/* Font size selector */}
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}>
                    <FontSizeSelector />
                  </Box>

                  {/* User avatar with dropdown menu */}
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        mr: 1,
                        display: { xs: 'none', lg: 'block' },
                        opacity: 0.9,
                      }}
                    >
                      {authSession.email}
                    </Typography>
                    <IconButton
                      onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                      size="small"
                      aria-label="User menu"
                      aria-controls={userMenuAnchor ? 'user-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={userMenuAnchor ? 'true' : undefined}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          fontSize: '0.875rem',
                        }}
                      >
                        {(authSession.email ?? '?')[0].toUpperCase()}
                      </Avatar>
                    </IconButton>
                    <Menu
                      id="user-menu"
                      anchorEl={userMenuAnchor}
                      open={Boolean(userMenuAnchor)}
                      onClose={() => setUserMenuAnchor(null)}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                      <MenuItem disabled sx={{ opacity: '1 !important' }}>
                        <Typography variant="body2" color="text.secondary">
                          {authSession.email}
                        </Typography>
                      </MenuItem>
                      <Divider />
                      <MenuItem
                        onClick={() => {
                          setUserMenuAnchor(null);
                          navigate('/manage-mfa');
                        }}
                      >
                        <ListItemIcon>
                          <SecurityIcon fontSize="small" />
                        </ListItemIcon>
                        MFA Settings
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setUserMenuAnchor(null);
                          navigate('/logout');
                        }}
                      >
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Logout
                      </MenuItem>
                    </Menu>
                  </Box>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {isAdminRoute ? (
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* On mobile, AdminSidebar renders as temporary overlay; on desktop, inline persistent */}
          <AdminSidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((prev) => !prev)}
            isMobile={isMobile}
          />
          <Box
            component="main"
            id="main-content"
            sx={{
              flex: 1,
              p: 3,
              overflow: 'auto',
            }}
          >
            {/* Issue 26: Admin breadcrumbs */}
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ mb: 2 }}
              aria-label="breadcrumb"
            >
              <Link
                component={RouterLink}
                to="/admin/dashboard"
                underline="hover"
                color="text.secondary"
                variant="body2"
              >
                Admin
              </Link>
              <Typography variant="body2" color="text.primary">
                {adminPageNames[location.pathname] ?? 'Page'}
              </Typography>
            </Breadcrumbs>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      ) : (
        <Container
          component="main"
          id="main-content"
          maxWidth={false}
          disableGutters
          sx={{ flex: 1 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Container>
      )}

      {!isAdminRoute && <Footer />}
      <CookieConsentBanner />

      {/* Mobile navigation drawer -- for public/donor routes */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{ display: { md: 'none' } }}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ width: 280, pt: 2 }} role="navigation" aria-label="Mobile navigation">
          <List>
            <ListItemButton onClick={() => navigateAndClose('/')}>
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton onClick={() => navigateAndClose('/about')}>
              <ListItemText primary="About" />
            </ListItemButton>
            <ListItemButton onClick={() => navigateAndClose('/impact')}>
              <ListItemText primary="Impact" />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

            {!isAuthenticated ? (
              <>
                <ListItemButton onClick={() => navigateAndClose('/login')}>
                  <ListItemText primary="Login" />
                </ListItemButton>
                <ListItemButton onClick={() => navigateAndClose('/register')}>
                  <ListItemText primary="Register" />
                </ListItemButton>
              </>
            ) : (
              <>
                {isAdmin && (
                  <ListItemButton onClick={() => navigateAndClose('/admin/dashboard')}>
                    <ListItemText primary="Admin" />
                  </ListItemButton>
                )}

                {isDonor && (
                  <>
                    <ListItemButton onClick={() => navigateAndClose('/donor/dashboard')}>
                      <ListItemText primary="Donate" />
                    </ListItemButton>
                    <ListItemButton onClick={() => navigateAndClose('/donor/donations')}>
                      <ListItemText primary="My Donations" />
                    </ListItemButton>
                  </>
                )}

                <Divider sx={{ my: 1 }} />

                <ListItemButton onClick={() => navigateAndClose('/manage-mfa')}>
                  <ListItemText primary="MFA Settings" />
                </ListItemButton>
                <ListItemButton onClick={() => navigateAndClose('/logout')}>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}

export default AppLayout;
