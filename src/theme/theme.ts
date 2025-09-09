import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5fb3d4', // Teal/cyan matching Forevernow branding
      light: '#8ec5d6',
      dark: '#4a90a4',
    },
    secondary: {
      main: '#64748b', // Subdued gray-blue for secondary elements
      light: '#94a3b8',
      dark: '#475569',
    },
    background: {
      default: '#0f0f0f', // Deep dark background matching Forevernow
      paper: '#1c1c1c', // Slightly lighter dark for cards
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '6rem',
      lineHeight: 1.167,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 300,
      fontSize: '3.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 400,
      fontSize: '3rem',
      lineHeight: 1.167,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 400,
      fontSize: '2.125rem',
      lineHeight: 1.235,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 400,
      fontSize: '1.5rem',
      lineHeight: 1.334,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
        contained: {
          backgroundColor: '#5fb3d4',
          color: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
          '&:hover': {
            backgroundColor: '#4a90a4',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
        outlined: {
          borderColor: '#5fb3d4',
          color: '#5fb3d4',
          '&:hover': {
            borderColor: '#8ec5d6',
            backgroundColor: 'rgba(95, 179, 212, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#1c1c1c',
          border: '1px solid rgba(95, 179, 212, 0.15)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          '&:hover': {
            border: '1px solid rgba(95, 179, 212, 0.25)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          },
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0f0f0f',
          borderRight: '1px solid rgba(95, 179, 212, 0.15)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 15, 15, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(95, 179, 212, 0.15)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(95, 179, 212, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(95, 179, 212, 0.25)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(95, 179, 212, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
        colorPrimary: {
          backgroundColor: '#5fb3d4',
          color: '#ffffff',
          fontWeight: 600,
        },
        colorSecondary: {
          backgroundColor: '#64748b',
          color: '#ffffff',
          fontWeight: 600,
        },
      },
    },
  },
});

export default responsiveFontSizes(theme); 