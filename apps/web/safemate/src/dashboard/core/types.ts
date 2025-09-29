import React from 'react';

// Define AccountType first to avoid circular references
export type AccountType = 'personal' | 'family' | 'business' | 'community' | 'sporting' | 'cultural';

export type WidgetCategory = 'wallet' | 'nft' | 'files' | 'groups' | 'analytics' | 'shared';

export interface GridSize {
  cols: number;
  rows: number;
  minCols?: number;
  minRows?: number;
}

// Dashboard Types
export interface Widget {
  id: string;
  name: string;
  component: React.ComponentType<WidgetProps>;
  category: WidgetCategory;
  permissions: AccountType[];
  gridSize: GridSize;
  priority: number;
  dependencies?: string[];
}

export interface WidgetProps {
  widgetId: string;
  accountType: AccountType;
  config?: Record<string, any>;
  onAction?: (action: string, data?: any) => void;
}

export interface DashboardLayout {
  accountType: AccountType;
  widgets: Array<{
    widgetId: string;
    position: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
    config?: Record<string, any>;
  }>;
}
