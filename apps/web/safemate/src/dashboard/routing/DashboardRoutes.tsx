import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '../Dashboard';

// Import widgets to ensure they're registered
import '../../widgets/wallet/WalletOverviewWidget';

const DashboardRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main dashboard route */}
      <Route path="/" element={<Dashboard />} />
      
      {/* Dashboard sub-routes (for future expansion) */}
      <Route path="/overview" element={<Dashboard />} />
      
      {/* Redirect any unknown dashboard routes to main dashboard */}
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
};

export default DashboardRoutes;
