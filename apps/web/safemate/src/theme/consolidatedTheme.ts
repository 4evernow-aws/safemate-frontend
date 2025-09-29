import { createTheme, alpha } from '@mui/material/styles';

// Brand colors
const brandColors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  accent: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  }
};

// Common configuration
const commonTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none' as const,
      letterSpacing: 0,
    },
  },
  shape: {
    borderRadius: 8,
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
const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.primary[600],
      light: brandColors.primary[400],
      dark: brandColors.primary[800],
      contrastText: '#ffffff',
    },
    secondary: {
      main: brandColors.secondary[600],
      light: brandColors.secondary[400],
      dark: brandColors.secondary[800],
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: brandColors.slate[900],
      secondary: brandColors.slate[600],
    },
    divider: brandColors.slate[200],
    success: {
      main: brandColors.accent[600],
      light: brandColors.accent[400],
      dark: brandColors.accent[800],
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: brandColors.secondary[500],
      light: brandColors.secondary[400],
      dark: brandColors.secondary[700],
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          boxShadow: 'none',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlined: {
          borderColor: brandColors.slate[300],
          color: brandColors.slate[700],
          '&:hover': {
            backgroundColor: brandColors.slate[50],
            borderColor: brandColors.slate[400],
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'transparent',
            '& fieldset': {
              borderColor: brandColors.slate[300],
            },
            '&:hover fieldset': {
              borderColor: brandColors.slate[400],
            },
            '&.Mui-focused fieldset': {
              borderColor: brandColors.primary[500],
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${brandColors.slate[200]}`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: brandColors.primary[600],
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 44,
          color: brandColors.slate[600],
          '&.Mui-selected': {
            color: brandColors.primary[600],
          },
        },
      },
    },
  },
});

// Dark theme
const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: brandColors.primary[400],
      light: brandColors.primary[300],
      dark: brandColors.primary[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: brandColors.secondary[400],
      light: brandColors.secondary[300],
      dark: brandColors.secondary[600],
      contrastText: '#ffffff',
    },
    background: {
      default: brandColors.slate[900],
      paper: brandColors.slate[800],
    },
    text: {
      primary: brandColors.slate[100],
      secondary: brandColors.slate[400],
    },
    divider: alpha(brandColors.slate[400], 0.2),
    success: {
      main: brandColors.accent[400],
      light: brandColors.accent[300],
      dark: brandColors.accent[600],
    },
    warning: {
      main: '#fbbf24',
      light: '#fde047',
      dark: '#f59e0b',
    },
    error: {
      main: '#f87171',
      light: '#fca5a5',
      dark: '#ef4444',
    },
    info: {
      main: brandColors.secondary[400],
      light: brandColors.secondary[300],
      dark: brandColors.secondary[600],
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          boxShadow: 'none',
          '&:hover': {
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlined: {
          borderColor: alpha(brandColors.slate[400], 0.3),
          color: brandColors.slate[300],
          '&:hover': {
            backgroundColor: alpha(brandColors.slate[700], 0.3),
            borderColor: brandColors.slate[400],
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: alpha(brandColors.slate[700], 0.3),
            '& fieldset': {
              borderColor: alpha(brandColors.slate[400], 0.3),
            },
            '&:hover fieldset': {
              borderColor: brandColors.slate[400],
            },
            '&.Mui-focused fieldset': {
              borderColor: brandColors.primary[400],
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: brandColors.slate[800],
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: alpha(brandColors.slate[800], 0.8),
          border: `1px solid ${alpha(brandColors.slate[600], 0.3)}`,
        },
      },
    },
  },
});

export { lightTheme, darkTheme }; 