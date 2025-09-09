import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Alert, Button, Typography, Paper } from '@mui/material';
import { Refresh as RefreshIcon, BugReport as BugIcon } from '@mui/icons-material';

interface Props {
  widgetId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Widget Error Boundary caught an error in widget ${this.props.widgetId}:`, error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReportError = () => {
    // In a real app, this would send the error to an error reporting service
    console.error('Error Report:', {
      widgetId: this.props.widgetId,
      error: this.state.error,
      errorInfo: this.state.errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            backgroundColor: 'error.light',
            color: 'error.contrastText'
          }}
        >
          <BugIcon sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
          
          <Typography variant="h6" gutterBottom>
            Widget Error
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
            The widget "{this.props.widgetId}" encountered an error and couldn't load properly.
          </Typography>

          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              size="small"
            >
              Retry
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<BugIcon />}
              onClick={this.handleReportError}
              size="small"
            >
              Report Issue
            </Button>
          </Box>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 1, maxWidth: '100%' }}>
              <Typography variant="caption" component="pre" sx={{ wordBreak: 'break-word' }}>
                {this.state.error.message}
              </Typography>
            </Box>
          )}
        </Paper>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useWidgetErrorBoundary = (widgetId: string) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error(`Widget error in ${widgetId}:`, error);
    setHasError(true);
    setError(error);
  }, [widgetId]);

  const resetError = React.useCallback(() => {
    setHasError(false);
    setError(null);
  }, []);

  return {
    hasError,
    error,
    handleError,
    resetError
  };
};

// Higher-order component for error boundary
export const withWidgetErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  widgetId: string
) => {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <WidgetErrorBoundary widgetId={widgetId}>
      <WrappedComponent {...props} />
    </WidgetErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithErrorBoundary;
};

export default WidgetErrorBoundary;
