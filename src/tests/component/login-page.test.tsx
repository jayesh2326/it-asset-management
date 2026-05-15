import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { LoginPage } from "../../pages/login-page";
import { ThemeProvider } from "../../hooks/use-theme";

const signIn = vi.fn();
const success = vi.fn();
const error = vi.fn();

vi.mock("../../hooks/use-auth", () => ({
  useAuth: () => ({
    initialized: true,
    profile: null,
    signIn
  })
}));

vi.mock("../../hooks/use-toast", () => ({
  useToast: () => ({
    success,
    error
  })
}));

describe("LoginPage", () => {
  it("renders the Supabase sign-in helper and signup link", () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    expect(screen.getByText("Supabase authentication")).toBeInTheDocument();
    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
  });
});
