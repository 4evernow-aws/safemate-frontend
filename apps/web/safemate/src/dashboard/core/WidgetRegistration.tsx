import React, { useEffect } from 'react';
import { WidgetRegistry } from './WidgetRegistry';
import type { Widget } from './types';

interface WidgetRegistrationProps {
  widgets: Widget[];
}

export const WidgetRegistration: React.FC<WidgetRegistrationProps> = ({ widgets }) => {
  // Register all widgets when component mounts
  useEffect(() => {
    console.log(`📦 Registering ${widgets.length} widgets:`, widgets.map(w => w.id));
    
    // Register each widget directly with the registry
    widgets.forEach(widget => {
      console.log(`📦 Registering widget: ${widget.id}`);
      WidgetRegistry.register(widget);
    });

    // Cleanup: unregister widgets when component unmounts
    return () => {
      console.log(`🗑️ Unregistering ${widgets.length} widgets`);
      widgets.forEach(widget => {
        WidgetRegistry.unregister(widget.id);
      });
    };
  }, [widgets]);

  // This component doesn't render anything
  return null;
};

// Hook for registering a single widget
export const useRegisterWidget = (widget: Widget) => {
  useEffect(() => {
    WidgetRegistry.register(widget);
    
    return () => {
      WidgetRegistry.unregister(widget.id);
    };
  }, [widget]);
};

// Hook for registering multiple widgets
export const useRegisterWidgets = (widgets: Widget[]) => {
  useEffect(() => {
    console.log(`📦 Registering ${widgets.length} widgets`);
    
    widgets.forEach(widget => {
      WidgetRegistry.register(widget);
    });

    return () => {
      console.log(`🗑️ Unregistering ${widgets.length} widgets`);
      widgets.forEach(widget => {
        WidgetRegistry.unregister(widget.id);
      });
    };
  }, [widgets]);
};

export default WidgetRegistration;
