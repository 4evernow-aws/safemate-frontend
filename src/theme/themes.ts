import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { modernTheme, modernDarkTheme } from './modernTheme';

// Common theme configuration shared between light and dark modes
const commonTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.02em',
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 12,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
};

// Light theme
const baseLightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light' as const,
    primary: {
      main: '#667eea',
      light: '#8b9dff',
      dark: '#4c63d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9d7bd6',
      dark: '#5d3a85',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
    divider: '#e2e8f0',
    success: {
      main: '#48bb78',
      light: '#68d391',
      dark: '#38a169',
    },
    warning: {
      main: '#ed8936',
      light: '#fbb042',
      dark: '#dd6b20',
    },
    error: {
      main: '#f56565',
      light: '#feb2b2',
      dark: '#e53e3e',
    },
    info: {
      main: '#4299e1',
      light: '#63b3ed',
      dark: '#3182ce',
    },
  },
});

// Dark theme
const baseDarkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark' as const,
    primary: {
      main: '#667eea',
      light: '#8b9dff',
      dark: '#4c63d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9d7bd6',
      dark: '#5d3a85',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f0f0f',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    success: {
      main: '#48bb78',
      light: '#68d391',
      dark: '#38a169',
    },
    warning: {
      main: '#ed8936',
      light: '#fbb042',
      dark: '#dd6b20',
    },
    error: {
      main: '#f56565',
      light: '#feb2b2',
      dark: '#e53e3e',
    },
    info: {
      main: '#4299e1',
      light: '#63b3ed',
      dark: '#3182ce',
    },
  },
});

// Common component overrides
const componentOverrides = (theme: any) => ({
  MuiButton: {
    styleOverrides: {
             root: {
         borderRadius: 8,
         textTransform: 'none' as const,
         fontWeight: 600,
         padding: '10px 24px',
         fontSize: '0.875rem',
         boxShadow: 'none',
         '&:hover': {
           boxShadow: 'none',
         },
       },
      contained: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        '&:hover': {
          background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
          transform: 'translateY(-1px)',
          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        transition: 'all 0.2s ease-in-out',
      },
      outlined: {
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
        borderWidth: '2px',
        '&:hover': {
          borderWidth: '2px',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(102, 126, 234, 0.08)' 
            : 'rgba(102, 126, 234, 0.04)',
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.2s ease-in-out',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        backgroundColor: theme.palette.background.paper,
        border: theme.palette.mode === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.4)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 12px 40px rgba(0, 0, 0, 0.5)'
            : '0 12px 40px rgba(0, 0, 0, 0.12)',
        },
        transition: 'all 0.3s ease-in-out',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(15, 15, 15, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: theme.palette.mode === 'dark'
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: theme.palette.background.default,
        borderRight: theme.palette.mode === 'dark'
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1px solid rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: '4px 8px',
        '&.Mui-selected': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(102, 126, 234, 0.15)'
            : 'rgba(102, 126, 234, 0.08)',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(102, 126, 234, 0.25)'
              : 'rgba(102, 126, 234, 0.12)',
          },
        },
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.04)',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        fontWeight: 600,
      },
      colorPrimary: {
        backgroundColor: theme.palette.primary.main,
        color: '#ffffff',
      },
      colorSecondary: {
        backgroundColor: theme.palette.secondary.main,
        color: '#ffffff',
      },
      colorSuccess: {
        backgroundColor: theme.palette.success.main,
        color: '#ffffff',
      },
      colorWarning: {
        backgroundColor: theme.palette.warning.main,
        color: '#ffffff',
      },
      colorError: {
        backgroundColor: theme.palette.error.main,
        color: '#ffffff',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
});

// Apply component overrides to themes (keeping legacy theme for fallback)
const legacyLightTheme = responsiveFontSizes(createTheme({
  ...baseLightTheme,
  components: componentOverrides(baseLightTheme),
}));

const legacyDarkTheme = responsiveFontSizes(createTheme({
  ...baseDarkTheme,
  components: componentOverrides(baseDarkTheme),
}));

// Export modern themes as defaults
export const lightTheme = responsiveFontSizes(modernTheme);
export const darkTheme = responsiveFontSizes(modernDarkTheme);

// Default export for backward compatibility
export default darkTheme; 