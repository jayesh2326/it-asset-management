import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, RoleRoute } from "../components/auth/protected-route";
import { LoadingScreen } from "../components/common/loading-screen";
import { AppShell } from "../components/layout/app-shell";
import { useAuth } from "../hooks/use-auth";
import { AssetsPage } from "../pages/assets-page";
import { AssetDetailPage } from "../pages/asset-detail-page";
import { AssignmentsPage } from "../pages/assignments-page";
import { DashboardPage } from "../pages/dashboard-page";
import { EmployeesPage } from "../pages/employees-page";
import { EmployeeDetailPage } from "../pages/employee-detail-page";
import { LandingPage } from "../pages/landing-page";
import { LoginPage } from "../pages/login-page";
import { MaintenancePage } from "../pages/maintenance-page";
import { NotFoundPage } from "../pages/not-found-page";
import { SignupPage } from "../pages/signup-page";
import { UsersPage } from "../pages/users-page";

function HomeRoute() {
  const { initialized, profile } = useAuth();

  if (!initialized) {
    return <LoadingScreen />;
  }

  return <Navigate to={profile ? "/dashboard" : "/login"} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<AppShell />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/assets/:assetId" element={<AssetDetailPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:employeeId" element={<EmployeeDetailPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />

          <Route element={<RoleRoute role="admin" />}>
            <Route path="/settings/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
