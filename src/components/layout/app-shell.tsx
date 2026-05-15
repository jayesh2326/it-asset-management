import { motion } from "framer-motion";
import {
  AlertTriangle,
  Boxes,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  UserSquare2
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/use-auth";
import { Button } from "../common/button";
import { ThemeToggle } from "../common/theme-toggle";

const primaryLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assets", label: "Assets", icon: ShieldCheck },
  { to: "/employees", label: "Employees", icon: UserSquare2 }
] as const;

const workflowLinks = [
  { to: "/assignments", label: "Assignments", icon: Sparkles },
  { to: "/maintenance", label: "Maintenance", icon: AlertTriangle },
  { to: "/settings/users", label: "Settings", icon: Settings }
] as const;

function SidebarNavItem({
  to,
  label,
  icon: Icon
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}) {
  return (
    <NavLink to={to} className="block">
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: 4 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={cn(
            "group flex items-center gap-3 rounded-[16px] border border-transparent px-3 py-3 text-sm font-medium text-[#9CA3AF] transition-all duration-200",
            "hover:border-white/10 hover:bg-white/[0.04] hover:text-white",
            isActive &&
              "border-[#E50914]/30 bg-[#E50914]/12 text-white shadow-[0_0_28px_rgba(229,9,20,0.14)]"
          )}
        >
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/8 bg-white/[0.03] text-[#D1D5DB] transition-all duration-200",
              isActive &&
                "border-[#E50914]/30 bg-[#E50914]/16 text-[#FF6A6A] shadow-[0_0_22px_rgba(229,9,20,0.18)]"
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="tracking-[0.01em]">{label}</span>
        </motion.div>
      )}
    </NavLink>
  );
}

export function AppShell() {
  const { profile, signOut } = useAuth();
  const isSignedIn = Boolean(profile);
  const identityLabel = profile?.full_name ?? "Unknown user";
  const accessLabel = profile?.role === "admin" ? "Administrator" : "IT Staff";

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <aside className="relative border-b border-white/8 bg-[#090909] lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-72 lg:border-b-0 lg:border-r lg:border-white/8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.24),transparent_68%)]"
        />
        <div className="relative flex h-full flex-col px-4 py-4 sm:px-6 lg:px-6 lg:py-8">
          <div className="rounded-[22px] border border-white/8 bg-[#111111] p-5 shadow-[0_28px_60px_rgba(0,0,0,0.32)] ring-1 ring-inset ring-white/[0.03]">
            <div className="flex items-start justify-between gap-4">
              <Link to="/dashboard" className="min-w-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#E50914]/20 bg-[#E50914]/12 text-[#FF6A6A] shadow-[0_0_26px_rgba(229,9,20,0.16)]">
                  <Boxes className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9CA3AF]">
                  IT Asset Ops
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  Asset Nexus
                </h1>
              </Link>
              <ThemeToggle compact />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#9CA3AF]">
              A focused control surface for inventory, ownership, and service health.
            </p>
          </div>

          <div className="mt-8">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6B7280]">
              Overview
            </p>
            <nav className="mt-3 space-y-2">
              {primaryLinks.map((link) => (
                <SidebarNavItem key={link.to} to={link.to} label={link.label} icon={link.icon} />
              ))}
            </nav>
          </div>

          <div className="mt-8">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6B7280]">
              Workflows
            </p>
            <nav className="mt-3 space-y-2">
              {workflowLinks.map((link) => (
                <SidebarNavItem key={link.to} to={link.to} label={link.label} icon={link.icon} />
              ))}
              {profile?.role === "admin" ? (
                <SidebarNavItem
                  to="/settings/users"
                  label="Access Control"
                  icon={Settings}
                />
              ) : null}
            </nav>
          </div>

          <div className="mt-8 rounded-[20px] border border-white/8 bg-[#111111] p-5 shadow-[0_20px_48px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.03] lg:mt-auto">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9CA3AF]">
              {isSignedIn ? "Signed in as" : "Workspace mode"}
            </p>
            <p className="mt-3 text-base font-semibold text-white">{identityLabel}</p>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              {isSignedIn ? accessLabel : "Guest access"}
            </p>

            {isSignedIn ? (
              <Button
                type="button"
                variant="ghost"
                className="mt-5 w-full justify-center border-white/10 bg-white/[0.04] text-white hover:border-[#E50914]/35 hover:bg-[#E50914]/10 hover:text-white hover:shadow-[0_0_24px_rgba(229,9,20,0.14)]"
                onClick={() => void signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            ) : (
              <Link
                to="/login"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:border-[#E50914]/35 hover:bg-[#E50914]/10 hover:shadow-[0_0_24px_rgba(229,9,20,0.14)]"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-5 sm:px-6 lg:pl-[20rem] lg:pr-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
