import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#E8735A' },
    secondary: { main: '#5B8C7A' },
    background: {
      default: '#FFF8F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D2D2D',
      secondary: '#6B6B6B',
    },
  },
  typography: {
    fontFamily: '"Nunito", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 700, textTransform: 'none' as const },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 24 },
      },
    },
  },
});

export default theme;
