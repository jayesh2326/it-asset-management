import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { App } from "../../app/App";
import { ThemeProvider } from "../../hooks/use-theme";

const useAuthMock = vi.fn();

vi.mock("../../hooks/use-auth", () => ({
  useAuth: () => useAuthMock()
}));

vi.mock("../../pages/dashboard-page", () => ({
  DashboardPage: () => <div>Dashboard Screen</div>
}));

vi.mock("../../pages/assets-page", () => ({
  AssetsPage: () => <div>Assets Screen</div>
}));

vi.mock("../../pages/asset-detail-page", () => ({
  AssetDetailPage: () => <div>Asset Detail Screen</div>
}));

vi.mock("../../pages/employees-page", () => ({
  EmployeesPage: () => <div>Employees Screen</div>
}));

vi.mock("../../pages/employee-detail-page", () => ({
  EmployeeDetailPage: () => <div>Employee Detail Screen</div>
}));

vi.mock("../../pages/assignments-page", () => ({
  AssignmentsPage: () => <div>Assignments Screen</div>
}));

vi.mock("../../pages/maintenance-page", () => ({
  MaintenancePage: () => <div>Maintenance Screen</div>
}));

vi.mock("../../pages/users-page", () => ({
  UsersPage: () => <div>Users Screen</div>
}));

vi.mock("../../pages/landing-page", () => ({
  LandingPage: () => <div>Landing Screen</div>
}));

vi.mock("../../pages/login-page", () => ({
  LoginPage: () => <div>Login Screen</div>
}));

vi.mock("../../pages/not-found-page", () => ({
  NotFoundPage: () => <div>Not Found Screen</div>
}));

function renderApp(initialEntry: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe("App routes", () => {
  it("redirects the site root to login for guest visitors", () => {
    useAuthMock.mockReturnValue({
      initialized: true,
      profile: null,
      signOut: vi.fn()
    });

    renderApp("/");

    expect(screen.getByText("Login Screen")).toBeInTheDocument();
  });

  it("redirects guest visitors away from the dashboard", () => {
    useAuthMock.mockReturnValue({
      initialized: true,
      profile: null,
      signOut: vi.fn()
    });

    renderApp("/dashboard");

    expect(screen.getByText("Login Screen")).toBeInTheDocument();
  });

  it("allows signed-in users to open protected workspace pages", () => {
    useAuthMock.mockReturnValue({
      initialized: true,
      profile: {
        id: "1",
        full_name: "Admin User",
        role: "admin",
        email: "admin@company.com"
      },
      signOut: vi.fn()
    });

    renderApp("/assets");

    expect(screen.getByText("Assets Screen")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Assets" })).toBeInTheDocument();
  });
});
