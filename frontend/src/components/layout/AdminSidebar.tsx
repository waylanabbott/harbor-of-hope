import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';

import ShareIcon from '@mui/icons-material/Share';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { label: 'Residents', icon: <PeopleIcon />, path: '/admin/residents' },
  { label: 'Supporters', icon: <VolunteerActivismIcon />, path: '/admin/donors' },
  { label: 'Sessions', icon: <PsychologyIcon />, path: '/admin/sessions' },
  { label: 'Visits', icon: <HomeIcon />, path: '/admin/visits' },
  { label: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' },
  { label: 'Social Media', icon: <ShareIcon />, path: '/admin/social' },
  { label: 'Users', icon: <ManageAccountsIcon />, path: '/admin/users' },
];

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export default function AdminSidebar({ open, onToggle, isMobile = false }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMediumDown = useMediaQuery(theme.breakpoints.down('md'));

  // On mobile: always use temporary drawer with full expanded width
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onToggle}
        aria-label="Admin navigation"
        sx={{
          '& .MuiDrawer-paper': {
            width: EXPANDED_WIDTH,
            boxSizing: 'border-box',
          },
        }}
        ModalProps={{ keepMounted: true }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box sx={{ px: 2.5, pt: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Harbor of Hope logo"
              sx={{
                height: 56,
                width: 56,
                borderRadius: '50%',
                objectFit: 'cover',
                clipPath: 'circle(46% at 56% 42%)',
              }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Harbor of Hope
            </Typography>
          </Box>
          <Divider />
          <List sx={{ flex: 1, pt: 2 }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <ListItemButton
                  key={item.path}
                  selected={isActive}
                  onClick={() => {
                    navigate(item.path);
                    onToggle();
                  }}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    borderRadius: 2,
                    mx: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main + '14',
                      color: theme.palette.primary.main,
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 2,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Drawer>
    );
  }

  // Desktop: persistent drawer with collapse/expand
  const drawerWidth = open && !isMediumDown ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
  const isCollapsed = !open || isMediumDown;

  return (
    <Drawer
      variant="persistent"
      open
      aria-label="Admin navigation"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'relative',
          height: '100%',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {!isCollapsed && (
          <>
            <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Harbor of Hope
              </Typography>
            </Box>
            <Divider />
          </>
        )}
        <List sx={{ flex: 1, pt: 2 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            const button = (
              <ListItemButton
                key={item.path}
                selected={isActive}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: isCollapsed ? 'center' : 'initial',
                  px: 2.5,
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '14',
                    color: theme.palette.primary.main,
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isCollapsed ? 0 : 2,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={item.label} />}
              </ListItemButton>
            );

            return isCollapsed ? (
              <Tooltip key={item.path} title={item.label} placement="right">
                {button}
              </Tooltip>
            ) : (
              button
            );
          })}
        </List>

        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={onToggle} size="small" aria-label="Toggle sidebar">
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}
