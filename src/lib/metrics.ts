import { daysUntil, isOverdue } from "./date";
import { titleCase } from "./utils";
import type {
  Asset,
  AssetStatus,
  AssignmentWithRelations,
  DashboardAnalytics,
  DashboardChartDatum,
  DashboardDateRangePreset,
  DashboardFilters,
  DashboardRawData,
  DashboardSummary,
  Employee,
  MaintenanceWithAsset
} from "../types/app";

const statusPalette: Record<AssetStatus, string> = {
  in_stock: "var(--chart-success)",
  assigned: "var(--chart-brand)",
  maintenance: "var(--chart-warning)",
  retired: "var(--chart-muted)",
  lost: "var(--chart-danger)"
};

const warrantyPalette = {
  expiring: "var(--chart-warning)",
  expired: "var(--chart-danger)",
  healthy: "var(--chart-success)"
};

const rangeConfig: Record<
  DashboardDateRangePreset,
  { label: string; days: number | null; bucket: "week" | "month" }
> = {
  "30d": {
    label: "Last 30 days",
    days: 30,
    bucket: "week"
  },
  "90d": {
    label: "Last 90 days",
    days: 90,
    bucket: "week"
  },
  "180d": {
    label: "Last 180 days",
    days: 180,
    bucket: "month"
  },
  "365d": {
    label: "Last 12 months",
    days: 365,
    bucket: "month"
  },
  all: {
    label: "All time",
    days: null,
    bucket: "month"
  }
};

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((left, right) =>
    left.localeCompare(right)
  );
}

function sortByNewest<T extends { assigned_at?: string; opened_at?: string; created_at?: string }>(
  values: T[]
) {
  return [...values].sort((left, right) => {
    const leftDate = new Date(
      left.assigned_at ?? left.opened_at ?? left.created_at ?? 0
    ).getTime();
    const rightDate = new Date(
      right.assigned_at ?? right.opened_at ?? right.created_at ?? 0
    ).getTime();

    return rightDate - leftDate;
  });
}

function startOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(value: Date, amount: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(value: Date) {
  const next = startOfDay(value);
  const day = next.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + offset);
  return next;
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function endOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0);
}

function toBucketDate(value: Date, bucket: "week" | "month") {
  return bucket === "week" ? startOfWeek(value) : startOfMonth(value);
}

function formatTrendLabel(value: Date, bucket: "week" | "month") {
  return bucket === "week"
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric"
      }).format(value)
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "2-digit"
      }).format(value);
}

function getWindowStart(preset: DashboardDateRangePreset) {
  const config = rangeConfig[preset];
  if (config.days === null) {
    return null;
  }

  const today = startOfDay(new Date());
  return addDays(today, -(config.days - 1));
}

function isWithinWindow(value: string | null | undefined, start: Date | null, end: Date) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (start && date < start) {
    return false;
  }

  return date <= end;
}

function createTimeline(
  dates: string[],
  bucket: "week" | "month",
  fallbackStart: Date | null,
  end: Date
) {
  const normalizedDates = dates
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()));

  const firstDate =
    fallbackStart ??
    (normalizedDates.length
      ? normalizedDates.reduce((earliest, current) =>
          current.getTime() < earliest.getTime() ? current : earliest
        )
      : startOfMonth(end));

  const timelineStart = toBucketDate(firstDate, bucket);
  const timelineEnd = toBucketDate(end, bucket);
  const buckets: Array<{ key: string; label: string }> = [];
  let cursor = timelineStart;

  while (cursor.getTime() <= timelineEnd.getTime()) {
    const key = cursor.toISOString();
    buckets.push({
      key,
      label: formatTrendLabel(cursor, bucket)
    });
    cursor =
      bucket === "week"
        ? addDays(cursor, 7)
        : new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return buckets;
}

function buildStatusDistribution(assets: Asset[]): DashboardChartDatum[] {
  return (["in_stock", "assigned", "maintenance", "retired", "lost"] as const).map(
    (status) => ({
      label: titleCase(status),
      value: assets.filter((asset) => asset.status === status).length,
      fill: statusPalette[status]
    })
  );
}

function buildAllocationByDepartment(assignments: AssignmentWithRelations[]) {
  const grouped = new Map<string, number>();

  assignments
    .filter((assignment) => assignment.status === "active")
    .forEach((assignment) => {
      const label = assignment.employee?.department || "Unassigned Department";
      grouped.set(label, (grouped.get(label) ?? 0) + 1);
    });

  return [...grouped.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 6);
}

function buildMaintenanceTrend(
  maintenance: MaintenanceWithAsset[],
  range: DashboardDateRangePreset
) {
  const { bucket } = rangeConfig[range];
  const end = new Date();
  const start = getWindowStart(range);
  const scoped = maintenance.filter(
    (record) =>
      isWithinWindow(record.opened_at, start, end) ||
      isWithinWindow(record.closed_at, start, end)
  );

  const timeline = createTimeline(
    scoped.flatMap((record) => [record.opened_at, record.closed_at ?? ""]).filter(Boolean),
    bucket,
    start,
    end
  );

  const openedCounts = new Map<string, number>();
  const closedCounts = new Map<string, number>();

  scoped.forEach((record) => {
    if (isWithinWindow(record.opened_at, start, end)) {
      const key = toBucketDate(new Date(record.opened_at), bucket).toISOString();
      openedCounts.set(key, (openedCounts.get(key) ?? 0) + 1);
    }

    if (isWithinWindow(record.closed_at, start, end)) {
      const key = toBucketDate(new Date(record.closed_at as string), bucket).toISOString();
      closedCounts.set(key, (closedCounts.get(key) ?? 0) + 1);
    }
  });

  return timeline.map((item) => ({
    bucket: item.key,
    label: item.label,
    opened: openedCounts.get(item.key) ?? 0,
    closed: closedCounts.get(item.key) ?? 0
  }));
}

function buildAssetGrowth(assets: Asset[], range: DashboardDateRangePreset) {
  const { bucket } = rangeConfig[range];
  const end = new Date();
  const start = getWindowStart(range);
  const datedAssets = assets
    .map((asset) => ({
      asset,
      acquiredAt: asset.purchase_date ?? asset.created_at
    }))
    .filter(({ acquiredAt }) => isWithinWindow(acquiredAt, start, end));

  const timeline = createTimeline(
    datedAssets.map(({ acquiredAt }) => acquiredAt),
    bucket,
    start,
    end
  );
  const additions = new Map<string, number>();

  datedAssets.forEach(({ acquiredAt }) => {
    const key = toBucketDate(new Date(acquiredAt), bucket).toISOString();
    additions.set(key, (additions.get(key) ?? 0) + 1);
  });

  let cumulative = 0;
  return timeline.map((item) => {
    const assetsAdded = additions.get(item.key) ?? 0;
    cumulative += assetsAdded;

    return {
      bucket: item.key,
      label: item.label,
      assetsAdded,
      cumulative
    };
  });
}

function buildWarrantyInsights(assets: Asset[]) {
  const expiringSoon = assets.filter((asset) => {
    const days = daysUntil(asset.warranty_expiry);
    return days >= 0 && days <= 45;
  });
  const expired = assets.filter((asset) => daysUntil(asset.warranty_expiry) < 0);
  const healthy = assets.filter((asset) => daysUntil(asset.warranty_expiry) > 45);

  return {
    expiringSoon,
    expired,
    chart: [
      {
        label: "Expiring Soon",
        value: expiringSoon.length,
        fill: warrantyPalette.expiring
      },
      {
        label: "Expired",
        value: expired.length,
        fill: warrantyPalette.expired
      },
      {
        label: "Healthy",
        value: healthy.length,
        fill: warrantyPalette.healthy
      }
    ] satisfies DashboardChartDatum[]
  };
}

function buildOverdueBreakdown(assignments: AssignmentWithRelations[]) {
  const grouped = new Map<string, number>();
  const overdueAssignments = assignments
    .filter((assignment) => assignment.status === "active" && isOverdue(assignment.due_date))
    .sort((left, right) => daysUntil(left.due_date) - daysUntil(right.due_date));

  overdueAssignments.forEach((assignment) => {
    const label = assignment.employee?.full_name || "Unassigned Employee";
    grouped.set(label, (grouped.get(label) ?? 0) + 1);
  });

  return {
    overdueAssignments,
    chart: [...grouped.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6)
  };
}

export function buildDashboardSummary(
  assets: Asset[],
  employees: Employee[],
  assignments: AssignmentWithRelations[],
  maintenance: MaintenanceWithAsset[]
): DashboardSummary {
  const activeAssets = assets.filter((asset) => !asset.archived_at);
  const activeEmployees = employees.filter(
    (employee) => employee.status === "active" && !employee.archived_at
  );
  const activeAssignments = assignments.filter((assignment) => assignment.status === "active");
  const openMaintenance = maintenance.filter((record) => record.status === "open");
  const warrantyExpiring = activeAssets
    .filter((asset) => {
      const days = daysUntil(asset.warranty_expiry);
      return days >= 0 && days <= 45;
    })
    .sort((left, right) => daysUntil(left.warranty_expiry) - daysUntil(right.warranty_expiry))
    .slice(0, 5);
  const expiredAssets = activeAssets.filter((asset) => daysUntil(asset.warranty_expiry) < 0);

  return {
    totals: {
      assets: activeAssets.length,
      available: activeAssets.filter((asset) => asset.status === "in_stock").length,
      assigned: activeAssets.filter((asset) => asset.status === "assigned").length,
      maintenance: activeAssets.filter((asset) => asset.status === "maintenance").length,
      retiredOrLost: activeAssets.filter(
        (asset) => asset.status === "retired" || asset.status === "lost"
      ).length,
      employees: activeEmployees.length,
      overdueReturns: activeAssignments.filter((assignment) => isOverdue(assignment.due_date))
        .length,
      warrantiesExpiring: warrantyExpiring.length,
      warrantiesExpired: expiredAssets.length
    },
    recentAssignments: sortByNewest(assignments).slice(0, 5),
    openMaintenance: sortByNewest(openMaintenance).slice(0, 5),
    warrantyExpiring
  };
}

export function buildDashboardAnalytics(
  data: DashboardRawData,
  filters: DashboardFilters
): DashboardAnalytics {
  const scopedAssets = data.assets.filter((asset) => {
    if (asset.archived_at) {
      return false;
    }

    if (filters.location !== "all" && asset.location !== filters.location) {
      return false;
    }

    if (filters.category !== "all" && asset.category !== filters.category) {
      return false;
    }

    return true;
  });
  const scopedAssetIds = new Set(scopedAssets.map((asset) => asset.id));
  const scopedAssignments = data.assignments.filter((assignment) =>
    scopedAssetIds.has(assignment.asset_id)
  );
  const scopedMaintenance = data.maintenance.filter((record) =>
    scopedAssetIds.has(record.asset_id)
  );
  const scopedEmployees = data.employees.filter((employee) => {
    if (employee.archived_at || employee.status !== "active") {
      return false;
    }

    if (filters.location === "all") {
      return true;
    }

    return employee.location === filters.location;
  });

  const summary = buildDashboardSummary(
    scopedAssets,
    scopedEmployees,
    scopedAssignments,
    scopedMaintenance
  );
  const warranty = buildWarrantyInsights(scopedAssets);
  const overdue = buildOverdueBreakdown(scopedAssignments);

  return {
    summary: {
      ...summary,
      totals: {
        ...summary.totals,
        employees: scopedEmployees.length,
        warrantiesExpired: warranty.expired.length
      }
    },
    filters: {
      locations: uniqueSorted(data.assets.map((asset) => asset.location)),
      categories: uniqueSorted(data.assets.map((asset) => asset.category)),
      dateRangeLabel: rangeConfig[filters.dateRange].label
    },
    statusDistribution: buildStatusDistribution(scopedAssets),
    assetAllocation: buildAllocationByDepartment(scopedAssignments),
    maintenanceTrend: buildMaintenanceTrend(scopedMaintenance, filters.dateRange),
    assetGrowth: buildAssetGrowth(scopedAssets, filters.dateRange),
    warrantyInsights: warranty.chart,
    overdueBreakdown: overdue.chart,
    overdueAssignments: overdue.overdueAssignments,
    expiredAssets: warranty.expired
  };
}
