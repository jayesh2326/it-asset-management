import type {
  Asset,
  AssetDetail,
  AssetDocument,
  AssetInput,
  AssignAssetInput,
  AssignmentWithRelations,
  CloseMaintenanceInput,
  DashboardSummary,
  Employee,
  EmployeeDetail,
  EmployeeInput,
  InviteUserInput,
  MaintenanceWithAsset,
  OpenMaintenanceInput,
  Profile,
  ReturnAssetInput
} from "../types/app";

export interface Repository {
  getDashboardSummary(): Promise<DashboardSummary>;
  listAssets(): Promise<Asset[]>;
  getAssetDetail(assetId: string): Promise<AssetDetail>;
  createAsset(input: AssetInput): Promise<Asset>;
  updateAsset(assetId: string, input: AssetInput): Promise<Asset>;
  archiveAsset(assetId: string): Promise<void>;
  listEmployees(): Promise<Employee[]>;
  getEmployeeDetail(employeeId: string): Promise<EmployeeDetail>;
  createEmployee(input: EmployeeInput): Promise<Employee>;
  updateEmployee(employeeId: string, input: EmployeeInput): Promise<Employee>;
  deactivateEmployee(employeeId: string): Promise<void>;
  listAssignments(): Promise<AssignmentWithRelations[]>;
  assignAsset(input: AssignAssetInput): Promise<void>;
  returnAsset(input: ReturnAssetInput): Promise<void>;
  listMaintenanceRecords(): Promise<MaintenanceWithAsset[]>;
  openMaintenance(input: OpenMaintenanceInput): Promise<void>;
  closeMaintenance(input: CloseMaintenanceInput): Promise<void>;
  uploadAssetDocument(assetId: string, file: File): Promise<AssetDocument>;
  listProfiles(): Promise<Profile[]>;
  inviteUser(input: InviteUserInput): Promise<void>;
  updateUserRole(userId: string, role: Profile["role"]): Promise<void>;
}
