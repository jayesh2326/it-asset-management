import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Area,
  AreaChart,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Server,
  ShieldCheck,
  Users
} from "lucide-react";
import { Card } from "../components/common/card";
import { ChartTooltip } from "../components/dashboard/chart-tooltip";
import { buildDashboardAnalytics } from "../lib/metrics";
import { queryKeys } from "../lib/query-keys";
import { useRepository } from "../hooks/use-repository";
import type { DashboardRawData } from "../types/app";

const axisTick = {
  fill: "#9CA3AF",
  fontSize: 12
} as const;

const alertEvents = [
  {
    label: "Disk space critical",
    status: "Critical",
    hint: "Server SVR-0411 • London HQ",
    time: "2m ago",
    tone: "#ff4d57"
  },
  {
    label: "Antivirus update failed",
    status: "Warning",
    hint: "Endpoint LTP-7770 • Berlin Office",
    time: "8m ago",
    tone: "#ffb347"
  },
  {
    label: "Unauthorized login detected",
    status: "Alert",
    hint: "User USR-0821 • New York",
    time: "14m ago",
    tone: "#ff4d57"
  },
  {
    label: "Device offline",
    status: "Warning",
    hint: "Workstation WKS-3022 • Sydney Lab",
    time: "28m ago",
    tone: "#ffb347"
  }
];

const statusCards = [
  {
    label: "Assets in scope",
    key: "assets",
    description: "Tracked inventory across every workspace.",
    icon: Server,
    accent: "border-[#FF4A57]/20 bg-[#FF4A57]/10 text-[#FFB1B7]"
  },
  {
    label: "Active users",
    key: "employees",
    description: "Users with access to asset operations.",
    icon: Users,
    accent: "border-[#4EC5AF]/20 bg-[#4EC5AF]/10 text-[#B8F1D6]"
  },
  {
    label: "Service health",
    key: "health",
    description: "Live signal from service and incident trends.",
    icon: ShieldCheck,
    accent: "border-[#FFB347]/20 bg-[#FFB347]/10 text-[#FFE0A4]"
  },
  {
    label: "Open incidents",
    key: "incidents",
    description: "Events that need immediate review.",
    icon: AlertTriangle,
    accent: "border-[#FF4A57]/20 bg-[#FF4A57]/10 text-[#FFB1B7]"
  }
];

export function DashboardPage() {
  const repository = useRepository();

  const { data, isLoading } = useQuery<DashboardRawData>({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const [assets, employees, assignments, maintenance] = await Promise.all([
        repository.listAssets(),
        repository.listEmployees(),
        repository.listAssignments(),
        repository.listMaintenanceRecords()
      ]);

      return {
        assets,
        employees,
        assignments,
        maintenance
      };
    },
    staleTime: 30_000
  });

  const analytics = useMemo(
    () => (data ? buildDashboardAnalytics(data, { dateRange: "90d", location: "all", category: "all" }) : null),
    [data]
  );

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <Card className="rounded-[28px] border-white/10 bg-[#111111] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.40)]">
          <div className="h-14 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="mt-6 space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded-full bg-white/10" />
            <div className="h-6 w-1/2 animate-pulse rounded-full bg-white/10" />
            <div className="h-44 animate-pulse rounded-[24px] bg-white/10" />
          </div>
        </Card>
      </div>
    );
  }

  const alertsCount =
    analytics.summary.totals.overdueReturns + analytics.summary.totals.warrantiesExpiring + analytics.summary.totals.warrantiesExpired;
  const incidentCount = analytics.summary.totals.maintenance + alertsCount;
  const serviceHealth = Math.max(96 - analytics.summary.totals.maintenance * 2, 72);
  const growthBase = analytics.assetGrowth.length > 1 ? analytics.assetGrowth[0].cumulative : analytics.summary.totals.assets;
  const growthPercent = Math.round(
    ((analytics.summary.totals.assets - growthBase) / Math.max(1, growthBase)) * 100
  );

  const healthSegments = [
    {
      name: "Healthy",
      value: Math.max(analytics.summary.totals.assets - analytics.summary.totals.maintenance - alertsCount, 0),
      fill: "#36c98c"
    },
    {
      name: "Warning",
      value: analytics.summary.totals.maintenance,
      fill: "#ffb347"
    },
    {
      name: "Critical",
      value: alertsCount,
      fill: "#ff4d57"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className="space-y-6"
    >
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#080808]/95 p-6 shadow-[0_32px_80px_rgba(0,0,0,0.44)] ring-1 ring-inset ring-white/[0.04]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,9,20,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_20%)]" />
        <div className="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-[#E50914]/12 blur-3xl" />
        <div className="pointer-events-none absolute left-8 top-24 h-24 w-24 rounded-full bg-[#E50914]/10 blur-2xl" />
        <div className="relative grid gap-8 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FF4A57]/20 bg-[#FF4A57]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#FFD7DB] shadow-[0_0_28px_rgba(255,74,87,0.12)]">
              Asset Nexus • Live operations
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Command center for complete asset visibility and smarter IT operations.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[#B3B6BC]">
              Track every asset, user, and risk across your IT environment in real time and take action with confidence.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-white/10 bg-[#111111]/90 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/[0.03] transition hover:border-[#E50914]/30 hover:bg-[#1b0b0d]/95">
                <p className="text-sm uppercase tracking-[0.25em] text-[#9CA3AF]">Assets in scope</p>
                <p className="mt-3 text-3xl font-semibold text-white">{analytics.summary.totals.assets}</p>
                <p className="mt-2 text-sm text-[#9CA3AF]">All active inventory under monitoring.</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#111111]/90 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/[0.03] transition hover:border-[#E50914]/30 hover:bg-[#1b0b0d]/95">
                <p className="text-sm uppercase tracking-[0.25em] text-[#9CA3AF]">Active users</p>
                <p className="mt-3 text-3xl font-semibold text-white">{analytics.summary.totals.employees}</p>
                <p className="mt-2 text-sm text-[#9CA3AF]">Users currently engaged with the workspace.</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#111111]/90 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/[0.03] transition hover:border-[#E50914]/30 hover:bg-[#1b0b0d]/95">
                <p className="text-sm uppercase tracking-[0.25em] text-[#9CA3AF]">Service health</p>
                <p className="mt-3 text-3xl font-semibold text-white">{serviceHealth}%</p>
                <p className="mt-2 text-sm text-[#9CA3AF]">Real-time operational readiness score.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#FF4A57]/20 bg-[#FF4A57]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#FFD7DB]">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#ff4d57] shadow-[0_0_14px_rgba(255,77,87,0.35)]" />
                {alertsCount} active alerts
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#D1D5DB]">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#36c98c] shadow-[0_0_18px_rgba(54,201,140,0.22)]" />
                {analytics.summary.totals.assigned} assigned assets
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0f0f0f]/95 p-6 shadow-[0_24px_48px_rgba(0,0,0,0.30)] ring-1 ring-inset ring-white/[0.04]">
            <p className="text-sm uppercase tracking-[0.28em] text-[#9CA3AF]">Total assets</p>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-5xl font-semibold text-white">{analytics.summary.totals.assets}</p>
                <p className="mt-2 text-sm text-[#9CA3AF]">Monitored inventory across your environment.</p>
              </div>
              <div className="rounded-full bg-[#121212] px-4 py-2 text-right text-sm text-[#D1D5DB]">
                <span className="block text-[#36c98c]">{growthPercent >= 0 ? `+${growthPercent}%` : `${growthPercent}%`}</span>
                <span className="block text-[#9CA3AF]">vs previous 90 days</span>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-[22px] border border-white/10 bg-[#111111]/95 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.03]">
                <p className="text-xs uppercase tracking-[0.24em] text-[#9CA3AF]">Alert status</p>
                <p className="mt-3 text-2xl font-semibold text-white">{alertsCount} active</p>
                <p className="mt-2 text-sm text-[#9CA3AF]">Issues requiring attention right now.</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#111111]/95 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.03]">
                <p className="text-xs uppercase tracking-[0.24em] text-[#9CA3AF]">Service health</p>
                <p className="mt-3 text-2xl font-semibold text-white">{serviceHealth}%</p>
                <p className="mt-2 text-sm text-[#9CA3AF]">Live service readiness score.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-4">
        {statusCards.map((card) => {
          const value =
            card.key === "assets"
              ? analytics.summary.totals.assets
              : card.key === "employees"
              ? analytics.summary.totals.employees
              : card.key === "health"
              ? `${serviceHealth}%`
              : incidentCount;

          return (
            <motion.div
              key={card.label}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="rounded-[28px] border border-white/10 bg-[#111111]/95 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/[0.03]"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${card.accent}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-sm uppercase tracking-[0.24em] text-[#9CA3AF]">{card.label}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
              <p className="mt-3 text-sm leading-6 text-[#9CA3AF]">{card.description}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.16),transparent_55%)]" />
          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#9CA3AF]">Analytics</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Asset growth over time</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-[#D1D5DB]">
                Last 90 days
              </span>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-[#090909]/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.32)]">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.assetGrowth.map((item) => ({ label: item.label, cumulative: item.cumulative }))} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                    <defs>
                      <linearGradient id="asset-growth" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#ff586c" stopOpacity={0.75} />
                        <stop offset="100%" stopColor="#ff586c" stopOpacity={0.08} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="4 6" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} />
                    <YAxis axisLine={false} tickLine={false} tick={axisTick} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#ff6a76"
                      strokeWidth={3}
                      fill="url(#asset-growth)"
                      activeDot={{ r: 6, fill: "#ff6a76", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.16),transparent_55%)]" />
          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#9CA3AF]">Health</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Asset wellness score</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-[#D1D5DB]">
                Live status
              </span>
            </div>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="h-64 w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthSegments}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={72}
                      outerRadius={92}
                      paddingAngle={4}
                      stroke="transparent"
                    >
                      {healthSegments.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-3">
                {healthSegments.map((segment) => (
                  <div
                    key={segment.name}
                    className="flex items-center justify-between rounded-[20px] border border-white/10 bg-[#0D0D0D] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.fill }} />
                      <span className="text-sm text-[#D1D5DB]">{segment.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{segment.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#9CA3AF]">Recent alerts</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Live event feed</h2>
            </div>
            <span className="rounded-full border border-[#FF4A57]/20 bg-[#FF4A57]/10 px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-[#FFD7DB]">
              Real time
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {alertEvents.map((alert) => (
              <div
                key={alert.label}
                className="rounded-[24px] border border-white/10 bg-[#0D0D0D] px-5 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.20)] transition hover:border-[#E50914]/25 hover:bg-[#130a0d]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-white">{alert.label}</p>
                    <p className="text-sm text-[#9CA3AF]">{alert.hint}</p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-white"
                    style={{ backgroundColor: `${alert.tone}20`, color: alert.tone }}
                  >
                    {alert.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-[#9CA3AF]">
                  <span>{alert.time}</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-[#D1D5DB]">
                    {alert.hint.split(" • ")[1]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#9CA3AF]">Operational stats</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">System readiness</h2>
            </div>
            <div className="grid gap-3">
              {[
                { label: "Uptime", value: "99.9%", accent: "bg-[#36c98c]/15 text-[#36c98c]" },
                { label: "Monitoring", value: "24/7", accent: "bg-[#ffb347]/15 text-[#ffb347]" },
                { label: "Open tickets", value: `${incidentCount}`, accent: "bg-[#ff4d57]/15 text-[#ff4d57]" },
                { label: "Global locations", value: `${analytics.filters.locations.length}`, accent: "bg-[#ff6b8c]/15 text-[#ff6b8c]" }
              ].map((stat) => (
                <div key={stat.label} className="rounded-[22px] border border-white/10 bg-[#0D0D0D] px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-[#9CA3AF]">{stat.label}</p>
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.20em] ${stat.accent}`}>
                      {stat.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
