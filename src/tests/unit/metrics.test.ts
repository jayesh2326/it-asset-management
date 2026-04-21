import { describe, expect, it } from "vitest";
import { buildDashboardSummary } from "../../lib/metrics";
import type {
  Asset,
  AssignmentWithRelations,
  Employee,
  MaintenanceWithAsset
} from "../../types/app";

const assets: Asset[] = [
  {
    id: "asset-1",
    asset_tag: "LAP-1001",
    name: "Laptop",
    category: "Laptop",
    brand: "Lenovo",
    model: "T14",
    serial_number: "SER-1001",
    purchase_date: "2025-01-01",
    warranty_expiry: "2099-01-01",
    location: "HQ",
    condition: "good",
    status: "assigned",
    notes: "",
    archived_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    current_employee_id: "employee-1"
  },
  {
    id: "asset-2",
    asset_tag: "MON-2001",
    name: "Monitor",
    category: "Monitor",
    brand: "Dell",
    model: "P2724",
    serial_number: "SER-2001",
    purchase_date: "2025-01-01",
    warranty_expiry: "2026-01-15",
    location: "Locker",
    condition: "good",
    status: "maintenance",
    notes: "",
    archived_at: null,
    created_at: "2026-01-02T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    current_employee_id: null
  }
];

const employees: Employee[] = [
  {
    id: "employee-1",
    employee_code: "EMP-1",
    full_name: "Ava Johnson",
    email: "ava@company.com",
    department: "Engineering",
    designation: "Developer",
    location: "HQ",
    phone: "1234567",
    status: "active",
    notes: "",
    archived_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  }
];

const assignments: AssignmentWithRelations[] = [
  {
    id: "assignment-1",
    asset_id: "asset-1",
    employee_id: "employee-1",
    assigned_at: "2026-02-01T00:00:00.000Z",
    due_date: "2026-02-10",
    returned_at: null,
    assigned_condition: "good",
    return_condition: null,
    return_notes: "",
    notes: "",
    status: "active",
    asset: assets[0],
    employee: employees[0]
  }
];

const maintenance: MaintenanceWithAsset[] = [
  {
    id: "maintenance-1",
    asset_id: "asset-2",
    issue_type: "Battery",
    notes: "",
    vendor: "Vendor",
    cost: null,
    opened_at: "2026-02-02T00:00:00.000Z",
    closed_at: null,
    resolution: "",
    status: "open",
    asset: assets[1]
  }
];

describe("buildDashboardSummary", () => {
  it("aggregates totals from core entity collections", () => {
    const summary = buildDashboardSummary(assets, employees, assignments, maintenance);

    expect(summary.totals.assets).toBe(2);
    expect(summary.totals.assigned).toBe(1);
    expect(summary.totals.maintenance).toBe(1);
    expect(summary.totals.employees).toBe(1);
    expect(summary.recentAssignments).toHaveLength(1);
    expect(summary.openMaintenance).toHaveLength(1);
  });
});
