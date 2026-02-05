
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';
import GroupManagement from './pages/Groups/GroupManagement';
import GroupDetails from './pages/Groups/GroupDetails';
import PaymentHistory from './pages/Payments/PaymentHistory';
import PlanManagement from './pages/Plans/PlanManagement';
import PromoCodeManagement from './pages/PromoCodes/PromoCodeManagement';
import ClientManagement from './pages/Clients/ClientManagement';
import ClientDebts from './pages/Clients/ClientDebts';
import InactiveClients from './pages/Clients/InactiveClients';
import SalesOverview from './pages/Finance/SalesOverview';
import InvoiceManagement from './pages/Finance/InvoiceManagement';
import StockAlerts from './pages/Inventory/StockAlerts';
import WarehouseInventory from './pages/Inventory/WarehouseInventory';
import PointOfSaleInventory from './pages/Inventory/PointOfSaleInventory';
import DailyClosures from './pages/Operations/DailyClosures';
import Expenses from './pages/Operations/Expenses';
import StockHistory from './pages/Operations/StockHistory';
import TopProducts from './pages/Statistics/TopProducts';
import TopClients from './pages/Statistics/TopClients';
import SalesAnalytics from './pages/Statistics/SalesAnalytics';
import ProductManagement from './pages/Products/ProductManagement';
import SalesManagement from './pages/Sales/SalesManagement';
import ExpirationAlerts from './pages/Inventory/ExpirationAlerts';
import PartnershipManagement from './pages/Partnerships/PartnershipManagement';
import ClaimManagement from './pages/Claims/ClaimManagement';
import PointOfSaleManagement from './pages/PointsOfSale/PointOfSaleManagement';
import ImfPendingGroups from './pages/IMF/ImfPendingGroups';
import ImfApprovedGroups from './pages/IMF/ImfApprovedGroups';
import ImfApprovalPage from './pages/IMF/ImfApprovalPage';
import UserManagement from './pages/Users/UserManagement';
import Login from './pages/Auth/Login';
import { SnackbarProvider } from './context/SnackbarContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardHome />} />
                <Route path="groups" element={<GroupManagement />} />
                <Route path="groups/:id" element={<GroupDetails />} />
                <Route path="payments" element={<PaymentHistory />} />
                <Route path="plans" element={<PlanManagement />} />
                <Route path="promo-codes" element={<PromoCodeManagement />} />
                <Route path="clients" element={<ClientManagement />} />
                <Route path="clients/debts" element={<ClientDebts />} />
                <Route path="clients/inactive" element={<InactiveClients />} />
                <Route path="sales" element={<SalesOverview />} />
                <Route path="invoices" element={<InvoiceManagement />} />
                <Route path="inventory/alerts" element={<StockAlerts />} />
                <Route path="inventory/warehouse" element={<WarehouseInventory />} />
                <Route path="inventory/pos" element={<PointOfSaleInventory />} />
                <Route path="operations/closures" element={<DailyClosures />} />
                <Route path="operations/expenses" element={<Expenses />} />
                <Route path="operations/stock-history" element={<StockHistory />} />
                <Route path="statistics/top-products" element={<TopProducts />} />
                <Route path="statistics/top-clients" element={<TopClients />} />
                <Route path="statistics/sales-analytics" element={<SalesAnalytics />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="sales-management" element={<SalesManagement />} />
                <Route path="inventory/expirations" element={<ExpirationAlerts />} />
                <Route path="partnerships" element={<PartnershipManagement />} />
                <Route path="claims" element={<ClaimManagement />} />
                <Route path="points-of-sale" element={<PointOfSaleManagement />} />
                <Route path="imf/pending" element={<ImfPendingGroups />} />
                <Route path="imf/approved" element={<ImfApprovedGroups />} />
                <Route path="imf/validate" element={<ImfApprovalPage />} />
                <Route path="users" element={<UserManagement />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
