import {
  ClipboardList,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  ShieldCheck,
  UserSquare2,
  Wrench
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/use-auth";
import { Button } from "../common/button";
import { ThemeToggle } from "../common/theme-toggle";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assets", label: "Assets", icon: ShieldCheck },
  { to: "/employees", label: "Employees", icon: UserSquare2 },
  { to: "/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/maintenance", label: "Maintenance", icon: Wrench }
] as const;

export function AppShell() {
  const { profile, signOut } = useAuth();
  const isSignedIn = Boolean(profile);
  const identityLabel = profile?.full_name ?? "Unknown user";
  const accessLabel = profile ? profile.role.replace("_", " ") : "no access";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-[var(--nav-surface)] px-6 py-8 text-[var(--nav-text-primary)]">
          <div className="rounded-3xl border border-[var(--nav-border)] bg-[var(--nav-surface-elevated)] p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--nav-text-muted)]">
              IT Operations
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Asset Manager</h1>
            <p className="mt-2 text-sm text-[var(--nav-text-secondary)]">
              Manage inventory, ownership, returns, and maintenance from one place.
            </p>
          </div>

          <ThemeToggle className="mt-4" />

          <nav className="mt-8 space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--nav-text-secondary)] transition hover:bg-[var(--nav-surface-highlight)] hover:text-[var(--nav-text-primary)]",
                    isActive &&
                      "bg-[var(--nav-active-bg)] text-[var(--nav-active-text)] shadow-[var(--shadow-soft)]"
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
            {profile?.role === "admin" ? (
              <NavLink
                to="/settings/users"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--nav-text-secondary)] transition hover:bg-[var(--nav-surface-highlight)] hover:text-[var(--nav-text-primary)]",
                    isActive &&
                      "bg-[var(--nav-active-bg)] text-[var(--nav-active-text)] shadow-[var(--shadow-soft)]"
                  )
                }
              >
                <Settings className="h-4 w-4" />
                User Access
              </NavLink>
            ) : null}
          </nav>

          <div className="mt-8 rounded-3xl border border-[var(--nav-border)] bg-[var(--nav-surface-elevated)] p-5 text-sm text-[var(--nav-text-secondary)]">
            <p className="font-semibold text-[var(--nav-text-primary)]">
              {isSignedIn ? "Signed in as" : "Browsing as"}
            </p>
            <p className="mt-1">{identityLabel}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--nav-text-muted)]">
              {accessLabel}
            </p>
          </div>

          {isSignedIn ? (
            <Button
              type="button"
              variant="ghost"
              className="mt-6 w-full justify-center border-transparent bg-[var(--nav-surface-elevated)] text-[var(--nav-text-primary)] ring-[var(--nav-border)] hover:bg-[var(--nav-surface-highlight)] hover:text-[var(--nav-text-primary)]"
              onClick={() => void signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          ) : (
            <Link
              to="/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[var(--nav-surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--nav-text-primary)] ring-1 ring-[var(--nav-border)] transition hover:bg-[var(--nav-surface-highlight)]"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Link>
          )}
        </aside>

        <main className="min-w-0 px-4 py-4 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
