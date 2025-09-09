import { createTheme, alpha } from '@mui/material/styles';

// Color palette inspired by modern admin dashboards
const colors = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  secondary: {
    50: '#f3e5f5',
    100: '#e1bee7',
    200: '#ce93d8',
    300: '#ba68c8',
    400: '#ab47bc',
    500: '#9c27b0',
    600: '#8e24aa',
    700: '#7b1fa2',
    800: '#6a1b9a',
    900: '#4a148c',
  },
  success: {
    50: '#e8f5e8',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  warning: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ffc107',
    600: '#ffb300',
    700: '#ffa000',
    800: '#ff8f00',
    900: '#ff6f00',
  },
  error: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Modern gradients
const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  warning: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  info: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  dark: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

export const modernTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary[600],
      light: colors.primary[400],
      dark: colors.primary[800],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[600],
      light: colors.secondary[400],
      dark: colors.secondary[800],
      contrastText: '#ffffff',
    },
    success: {
      main: colors.success[600],
      light: colors.success[400],
      dark: colors.success[800],
    },
    warning: {
      main: colors.warning[600],
      light: colors.warning[400],
      dark: colors.warning[800],
    },
    error: {
      main: colors.error[600],
      light: colors.error[400],
      dark: colors.error[800],
    },
    grey: colors.grey,
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#334155',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 800,
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
      fontWeight: 700,
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
      textTransform: 'none',
      letterSpacing: 0,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.02)',
    '0px 4px 8px rgba(0, 0, 0, 0.04)',
    '0px 8px 16px rgba(0, 0, 0, 0.08)',
    '0px 12px 24px rgba(0, 0, 0, 0.12)',
    '0px 16px 32px rgba(0, 0, 0, 0.16)',
    '0px 20px 40px rgba(0, 0, 0, 0.20)',
    '0px 24px 48px rgba(0, 0, 0, 0.24)',
    '0px 28px 56px rgba(0, 0, 0, 0.28)',
    '0px 32px 64px rgba(0, 0, 0, 0.32)',
    '0px 36px 72px rgba(0, 0, 0, 0.36)',
    '0px 40px 80px rgba(0, 0, 0, 0.40)',
    '0px 44px 88px rgba(0, 0, 0, 0.44)',
    '0px 48px 96px rgba(0, 0, 0, 0.48)',
    '0px 52px 104px rgba(0, 0, 0, 0.52)',
    '0px 56px 112px rgba(0, 0, 0, 0.56)',
    '0px 60px 120px rgba(0, 0, 0, 0.60)',
    '0px 64px 128px rgba(0, 0, 0, 0.64)',
    '0px 68px 136px rgba(0, 0, 0, 0.68)',
    '0px 72px 144px rgba(0, 0, 0, 0.72)',
    '0px 76px 152px rgba(0, 0, 0, 0.76)',
    '0px 80px 160px rgba(0, 0, 0, 0.80)',
    '0px 84px 168px rgba(0, 0, 0, 0.84)',
    '0px 88px 176px rgba(0, 0, 0, 0.88)',
    '0px 92px 184px rgba(0, 0, 0, 0.92)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          background: gradients.primary,
          '&:hover': {
            background: gradients.primary,
            filter: 'brightness(1.1)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: alpha(colors.primary[600], 0.08),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${alpha(colors.grey[300], 0.3)}`,
          '&:hover': {
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease-in-out',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: colors.grey[800],
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
          borderBottom: `1px solid ${alpha(colors.grey[300], 0.2)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: `1px solid ${alpha(colors.grey[300], 0.2)}`,
          boxShadow: '4px 0px 24px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            background: gradients.primary,
            color: '#ffffff',
            '&:hover': {
              background: gradients.primary,
              filter: 'brightness(1.1)',
            },
            '& .MuiListItemIcon-root': {
              color: '#ffffff',
            },
          },
          '&:hover': {
            backgroundColor: alpha(colors.primary[600], 0.08),
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            background: gradients.primary,
          },
          '&.MuiChip-colorSecondary': {
            background: gradients.secondary,
          },
          '&.MuiChip-colorSuccess': {
            background: gradients.success,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          height: 8,
          backgroundColor: alpha(colors.primary[600], 0.1),
        },
        bar: {
          borderRadius: 10,
          background: gradients.primary,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: 'none',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
        },
        filledSuccess: {
          background: gradients.success,
        },
        filledWarning: {
          background: gradients.warning,
        },
        filledError: {
          background: gradients.primary,
        },
        filledInfo: {
          background: gradients.info,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

// Dark theme variant
export const modernDarkTheme = createTheme({
  ...modernTheme,
  palette: {
    ...modernTheme.palette,
    mode: 'dark',
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
  },
  components: {
    ...modernTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          color: '#f8fafc',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.3)',
          borderBottom: `1px solid ${alpha('#334155', 0.3)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b',
          borderRight: `1px solid ${alpha('#334155', 0.3)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.25)',
          border: `1px solid ${alpha('#334155', 0.3)}`,
        },
      },
    },
  },
});

export { gradients, colors }; 