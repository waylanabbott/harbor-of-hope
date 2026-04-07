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

type FontSize = 'small' | 'medium' | 'large';

interface ThemeModeContextValue {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export function hasConsent(): boolean {
  return getCookieConsentValue('harborCookieConsent') === 'true';
}

const FONT_SCALE: Record<FontSize, number> = {
  small: 0.875,
  medium: 1,
  large: 1.15,
};

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = Cookies.get('fontSize');
    if (saved === 'small' || saved === 'medium' || saved === 'large') return saved;
    return 'medium';
  });

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    if (hasConsent()) {
      Cookies.set('fontSize', size, {
        expires: 365,
        sameSite: 'Lax',
      });
    }
  };

  const theme = useMemo(() => {
    const base = getDesignTokens('light');
    const scale = FONT_SCALE[fontSize];
    return createTheme({
      ...base,
      typography: {
        ...base.typography,
        fontSize: 14 * scale,
      },
    });
  }, [fontSize]);

  return (
    <ThemeContext.Provider value={{ fontSize, setFontSize }}>
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
