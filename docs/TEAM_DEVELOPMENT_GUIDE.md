# 🚀 SafeMate Team Development Guide

## 📋 **IMPORTANT: Always Use the New Modular System**

This guide ensures all team members work with the **new modular dashboard system** and stay synchronized with the latest codebase.

---

## 🎯 **Quick Start for Team Members**

### 1. **Initial Setup (First Time Only)**
```bash
# Clone the repository
git clone <repository-url>
cd safemate_v2

# Switch to the development branch
git checkout team/wallet-widgets

# Install dependencies
cd apps/web/safemate
npm install

# Start development server
npm run dev
```

### 2. **Daily Development Workflow**
```bash
# Always start your day with these commands:
cd D:\cursor_projects\safemate_v2\apps\web\safemate

# Pull latest changes
git pull origin team/wallet-widgets

# Install any new dependencies
npm install

# Start development server
npm run dev
```

---

## 🏗️ **New Modular System Architecture**

### **Core Components**
- **Dashboard**: `/app/dashboard` - Uses the new modular widget system
- **Widget System**: Located in `src/dashboard/` and `src/widgets/`
- **Widget Registry**: Manages widget registration and discovery
- **Widget Error Boundaries**: Handles widget failures gracefully

### **Key Files for Team Members**
```
src/dashboard/
├── core/
│   ├── DashboardProvider.tsx    # Main dashboard context
│   ├── WidgetRegistry.tsx       # Widget registration system
│   ├── WidgetRegistration.tsx   # Widget registration component
│   ├── WidgetErrorBoundary.tsx  # Error handling
│   ├── WidgetDevTools.tsx       # Development tools
│   └── types.ts                 # Shared type definitions
├── layouts/
│   └── DashboardGrid.tsx        # Grid layout system
├── routing/
│   └── DashboardRoutes.tsx      # Dashboard routing
└── Dashboard.tsx                # Main dashboard component

src/widgets/
├── shared/
│   └── BaseWidget.tsx           # Base widget component
├── wallet/
│   ├── WalletOverviewWidget.tsx # Wallet overview widget
│   ├── WalletSendWidget.tsx     # Send funds widget
│   ├── WalletReceiveWidget.tsx  # Receive funds widget
│   └── WalletDetailsWidget.tsx  # Wallet details widget
├── stats/
│   └── StatsOverviewWidget.tsx  # Statistics widget
├── actions/
│   └── QuickActionsWidget.tsx   # Quick actions widget
├── files/
│   └── FilesOverviewWidget.tsx  # Files overview widget
└── dashboard/
    ├── DashboardStatsWidget.tsx # Dashboard statistics
    ├── GroupInvitationsWidget.tsx # Group invitations
    ├── PlatformStatusWidget.tsx # Platform status
    ├── RecentActivityWidget.tsx # Recent activity
    └── AccountStatusWidget.tsx  # Account status
```

---

## 🧭 **Current Navigation Structure**

The main navigation includes these sections:

### **Primary Navigation**
- **Dashboard** (`/app/dashboard`) - **NEW**: Modular widget system
- **My Files** (`/app/files`) - File management interface
- **Upload** (`/app/upload`) - File upload functionality
- **Wallet** (`/app/wallet`) - Blockchain operations
- **Groups** (`/app/shared`) - Group collaboration features

### **Secondary Navigation**
- **Gallery** (`/app/gallery`) - **Coming Soon**: Image and media management
- **Monetise** (`/app/monetise`) - **Coming Soon**: Revenue generation features
- **How to** (`/app/how-to`) - User guide and tutorials
- **Help** (`/app/help`) - FAQ and support documentation
- **Profile** (`/app/profile`) - User settings and preferences

### **Development Notes**
- **Gallery** and **Monetise** are placeholder pages for future development
- **How to** and **Help** provide user guidance and support
- All navigation items are accessible from the sidebar in `AppShell.tsx`

---

## 🔧 **Development Guidelines**

### **Creating New Widgets**
1. **Create widget component** in `src/widgets/[category]/`
2. **Extend BaseWidget** for consistent styling
3. **Register widget** in `src/widgets/index.ts`
4. **Add to AVAILABLE_WIDGETS** array in `src/dashboard/Dashboard.tsx`

### **Example Widget Structure**
```typescript
// src/widgets/example/ExampleWidget.tsx
import React from 'react';
import { BaseWidget } from '../shared/BaseWidget';
import type { WidgetProps } from '../../dashboard/core/types';

const ExampleWidgetComponent: React.FC<WidgetProps> = ({ widgetId, accountType }) => {
  return (
    <BaseWidget
      title="Example Widget"
      widgetId={widgetId}
      accountType={accountType}
    >
      {/* Widget content */}
    </BaseWidget>
  );
};

export const ExampleWidget = {
  id: 'example-widget',
  name: 'Example Widget',
  component: ExampleWidgetComponent,
  category: 'analytics' as const,
  permissions: ['personal', 'family', 'business'] as const,
  gridSize: { cols: 2, rows: 2 },
  priority: 1,
};
```

### **Widget Registration Process**
1. **Create the widget component** following the pattern above
2. **Export the widget object** with proper configuration
3. **Import in `src/widgets/index.ts`** to register with the system
4. **Add to `AVAILABLE_WIDGETS`** in `src/dashboard/Dashboard.tsx`
5. **Test with different account types** to ensure proper permissions

---

## 🚨 **Critical Rules**

### **✅ DO:**
- Always work in the `team/wallet-widgets` branch
- Use the new modular dashboard system (`/app/dashboard`)
- Create widgets using the BaseWidget component
- Follow the widget registration pattern
- Test your widgets with different account types
- Use TypeScript for all new code
- Follow the navigation structure in `AppShell.tsx`

### **❌ DON'T:**
- Don't use the old `ModernDashboard` component
- Don't modify the old dashboard system
- Don't bypass the widget registration system
- Don't commit directly to main/master branch
- Don't ignore TypeScript errors
- Don't modify navigation without updating documentation

---

## 🔄 **Sync Process**

### **Before Starting Work**
```bash
# 1. Pull latest changes
git pull origin team/wallet-widgets

# 2. Check for conflicts
git status

# 3. Install dependencies if needed
npm install

# 4. Start development server
npm run dev
```

### **Before Committing**
```bash
# 1. Check what you're committing
git status
git diff

# 2. Add your changes
git add .

# 3. Commit with descriptive message
git commit -m "feat: add new widget for [feature]"

# 4. Push to team branch
git push origin team/wallet-widgets
```

---

## 🐛 **Troubleshooting**

### **Development Server Issues**
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Clear Vite cache
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue

# Restart server
npm run dev
```

### **Widget Not Showing**
1. Check if widget is registered in `AVAILABLE_WIDGETS`
2. Verify widget permissions match your account type
3. Check browser console for errors
4. Use WidgetDevTools to debug

### **TypeScript Errors**
1. Ensure all imports use `import type` for types
2. Check `verbatimModuleSyntax` compliance
3. Verify widget follows the correct interface

### **Navigation Issues**
1. Check `AppShell.tsx` for navigation item definitions
2. Verify routes are properly configured in `App.tsx`
3. Ensure page components exist for each route

---

## 📞 **Support**

### **When You Need Help:**
1. Check this guide first
2. Look at existing widget examples
3. Check the browser console for errors
4. Use WidgetDevTools for debugging
5. Ask the team lead for assistance

### **Useful Commands**
```bash
# Check current branch
git branch

# Check for uncommitted changes
git status

# View recent commits
git log --oneline -10

# Check if you're up to date
git fetch origin
git status
```

---

## 🎉 **Success Checklist**

Before considering your work complete:
- [ ] Widget is properly registered
- [ ] Widget works with all relevant account types
- [ ] No TypeScript errors
- [ ] Widget follows BaseWidget pattern
- [ ] Code is committed and pushed
- [ ] Widget is tested in development
- [ ] Navigation updates are documented (if applicable)

---

## 📋 **Current Widget Status**

### **Available Widgets**
- ✅ **Wallet Overview** - Fully functional
- ✅ **Wallet Send** - Fully functional
- ✅ **Wallet Receive** - Fully functional
- ✅ **Wallet Details** - Fully functional
- ✅ **Stats Overview** - Fully functional
- ✅ **Quick Actions** - Fully functional
- ✅ **Files Overview** - Fully functional
- ✅ **Dashboard Stats** - Fully functional
- ✅ **Group Invitations** - Fully functional
- ✅ **Platform Status** - Fully functional
- ✅ **Recent Activity** - Fully functional
- ✅ **Account Status** - Fully functional

### **Coming Soon**
- 🔄 **Gallery Widgets** - In development
- 🔄 **Monetise Widgets** - In development

---

**Remember: Always use the new modular system! The old dashboard is deprecated.**
