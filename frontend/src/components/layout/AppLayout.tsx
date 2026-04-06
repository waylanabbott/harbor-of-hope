import { useState } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import DarkModeToggle from '../ui/DarkModeToggle';
import Footer from './Footer';
import CookieConsentBanner from '../ui/CookieConsentBanner';

function AppLayout() {
  const { authSession, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDonorRoute = location.pathname.startsWith('/donor');

  const isAdmin = authSession.roles.includes('Admin');
  const isDonor = authSession.roles.includes('Donor');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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

          {!isLoading && (
            <Box sx={{ display: 'flex', gap: 1 }}>
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
          <AdminSidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((prev) => !prev)}
          />
          <Box
            component="main"
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
          maxWidth={false}
          disableGutters
          sx={{ flex: 1 }}
        >
          <Outlet />
        </Container>
      )}

      <Footer />
      <CookieConsentBanner />
    </Box>
  );
}

export default AppLayout;
