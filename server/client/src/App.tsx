import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute } from './components/common/PrivateRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LiveTrackingPage from './pages/LiveTrackingPage';
import VehiclesPage from './pages/VehiclesPage';
import DriversPage from './pages/DriversPage';
import AlertsPage from './pages/AlertsPage';

const RouteHistoryPage = lazy(() => import('./pages/RouteHistoryPage'));
const GeofencesPage = lazy(() => import('./pages/GeofencesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const DevicesPage = lazy(() => import('./pages/DevicesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const OrganizationPage = lazy(() => import('./pages/OrganizationPage'));
const DeploymentsPage = lazy(() => import('./pages/DeploymentsPage'));
const RevenuePage = lazy(() => import('./pages/RevenuePage'));
const IncidentsPage = lazy(() => import('./pages/IncidentsPage'));
const KPIPage = lazy(() => import('./pages/KPIPage'));
const AuditPage = lazy(() => import('./pages/AuditPage'));
const CommandCenterPage = lazy(() => import('./pages/CommandCenterPage'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div style={{
      width: 32, height: 32,
      border: '3px solid var(--border2)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const PrivatePage = ({ children }: { children: React.ReactNode }) => (
  <PrivateRoute>
    <DashboardLayout>
      <ErrorBoundary>{children}</ErrorBoundary>
    </DashboardLayout>
  </PrivateRoute>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<PrivatePage><DashboardPage /></PrivatePage>} />
                <Route path="/live-tracking" element={<PrivatePage><LiveTrackingPage /></PrivatePage>} />
                <Route path="/vehicles" element={<PrivatePage><VehiclesPage /></PrivatePage>} />
                <Route path="/drivers" element={<PrivatePage><DriversPage /></PrivatePage>} />
                <Route path="/alerts" element={<PrivatePage><AlertsPage /></PrivatePage>} />
                <Route path="/route-history" element={<PrivatePage><RouteHistoryPage /></PrivatePage>} />
                <Route path="/geofences" element={<PrivatePage><GeofencesPage /></PrivatePage>} />
                <Route path="/reports" element={<PrivatePage><ReportsPage /></PrivatePage>} />
                <Route path="/devices" element={<PrivatePage><DevicesPage /></PrivatePage>} />
                <Route path="/settings" element={<PrivatePage><SettingsPage /></PrivatePage>} />
                <Route path="/organization" element={<PrivatePage><OrganizationPage /></PrivatePage>} />
                <Route path="/deployments" element={<PrivatePage><DeploymentsPage /></PrivatePage>} />
                <Route path="/revenue" element={<PrivatePage><RevenuePage /></PrivatePage>} />
                <Route path="/incidents" element={<PrivatePage><IncidentsPage /></PrivatePage>} />
                <Route path="/kpi" element={<PrivatePage><KPIPage /></PrivatePage>} />
                <Route path="/audit" element={<PrivatePage><AuditPage /></PrivatePage>} />
                <Route path="/command-center" element={<PrivatePage><CommandCenterPage /></PrivatePage>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
