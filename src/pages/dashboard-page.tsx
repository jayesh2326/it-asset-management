import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  Wrench
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Badge } from "../components/common/badge";
import { EmptyState } from "../components/common/empty-state";
import { PageHeader } from "../components/common/page-header";
import { ChartCard } from "../components/dashboard/chart-card";
import { ChartTooltip } from "../components/dashboard/chart-tooltip";
import { DashboardFiltersBar } from "../components/dashboard/dashboard-filters";
import { StatCard } from "../components/dashboard/stat-card";
import { DataTable } from "../components/tables/data-table";
import { daysUntil, formatDate } from "../lib/date";
import { buildDashboardAnalytics } from "../lib/metrics";
import { queryKeys } from "../lib/query-keys";
import { titleCase } from "../lib/utils";
import { useRepository } from "../hooks/use-repository";
import type { DashboardDateRangePreset, DashboardRawData } from "../types/app";

function formatWarrantyState(value: string | null) {
  const days = daysUntil(value);
  if (days < 0) {
    return `Expired ${Math.abs(days)}d ago`;
  }

  if (days <= 45) {
    return `Expires in ${days}d`;
  }

  return "Healthy";
}

const chartGrid = "var(--chart-grid)";
const chartAxis = "var(--chart-axis)";
const chartLegendStyle = {
  color: "var(--text-secondary)",
  fontSize: "12px",
  paddingTop: 8
} as const;
const axisTick = {
  fill: chartAxis,
  fontSize: 12
} as const;

function legendFormatter(value: string) {
  return <span style={{ color: "var(--text-secondary)" }}>{value}</span>;
}

export function DashboardPage() {
  const repository = useRepository();
  const [dateRange, setDateRange] = useState<DashboardDateRangePreset>("90d");
  const [location, setLocation] = useState("all");
  const [category, setCategory] = useState("all");

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

  const deferredFilters = useDeferredValue({
    dateRange,
    location,
    category
  });

  const analytics = useMemo(
    () =>
      data
        ? buildDashboardAnalytics(data, deferredFilters)
        : null,
    [data, deferredFilters]
  );

  const warrantyWatchlist = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return [...analytics.expiredAssets, ...analytics.summary.warrantyExpiring]
      .sort((left, right) => daysUntil(left.warranty_expiry) - daysUntil(right.warranty_expiry))
      .slice(0, 6);
  }, [analytics]);

  if (isLoading || !analytics) {
    return <div className="text-sm text-[var(--text-muted)]">Loading dashboard...</div>;
  }

  const summaryCards = [
    {
      label: "Assets In Scope",
      value: analytics.summary.totals.assets,
      hint: "Filtered inventory currently represented on this dashboard",
      icon: <Boxes className="h-5 w-5" />
    },
    {
      label: "Assigned Assets",
      value: analytics.summary.totals.assigned,
      hint: "Currently issued to employees",
      icon: <ClipboardCheck className="h-5 w-5" />
    },
    {
      label: "Open Maintenance",
      value: analytics.summary.totals.maintenance,
      hint: "Assets not ready for assignment",
      icon: <Wrench className="h-5 w-5" />
    },
    {
      label: "Overdue Returns",
      value: analytics.summary.totals.overdueReturns,
      hint: "Active assignments already past due date",
      icon: <AlertTriangle className="h-5 w-5" />
    },
    {
      label: "Expiring Soon",
      value: analytics.summary.totals.warrantiesExpiring,
      hint: "Warranty expires within the next 45 days",
      icon: <ShieldAlert className="h-5 w-5" />
    },
    {
      label: "Already Expired",
      value: analytics.summary.totals.warrantiesExpired,
      hint: "Warranty coverage has already lapsed",
      icon: <TriangleAlert className="h-5 w-5" />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Graph-driven analytics for asset health, ownership, maintenance pressure, warranty risk, and return delays."
      />

      <DashboardFiltersBar
        dateRange={dateRange}
        location={location}
        category={category}
        locations={analytics.filters.locations}
        categories={analytics.filters.categories}
        onDateRangeChange={setDateRange}
        onLocationChange={setLocation}
        onCategoryChange={setCategory}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ChartCard
          title="Asset Status Distribution"
          description="Current inventory health by operational status."
          action={<Badge value={`${analytics.summary.totals.assets} assets`} />}
        >
          {analytics.statusDistribution.some((item) => item.value > 0) ? (
            <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusDistribution}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={72}
                      outerRadius={104}
                      paddingAngle={3}
                    >
                      {analytics.statusDistribution.map((entry) => (
                        <Cell key={entry.label} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={18}
                      formatter={legendFormatter}
                      wrapperStyle={chartLegendStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {analytics.statusDistribution.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm font-medium text-[var(--text-secondary)]">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No inventory in scope"
              description="Adjust the filters to surface asset status analytics."
            />
          )}
        </ChartCard>

        <ChartCard
          title="Asset Allocation Overview"
          description="Active assignments grouped by employee department for the current asset scope."
          action={<Badge value={`${analytics.summary.totals.assigned} assigned`} />}
        >
          {analytics.assetAllocation.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.assetAllocation}
                  layout="vertical"
                  margin={{ left: 12, right: 16, top: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={axisTick}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={110}
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="value"
                    name="Assigned assets"
                    radius={[0, 10, 10, 0]}
                    fill="var(--chart-brand)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No active allocations"
              description="Once filtered assets are assigned, department distribution appears here."
            />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Maintenance Trends"
          description={`Opened vs closed maintenance cases for ${analytics.filters.dateRangeLabel.toLowerCase()}.`}
        >
          {analytics.maintenanceTrend.some(
            (item) => (item.opened ?? 0) > 0 || (item.closed ?? 0) > 0
          ) ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.maintenanceTrend} margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis
                    dataKey="label"
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend formatter={legendFormatter} wrapperStyle={chartLegendStyle} />
                  <Line
                    type="monotone"
                    dataKey="opened"
                    name="Opened"
                    stroke="var(--chart-warning)"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "var(--chart-warning)", stroke: "var(--surface-primary)" }}
                    activeDot={{
                      r: 5,
                      fill: "var(--chart-warning)",
                      stroke: "var(--surface-primary)"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="closed"
                    name="Closed"
                    stroke="var(--chart-success)"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "var(--chart-success)", stroke: "var(--surface-primary)" }}
                    activeDot={{
                      r: 5,
                      fill: "var(--chart-success)",
                      stroke: "var(--surface-primary)"
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No maintenance activity"
              description="No maintenance cases were opened or closed in the selected trend window."
            />
          )}
        </ChartCard>

        <ChartCard
          title="Asset Growth"
          description={`Cumulative asset additions by purchase date for ${analytics.filters.dateRangeLabel.toLowerCase()}.`}
        >
          {analytics.assetGrowth.some((item) => (item.cumulative ?? 0) > 0) ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.assetGrowth} margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis
                    dataKey="label"
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(entry) => {
                          if (entry.name === "Assets Added") {
                            return `${entry.value ?? 0}`;
                          }
                          return `${entry.value ?? 0}`;
                        }}
                      />
                    }
                  />
                  <Legend formatter={legendFormatter} wrapperStyle={chartLegendStyle} />
                  <Line
                    type="monotone"
                    dataKey="assetsAdded"
                    name="Assets Added"
                    stroke="var(--chart-muted)"
                    strokeWidth={2}
                    dot={{ r: 2, fill: "var(--chart-muted)", stroke: "var(--surface-primary)" }}
                    activeDot={{
                      r: 4,
                      fill: "var(--chart-muted)",
                      stroke: "var(--surface-primary)"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    name="Cumulative Total"
                    stroke="var(--chart-brand)"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "var(--chart-brand)", stroke: "var(--surface-primary)" }}
                    activeDot={{
                      r: 5,
                      fill: "var(--chart-brand)",
                      stroke: "var(--surface-primary)"
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No growth in window"
              description="No purchased assets were found within the selected trend window."
            />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Warranty Insights"
          description="Current warranty risk split into expiring, expired, and healthy coverage."
        >
          {analytics.warrantyInsights.some((item) => item.value > 0) ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.warrantyInsights} margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis
                    dataKey="label"
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Assets" radius={[10, 10, 0, 0]}>
                    {analytics.warrantyInsights.map((entry) => (
                      <Cell key={entry.label} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No warranty data"
              description="Add purchase and warranty dates to surface coverage risk."
            />
          )}
        </ChartCard>

        <ChartCard
          title="Overdue Returns"
          description="Employees with the highest number of overdue active asset assignments."
        >
          {analytics.overdueBreakdown.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.overdueBreakdown}
                  layout="vertical"
                  margin={{ left: 12, right: 16, top: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={axisTick}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={120}
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="value"
                    name="Overdue assets"
                    radius={[0, 10, 10, 0]}
                    fill="var(--chart-danger)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No overdue returns"
              description="All active assignments are currently within their expected return window."
            />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <DataTable
          title="Overdue Watchlist"
          subtitle="Assignments that need follow-up right now"
        >
          {analytics.overdueAssignments.length ? (
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Employee</th>
                  <th>Due</th>
                  <th>Delay</th>
                </tr>
              </thead>
              <tbody>
                {analytics.overdueAssignments.slice(0, 6).map((assignment) => (
                  <tr key={assignment.id}>
                    <td>
                      <Link to={`/assets/${assignment.asset_id}`} className="font-semibold text-brand-700">
                        {assignment.asset?.asset_tag}
                      </Link>
                    </td>
                    <td>{assignment.employee?.full_name}</td>
                    <td>{formatDate(assignment.due_date)}</td>
                    <td>{Math.abs(daysUntil(assignment.due_date))}d overdue</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              <EmptyState
                title="No overdue assets"
                description="Return risk is currently under control."
              />
            </div>
          )}
        </DataTable>

        <DataTable
          title="Warranty Watchlist"
          subtitle="Assets closest to losing or already without coverage"
        >
          {warrantyWatchlist.length ? (
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Risk</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {warrantyWatchlist.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <Link to={`/assets/${asset.id}`} className="font-semibold text-brand-700">
                        {asset.asset_tag}
                      </Link>
                    </td>
                    <td>{asset.category}</td>
                    <td>{formatWarrantyState(asset.warranty_expiry)}</td>
                    <td>{formatDate(asset.warranty_expiry)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              <EmptyState
                title="No warranty risk"
                description="No filtered assets are expiring soon or already expired."
              />
            </div>
          )}
        </DataTable>

        <DataTable
          title="Open Maintenance Queue"
          subtitle="Active repair workload for filtered assets"
        >
          {analytics.summary.openMaintenance.length ? (
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Issue</th>
                  <th>Vendor</th>
                  <th>Opened</th>
                </tr>
              </thead>
              <tbody>
                {analytics.summary.openMaintenance.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <Link to={`/assets/${record.asset_id}`} className="font-semibold text-brand-700">
                        {record.asset?.asset_tag}
                      </Link>
                    </td>
                    <td>{record.issue_type}</td>
                    <td>{record.vendor}</td>
                    <td>{formatDate(record.opened_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              <EmptyState
                title="No open maintenance"
                description="There are no active repair records for the current filter scope."
              />
            </div>
          )}
        </DataTable>
      </div>
    </div>
  );
}
