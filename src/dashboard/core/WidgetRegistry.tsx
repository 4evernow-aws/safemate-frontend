import React from 'react';
import type { Widget, WidgetProps, AccountType, WidgetCategory } from './types';

// Widget Registry - Central place for all widget definitions
class WidgetRegistryClass {
  private widgets: Map<string, Widget> = new Map();
  private listeners: Set<() => void> = new Set();

  /**
   * Register a widget with the registry
   */
  register(widget: Widget): void {
    // Widget registration logging disabled for cleaner console
    this.widgets.set(widget.id, widget);
    this.notifyListeners();
  }

  /**
   * Unregister a widget from the registry
   */
  unregister(widgetId: string): void {
    console.log(`🔥 Unregistering widget: ${widgetId}`);
    this.widgets.delete(widgetId);
    this.notifyListeners();
  }

  /**
   * Get a specific widget by ID
   */
  get(widgetId: string): Widget | undefined {
    return this.widgets.get(widgetId);
  }

  /**
   * Get all registered widgets
   */
  getAll(): Widget[] {
    return Array.from(this.widgets.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get widgets by category
   */
  getByCategory(category: WidgetCategory): Widget[] {
    return this.getAll().filter(widget => widget.category === category);
  }

  /**
   * Get widgets available for a specific account type
   */
  getByAccountType(accountType: AccountType): Widget[] {
    return this.getAll().filter(widget => widget.permissions.includes(accountType));
  }

  /**
   * Get widgets by category for a specific account type
   */
  getByCategoryAndAccountType(category: WidgetCategory, accountType: AccountType): Widget[] {
    return this.getAll().filter(widget => 
      widget.category === category && widget.permissions.includes(accountType)
    );
  }

  /**
   * Check if widget dependencies are satisfied
   */
  checkDependencies(widgetId: string): boolean {
    const widget = this.get(widgetId);
    if (!widget || !widget.dependencies) return true;

    return widget.dependencies.every(depId => this.widgets.has(depId));
  }

  /**
   * Get widgets with unsatisfied dependencies
   */
  getWidgetsWithUnsatisfiedDependencies(): Widget[] {
    return this.getAll().filter(widget => !this.checkDependencies(widget.id));
  }

  /**
   * Subscribe to registry changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of registry changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Clear all widgets (useful for testing)
   */
  clear(): void {
    this.widgets.clear();
    this.notifyListeners();
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const widgets = this.getAll();
    const categories = new Set(widgets.map(w => w.category));
    const accountTypes = new Set(widgets.flatMap(w => w.permissions));
    
    return {
      totalWidgets: widgets.length,
      categories: Array.from(categories),
      accountTypes: Array.from(accountTypes),
      widgetsByCategory: Object.fromEntries(
        Array.from(categories).map(cat => [
          cat, 
          widgets.filter(w => w.category === cat).length
        ])
      ),
      widgetsByAccountType: Object.fromEntries(
        Array.from(accountTypes).map(type => [
          type,
          widgets.filter(w => w.permissions.includes(type)).length
        ])
      )
    };
  }
}

// Global widget registry instance
export const WidgetRegistry = new WidgetRegistryClass();

// Helper function to create a widget definition
export const createWidget = (config: {
  id: string;
  name: string;
  component: React.ComponentType<WidgetProps>;
  category: WidgetCategory;
  permissions: AccountType[];
  gridSize: { cols: number; rows: number; minCols?: number; minRows?: number };
  priority?: number;
  dependencies?: string[];
}): Widget => {
  return {
    id: config.id,
    name: config.name,
    component: config.component,
    category: config.category,
    permissions: config.permissions,
    gridSize: config.gridSize,
    priority: config.priority || 0,
    dependencies: config.dependencies
  };
};

// React hook for using the widget registry
export const useWidgetRegistry = () => {
  const [widgets, setWidgets] = React.useState<Widget[]>(WidgetRegistry.getAll());

  React.useEffect(() => {
    const unsubscribe = WidgetRegistry.subscribe(() => {
      setWidgets(WidgetRegistry.getAll());
    });

    return unsubscribe;
  }, []);

  return {
    widgets,
    register: WidgetRegistry.register.bind(WidgetRegistry),
    unregister: WidgetRegistry.unregister.bind(WidgetRegistry),
    get: WidgetRegistry.get.bind(WidgetRegistry),
    getByCategory: WidgetRegistry.getByCategory.bind(WidgetRegistry),
    getByAccountType: WidgetRegistry.getByAccountType.bind(WidgetRegistry),
    getByCategoryAndAccountType: WidgetRegistry.getByCategoryAndAccountType.bind(WidgetRegistry),
    checkDependencies: WidgetRegistry.checkDependencies.bind(WidgetRegistry),
    getStats: WidgetRegistry.getStats.bind(WidgetRegistry)
  };
};

// Hook for registering widgets in components
export const useWidgetRegistration = (widget: Widget) => {
  React.useEffect(() => {
    WidgetRegistry.register(widget);
    
    return () => {
      WidgetRegistry.unregister(widget.id);
    };
  }, [widget]);
};

// Higher-order component for auto-registering widgets
export const withWidgetRegistration = <P extends WidgetProps>(
  widget: Widget
) => {
  return (WrappedComponent: React.ComponentType<P>) => {
    const RegisteredWidget: React.FC<P> = (props) => {
      useWidgetRegistration(widget);

      return <WrappedComponent {...props} />;
    };

    RegisteredWidget.displayName = `WithRegistration(${widget.name})`;
    return RegisteredWidget;
  };
};

export default WidgetRegistry;
