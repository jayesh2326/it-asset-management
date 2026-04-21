import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";
import { LoadingScreen } from "../common/loading-screen";

export function ProtectedRoute() {
  const { initialized, profile } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RoleRoute({ role }: { role: "admin" }) {
  const { profile, initialized } = useAuth();

  if (!initialized) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
