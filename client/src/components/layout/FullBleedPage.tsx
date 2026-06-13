import { PrivateRoute } from '../common/PrivateRoute';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const FullBleedPage = ({ children }: { children: React.ReactNode }) => (
  <PrivateRoute>
    <ErrorBoundary>{children}</ErrorBoundary>
  </PrivateRoute>
);
