import {
  createContext,
  useContext,
  useState,
  useMemo,
} from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Cookies from 'js-cookie';
import { getCookieConsentValue } from 'react-cookie-consent';
import { getDesignTokens } from '../theme';

interface ThemeModeContextValue {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export function hasConsent(): boolean {
  return getCookieConsentValue('harborCookieConsent') === 'true';
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(() =>
    Cookies.get('darkMode') === 'true' ? 'dark' : 'light',
  );

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (hasConsent()) {
        Cookies.set('darkMode', String(next === 'dark'), {
          expires: 365,
          sameSite: 'Lax',
        });
      }
      return next;
    });
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider.');
  }
  return context;
}
