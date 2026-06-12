import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarProvider } from 'notistack';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider as ThemeContextProvider } from './contexts/ThemeContext';
import { theme } from './theme/theme';
import { PrivateRoute } from './components/common/PrivateRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DriversPage from './pages/DriversPage';
import VehiclesPage from './pages/VehiclesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertsPage from './pages/AlertsPage';

const LiveTrackingPage = lazy(() => import('./pages/LiveTrackingPage'));
const RouteHistoryPage = lazy(() => import('./pages/RouteHistoryPage'));

const PageLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
    <CircularProgress size={40} />
  </Box>
);

const PrivatePage = ({ children }: { children: React.ReactNode }) => (
  <PrivateRoute>
    <DashboardLayout>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </DashboardLayout>
  </PrivateRoute>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeContextProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <CssBaseline />
            <AuthProvider>
              <Router>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<PrivatePage><DashboardPage /></PrivatePage>} />
                    <Route path="/drivers" element={<PrivatePage><DriversPage /></PrivatePage>} />
                    <Route path="/vehicles" element={<PrivatePage><VehiclesPage /></PrivatePage>} />
                    <Route path="/analytics" element={<PrivatePage><AnalyticsPage /></PrivatePage>} />
                    <Route path="/alerts" element={<PrivatePage><AlertsPage /></PrivatePage>} />
                    <Route path="/live-tracking" element={<PrivatePage><LiveTrackingPage /></PrivatePage>} />
                    <Route path="/route-history" element={<PrivatePage><RouteHistoryPage /></PrivatePage>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </Router>
            </AuthProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
      </ThemeContextProvider>
    </ErrorBoundary>
  );
}

export default App;
