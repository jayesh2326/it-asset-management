import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { LandingPage } from "../../pages/landing-page";
import { ThemeProvider } from "../../hooks/use-theme";
import { vi } from "vitest";

vi.mock("../../hooks/use-auth", () => ({
  useAuth: () => ({
    profile: null
  })
}));

describe("LandingPage", () => {
  it("renders the architecture overview and login CTA", () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </ThemeProvider>
    );

    expect(
      screen.getByText("Build one asset platform that your IT team can actually run every day.")
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /launch console/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("System architecture overview")).toBeInTheDocument();
  });
});
