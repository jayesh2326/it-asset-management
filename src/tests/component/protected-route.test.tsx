import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ProtectedRoute } from "../../components/auth/protected-route";

const useAuthMock = vi.fn();

vi.mock("../../hooks/use-auth", () => ({
  useAuth: () => useAuthMock()
}));

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to login", () => {
    useAuthMock.mockReturnValue({
      initialized: true,
      profile: null
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login Screen</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Screen")).toBeInTheDocument();
  });
});
