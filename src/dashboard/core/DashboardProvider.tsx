import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useUser } from '../../contexts/UserContext';
import type { Widget, WidgetProps, AccountType, WidgetCategory, GridSize, DashboardLayout } from './types';
import { WidgetRegistry } from './WidgetRegistry';

// Re-export types for backward compatibility
export type { Widget, WidgetProps, AccountType, WidgetCategory, GridSize, DashboardLayout };

// Dashboard Context
interface DashboardContextType {
  accountType: AccountType | null;
  widgets: Widget[];
  activeWidgets: Widget[];
  layout: DashboardLayout | null;
  registerWidget: (widget: Widget) => void;
  unregisterWidget: (widgetId: string) => void;
  updateWidgetConfig: (widgetId: string, config: Record<string, any>) => void;
  getWidgetsByCategory: (category: WidgetCategory) => Widget[];
  getWidgetsForAccountType: (accountType: AccountType) => Widget[];
  refreshWidgets: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

// Default layouts for each account type
const DEFAULT_LAYOUTS: Record<AccountType, DashboardLayout> = {
  personal: {
    accountType: 'personal',
    widgets: [
      { widgetId: 'dashboard-stats', position: { x: 0, y: 0, w: 12, h: 6 } },
      { widgetId: 'quick-actions-grid', position: { x: 0, y: 6, w: 12, h: 10 } },
      { widgetId: 'wallet-details', position: { x: 0, y: 16, w: 6, h: 10 } },
      { widgetId: 'group-invitations', position: { x: 6, y: 16, w: 6, h: 8 } },
      { widgetId: 'platform-status', position: { x: 6, y: 24, w: 6, h: 8 } },
      { widgetId: 'recent-activity', position: { x: 0, y: 26, w: 6, h: 8 } },
      { widgetId: 'account-status', position: { x: 12, y: 16, w: 4, h: 8 } },
    ]
  },
  family: {
    accountType: 'family',
    widgets: [
      { widgetId: 'dashboard-stats', position: { x: 0, y: 0, w: 12, h: 6 } },
      { widgetId: 'quick-actions-grid', position: { x: 0, y: 6, w: 12, h: 10 } },
      { widgetId: 'wallet-details', position: { x: 0, y: 16, w: 6, h: 10 } },
      { widgetId: 'group-invitations', position: { x: 6, y: 16, w: 6, h: 8 } },
    ]
  },
  business: {
    accountType: 'business',
    widgets: [
      { widgetId: 'dashboard-stats', position: { x: 0, y: 0, w: 12, h: 6 } },
      { widgetId: 'quick-actions-grid', position: { x: 0, y: 6, w: 8, h: 10 } },
      { widgetId: 'platform-status', position: { x: 8, y: 6, w: 4, h: 8 } },
      { widgetId: 'wallet-details', position: { x: 0, y: 16, w: 6, h: 10 } },
      { widgetId: 'group-invitations', position: { x: 6, y: 16, w: 6, h: 8 } },
    ]
  },
  community: {
    accountType: 'community',
    widgets: [
      { widgetId: 'dashboard-stats', position: { x: 0, y: 0, w: 12, h: 6 } },
      { widgetId: 'quick-actions-grid', position: { x: 0, y: 6, w: 12, h: 10 } },
      { widgetId: 'group-invitations', position: { x: 0, y: 16, w: 8, h: 8 } },
      { widgetId: 'platform-status', position: { x: 8, y: 16, w: 4, h: 8 } },
    ]
  },
  sporting: {
    accountType: 'sporting',
    widgets: [
      { widgetId: 'dashboard-stats', position: { x: 0, y: 0, w: 12, h: 6 } },
      { widgetId: 'quick-actions-grid', position: { x: 0, y: 6, w: 12, h: 10 } },
      { widgetId: 'wallet-details', position: { x: 0, y: 16, w: 6, h: 10 } },
      { widgetId: 'recent-activity', position: { x: 6, y: 16, w: 6, h: 8 } },
    ]
  },
  cultural: {
    accountType: 'cultural',
    widgets: [
      { widgetId: 'dashboard-stats', position: { x: 0, y: 0, w: 12, h: 6 } },
      { widgetId: 'quick-actions-grid', position: { x: 0, y: 6, w: 12, h: 10 } },
      { widgetId: 'wallet-details', position: { x: 0, y: 16, w: 6, h: 10 } },
      { widgetId: 'files-overview', position: { x: 6, y: 16, w: 6, h: 8 } },
    ]
  }
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [layout, setLayout] = useState<DashboardLayout | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get account type from user context - handle different possible attribute names
  const accountType = (
    (user?.account_type || 
    user?.attributes?.['custom:account_type'] ||
    'personal')?.toLowerCase()
  ) as AccountType;

  // Get widgets from global registry with memoization
  const widgets = useMemo(() => {
    const allWidgets = WidgetRegistry.getAll();
    console.log('🔧 DashboardProvider: All widgets from registry:', allWidgets.map(w => w.id));
    return allWidgets;
  }, [refreshTrigger]);

  // Get widgets that are allowed for current account type with memoization
  const activeWidgets = useMemo(() => {
    const filtered = widgets.filter(widget => widget.permissions.includes(accountType));
    console.log(`🔧 DashboardProvider: Active widgets for account type "${accountType}":`, filtered.map(w => w.id));
    return filtered;
  }, [widgets, accountType]);

  // Load layout when account type changes
  useEffect(() => {
    if (accountType) {
      setLayout(prev => {
        // Only update if the account type actually changed to prevent unnecessary re-renders
        if (!prev || prev.accountType !== accountType) {
          return DEFAULT_LAYOUTS[accountType];
        }
        return prev;
      });
    }
  }, [accountType]);

  // Subscribe to registry changes
  useEffect(() => {
    const unsubscribe = WidgetRegistry.subscribe(() => {
      setRefreshTrigger(prev => prev + 1);
    });

    return unsubscribe;
  }, []);

  const registerWidget = (widget: Widget) => {
    WidgetRegistry.register(widget);
  };

  const unregisterWidget = (widgetId: string) => {
    WidgetRegistry.unregister(widgetId);
  };

  const updateWidgetConfig = (widgetId: string, config: Record<string, any>) => {
    if (!layout) return;
    
    setLayout(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        widgets: prev.widgets.map(w => 
          w.widgetId === widgetId 
            ? { ...w, config: { ...w.config, ...config } }
            : w
        )
      };
    });
  };

  const getWidgetsByCategory = (category: WidgetCategory) => {
    return activeWidgets.filter(widget => widget.category === category);
  };

  const getWidgetsForAccountType = (targetAccountType: AccountType) => {
    return widgets.filter(widget => widget.permissions.includes(targetAccountType));
  };

  const refreshWidgets = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const contextValue: DashboardContextType = {
    accountType,
    widgets,
    activeWidgets,
    layout,
    registerWidget,
    unregisterWidget,
    updateWidgetConfig,
    getWidgetsByCategory,
    getWidgetsForAccountType,
    refreshWidgets
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardProvider;
