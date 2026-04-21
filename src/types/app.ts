export type AppMode = "demo" | "supabase";
export type Role = "admin" | "it_staff";
export type AssignmentStatus = "active" | "returned";
export type MaintenanceStatus = "open" | "closed";
export type ActivityEntity =
  | "asset"
  | "employee"
  | "assignment"
  | "maintenance"
  | "document"
  | "user";

export const assetStatuses = [
  "in_stock",
  "assigned",
  "maintenance",
  "retired",
  "lost"
 ] as const;

export const assetConditions = [
  "new",
  "good",
  "fair",
  "poor",
  "damaged"
 ] as const;

export const employeeStatuses = ["active", "inactive"] as const;

export type AssetStatus = (typeof assetStatuses)[number];
export type AssetCondition = (typeof assetConditions)[number];
export type EmployeeStatus = (typeof employeeStatuses)[number];

export const assetCategories = [
  "Laptop",
  "Desktop",
  "Monitor",
  "Phone",
  "Tablet",
  "Printer",
  "Accessory",
  "Network"
] as const;

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  active: boolean;
  created_at: string;
}

export interface Asset {
  id: string;
  asset_tag: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  serial_number: string;
  purchase_date: string | null;
  warranty_expiry: string | null;
  location: string;
  condition: AssetCondition;
  status: AssetStatus;
  notes: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  current_employee_id: string | null;
}

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  phone: string;
  status: EmployeeStatus;
  notes: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetAssignment {
  id: string;
  asset_id: string;
  employee_id: string;
  assigned_at: string;
  due_date: string | null;
  returned_at: string | null;
  assigned_condition: AssetCondition;
  return_condition: AssetCondition | null;
  return_notes: string;
  notes: string;
  status: AssignmentStatus;
}

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  issue_type: string;
  notes: string;
  vendor: string;
  cost: number | null;
  opened_at: string;
  closed_at: string | null;
  resolution: string;
  status: MaintenanceStatus;
}

export interface AssetDocument {
  id: string;
  asset_id: string;
  name: string;
  content_type: string;
  size: number;
  storage_path: string;
  url: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface ActivityLog {
  id: string;
  entity_type: ActivityEntity;
  entity_id: string;
  asset_id: string | null;
  action: string;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
  actor_name: string;
  actor_email: string;
}

export interface AssignmentWithRelations extends AssetAssignment {
  asset?: Asset;
  employee?: Employee;
}

export interface MaintenanceWithAsset extends MaintenanceRecord {
  asset?: Asset;
}

export interface AssetDetail {
  asset: Asset;
  assignments: AssignmentWithRelations[];
  maintenanceRecords: MaintenanceRecord[];
  documents: AssetDocument[];
  activityLogs: ActivityLog[];
}

export interface EmployeeDetail {
  employee: Employee;
  assignments: AssignmentWithRelations[];
  activityLogs: ActivityLog[];
}

export interface DashboardSummary {
  totals: {
    assets: number;
    available: number;
    assigned: number;
    maintenance: number;
    retiredOrLost: number;
    employees: number;
    overdueReturns: number;
    warrantiesExpiring: number;
    warrantiesExpired: number;
  };
  recentAssignments: AssignmentWithRelations[];
  openMaintenance: MaintenanceWithAsset[];
  warrantyExpiring: Asset[];
}

export type DashboardDateRangePreset = "30d" | "90d" | "180d" | "365d" | "all";

export interface DashboardFilters {
  dateRange: DashboardDateRangePreset;
  location: string;
  category: string;
}

export interface DashboardRawData {
  assets: Asset[];
  employees: Employee[];
  assignments: AssignmentWithRelations[];
  maintenance: MaintenanceWithAsset[];
}

export interface DashboardChartDatum {
  label: string;
  value: number;
  fill?: string;
}

export interface DashboardTrendDatum {
  bucket: string;
  label: string;
  opened?: number;
  closed?: number;
  assetsAdded?: number;
  cumulative?: number;
}

export interface DashboardAllocationDatum {
  label: string;
  value: number;
}

export interface DashboardOverdueDatum {
  label: string;
  value: number;
}

export interface DashboardAnalytics {
  summary: DashboardSummary;
  filters: {
    locations: string[];
    categories: string[];
    dateRangeLabel: string;
  };
  statusDistribution: DashboardChartDatum[];
  assetAllocation: DashboardAllocationDatum[];
  maintenanceTrend: DashboardTrendDatum[];
  assetGrowth: DashboardTrendDatum[];
  warrantyInsights: DashboardChartDatum[];
  overdueBreakdown: DashboardOverdueDatum[];
  overdueAssignments: AssignmentWithRelations[];
  expiredAssets: Asset[];
}

export interface AssetInput {
  asset_tag: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  serial_number: string;
  purchase_date: string | null;
  warranty_expiry: string | null;
  location: string;
  condition: AssetCondition;
  status: AssetStatus;
  notes: string;
}

export interface EmployeeInput {
  employee_code: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  phone: string;
  status: EmployeeStatus;
  notes: string;
}

export interface AssignAssetInput {
  asset_id: string;
  employee_id: string;
  due_date: string | null;
  notes: string;
}

export interface ReturnAssetInput {
  assignment_id: string;
  return_condition: AssetCondition;
  send_to_maintenance: boolean;
  return_notes: string;
}

export interface OpenMaintenanceInput {
  asset_id: string;
  issue_type: string;
  notes: string;
  vendor: string;
}

export interface CloseMaintenanceInput {
  maintenance_id: string;
  resolution: string;
  cost: number | null;
}

export interface InviteUserInput {
  email: string;
  full_name: string;
  role: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}
