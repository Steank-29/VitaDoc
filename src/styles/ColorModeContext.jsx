import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { COLOR_PALETTE } from '../styles/color.js';

export const ColorModeContext = React.createContext({
  mode: 'light',
  toggleColorMode: () => {}
});

export function CustomThemeProvider({ children }) {
  const [mode, setMode] = React.useState(() => {
    // init: localStorage -> system preference -> 'light'
    try {
      const saved = localStorage.getItem('appColorMode');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  React.useEffect(() => {
    try { localStorage.setItem('appColorMode', mode); } catch (e) {}
  }, [mode]);

  const colorMode = React.useMemo(() => ({
    mode,
    toggleColorMode: () => setMode(prev => (prev === 'light' ? 'dark' : 'light')),
  }), [mode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: COLOR_PALETTE.primary,
            light: '#6A5ACD',
            dark: '#1A237E',
          },
          secondary: {
            main: COLOR_PALETTE.secondary,
          },
          background: {
            default: mode === 'light' ? '#F8F9FF' : '#0A0F2D',
            paper: mode === 'light' ? '#FFFFFF' : '#1A1F4B',
          },
          text: {
            primary: mode === 'light' ? COLOR_PALETTE.primary : '#FFFFFF',
            secondary: mode === 'light' ? COLOR_PALETTE.secondary : '#B0BEC5',
          },
        },
        typography: {
          fontFamily: "'Inter', 'Montserrat', sans-serif",
          h6: { fontWeight: 700, letterSpacing: '0.5px' },
        },
        shape: { borderRadius: 12 },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
