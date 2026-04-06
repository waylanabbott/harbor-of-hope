import { useState } from 'react';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import DarkModeToggle from '../ui/DarkModeToggle';
import Footer from './Footer';
import CookieConsentBanner from '../ui/CookieConsentBanner';

function AppLayout() {
  const { authSession, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            Harbor of Hope
          </Typography>

          <DarkModeToggle />

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
          {!isLoading && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button color="inherit" component={RouterLink} to="/">
                Home
              </Button>
              <Button color="inherit" component={RouterLink} to="/impact">
                Impact
              </Button>

              {!isAuthenticated ? (
                <>
                  <Button color="inherit" component={RouterLink} to="/login">
                    Login
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/register">
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
                    >
                      Dashboard
                    </Button>
                  )}

                  {isDonor && !isAdmin && (
                    <>
                      <Button
                        color="inherit"
                        component={RouterLink}
                        to="/donor/dashboard"
                      >
                        My Dashboard
                      </Button>
                      <Button
                        color="inherit"
                        component={RouterLink}
                        to="/donor/donations"
                      >
                        My Donations
                      </Button>
                    </>
                  )}

                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/manage-mfa"
                  >
                    MFA Settings
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/logout">
                    Logout
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {isAdminRoute ? (
        <Box sx={{ display: 'flex', flex: 1 }}>
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
            <Outlet />
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
          <Outlet />
        </Container>
      )}

      <Footer />
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
                    <ListItemText primary="Dashboard" />
                  </ListItemButton>
                )}

                {isDonor && !isAdmin && (
                  <>
                    <ListItemButton onClick={() => navigateAndClose('/donor/dashboard')}>
                      <ListItemText primary="My Dashboard" />
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
