import React, { useState, useMemo } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { useDashboard } from '../core/DashboardProvider';
import { WidgetRegistry } from '../core/WidgetRegistry';
import { WidgetErrorBoundary } from '../core/WidgetErrorBoundary';

interface GridItemProps {
  widgetId: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config?: Record<string, any>;
}

const GridItem: React.FC<GridItemProps> = ({ widgetId, position, config }) => {
  const { accountType } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get widget from registry
  const widget = WidgetRegistry.get(widgetId);

  // Handle widget loading
  React.useEffect(() => {
    setLoading(true);
    setError(null);

    // Simulate widget loading time
    const timer = setTimeout(() => {
      if (!widget) {
        setError(`Widget '${widgetId}' not found in registry`);
      } else if (accountType && !widget.permissions.includes(accountType)) {
        setError(`Widget '${widgetId}' not permitted for account type '${accountType}'`);
      } else if (!WidgetRegistry.checkDependencies(widgetId)) {
        setError(`Widget '${widgetId}' has unsatisfied dependencies`);
      }
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [widget, widgetId, accountType]);

  // Calculate grid item styles
  const gridStyles = {
    gridColumn: `${position.x + 1} / span ${position.w}`,
    gridRow: `${position.y + 1} / span ${position.h}`,
    minHeight: `${position.h * 120}px`, // 120px per grid row
    minWidth: `${position.w * 100}px`,  // 100px per grid column
  };

  // Render loading state
  if (loading) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          ...gridStyles, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Loading {widgetId}...
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Render error state
  if (error || !widget || !accountType) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          ...gridStyles, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 2
        }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          <Typography variant="body2">
            {error || `Failed to load widget: ${widgetId}`}
          </Typography>
        </Alert>
      </Paper>
    );
  }

  // Render the actual widget with error boundary
  const WidgetComponent = widget.component;

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        ...gridStyles, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <WidgetErrorBoundary widgetId={widgetId}>
        <WidgetComponent
          widgetId={widgetId}
          accountType={accountType}
          config={config}
          onAction={(action, data) => {
            console.log(`Widget ${widgetId} action:`, action, data);
            // Handle widget actions here - could emit to parent or global state
          }}
        />
      </WidgetErrorBoundary>
    </Paper>
  );
};

export const DashboardGrid: React.FC = () => {
  const { layout, accountType } = useDashboard();

  // Calculate grid dimensions with memoization
  const gridDimensions = useMemo(() => {
    if (!layout) return { cols: 12, rows: 6 };

    const maxX = Math.max(...layout.widgets.map(w => w.position.x + w.position.w));
    const maxY = Math.max(...layout.widgets.map(w => w.position.y + w.position.h));

    return {
      cols: Math.max(12, maxX), // Minimum 12 columns
      rows: Math.max(6, maxY)   // Minimum 6 rows
    };
  }, [layout]);

  if (!layout || !accountType) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
      >
        <Alert severity="info">
          <Typography>
            No dashboard layout configured for account type: {accountType || 'unknown'}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridDimensions.cols}, 1fr)`,
        gridTemplateRows: `repeat(${gridDimensions.rows}, 120px)`,
        gap: 2,
        padding: 2,
        width: '100%',
        minHeight: '100vh',
        // Responsive adjustments
        '@media (max-width: 1200px)': {
          gridTemplateColumns: `repeat(${Math.min(gridDimensions.cols, 8)}, 1fr)`,
        },
        '@media (max-width: 900px)': {
          gridTemplateColumns: `repeat(${Math.min(gridDimensions.cols, 6)}, 1fr)`,
        },
        '@media (max-width: 600px)': {
          gridTemplateColumns: `repeat(${Math.min(gridDimensions.cols, 4)}, 1fr)`,
          gap: 1,
          padding: 1,
        },
      }}
    >
      {layout.widgets.map((widgetConfig, index) => (
        <GridItem
          key={`${widgetConfig.widgetId}-${index}`}
          widgetId={widgetConfig.widgetId}
          position={widgetConfig.position}
          config={widgetConfig.config}
        />
      ))}
    </Box>
  );
};

export default DashboardGrid;
