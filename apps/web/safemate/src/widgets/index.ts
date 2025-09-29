// Central widget registration - ensures all widgets are loaded before dashboard renders
import { WidgetRegistry } from '../dashboard/core/WidgetRegistry';

// Import and register all widgets
import '../widgets/wallet/WalletOverviewWidget';
import '../widgets/wallet/WalletDetailsWidget';
import '../widgets/stats/StatsOverviewWidget';
import '../widgets/actions/QuickActionsWidget';
import '../widgets/files/FilesOverviewWidget';

// Import new dashboard widgets
import '../widgets/dashboard/DashboardStatsWidget';
import '../widgets/dashboard/QuickActionsGridWidget';
import '../widgets/dashboard/GroupInvitationsWidget';
import '../widgets/dashboard/PlatformStatusWidget';
import '../widgets/dashboard/RecentActivityWidget';
import '../widgets/dashboard/AccountStatusWidget';

// Widget registration complete - debug logging disabled for cleaner console

export { WidgetRegistry };
