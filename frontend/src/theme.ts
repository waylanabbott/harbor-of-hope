import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

export function getDesignTokens(mode: 'light' | 'dark'): ThemeOptions {
  return {
    palette: {
      mode,
      primary: { main: '#D4603F' },
      secondary: { main: '#5B8C7A' },
      background: {
        default: mode === 'light' ? '#FFF8F0' : '#121212',
        paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
      },
      text: {
        primary: mode === 'light' ? '#2D2D2D' : '#FFFFFF',
        secondary: mode === 'light' ? '#6B6B6B' : '#B0B0B0',
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
          root: {
            boxShadow:
              mode === 'light'
                ? '0 2px 12px rgba(0,0,0,0.08)'
                : '0 2px 12px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 24 },
        },
      },
    },
  };
}

// Default export for backward compatibility during transition
const theme = createTheme(getDesignTokens('light'));
export default theme;
