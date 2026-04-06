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

function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isAdminRoute = location.pathname.startsWith('/admin');

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

          {!isLoading && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={RouterLink} to="/">
                Home
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
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin/dashboard"
                  >
                    Dashboard
                  </Button>
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
    </Box>
  );
}

export default AppLayout;
