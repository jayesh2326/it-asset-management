import { buildDashboardSummary } from "./metrics";
import type { Repository } from "./repository";
import { createId, nowIso, safeJsonParse } from "./utils";
import type {
  Asset,
  AssetAssignment,
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
  LoginInput,
  MaintenanceRecord,
  MaintenanceWithAsset,
  OpenMaintenanceInput,
  Profile,
  ReturnAssetInput,
  Role
} from "../types/app";

const DB_KEY = "it-asset-manager-demo-db";
const SESSION_KEY = "it-asset-manager-demo-session";
const DEFAULT_PASSWORD = "password123";

interface DemoProfileRecord extends Profile {
  password: string;
}

interface DemoState {
  profiles: DemoProfileRecord[];
  assets: Asset[];
  employees: Employee[];
  assignments: AssetAssignment[];
  maintenanceRecords: MaintenanceRecord[];
  documents: AssetDocument[];
  activityLogs: AssetDetail["activityLogs"];
}

export const demoCredentials = [
  { email: "admin@company.com", password: DEFAULT_PASSWORD, role: "admin" },
  { email: "it@company.com", password: DEFAULT_PASSWORD, role: "it_staff" }
] as const;

function profileWithoutPassword(profile: DemoProfileRecord): Profile {
  const { password: _password, ...safeProfile } = profile;
  return safeProfile;
}

function seedDemoState(): DemoState {
  const createdAt = "2026-04-02T09:00:00.000Z";
  const adminId = "profile_admin";
  const employeeA = "employee_ava";
  const employeeB = "employee_liam";
  const employeeC = "employee_maya";
  const assetA = "asset_lap_1001";
  const assetB = "asset_mon_2204";
  const assetC = "asset_phone_1103";
  const assetD = "asset_lap_1008";
  const assignmentA = "assign_3001";
  const maintenanceA = "maint_4101";

  return {
    profiles: [
      {
        id: adminId,
        email: "admin@company.com",
        full_name: "Alicia Fernandes",
        role: "admin",
        active: true,
        created_at: createdAt,
        password: DEFAULT_PASSWORD
      },
      {
        id: "profile_staff",
        email: "it@company.com",
        full_name: "Rohan Kapoor",
        role: "it_staff",
        active: true,
        created_at: createdAt,
        password: DEFAULT_PASSWORD
      }
    ],
    employees: [
      {
        id: employeeA,
        employee_code: "EMP-1001",
        full_name: "Ava Johnson",
        email: "ava.johnson@company.com",
        department: "Engineering",
        designation: "Senior Developer",
        location: "Bengaluru",
        phone: "+91 90000 10001",
        status: "active",
        notes: "Works remotely twice per week.",
        archived_at: null,
        created_at: createdAt,
        updated_at: createdAt
      },
      {
        id: employeeB,
        employee_code: "EMP-1012",
        full_name: "Liam Chen",
        email: "liam.chen@company.com",
        department: "Support",
        designation: "Support Lead",
        location: "Hyderabad",
        phone: "+91 90000 10012",
        status: "active",
        notes: "",
        archived_at: null,
        created_at: createdAt,
        updated_at: createdAt
      },
      {
        id: employeeC,
        employee_code: "EMP-1044",
        full_name: "Maya Singh",
        email: "maya.singh@company.com",
        department: "HR",
        designation: "HR Manager",
        location: "Pune",
        phone: "+91 90000 10444",
        status: "inactive",
        notes: "Offboarded last quarter.",
        archived_at: "2026-03-12T11:00:00.000Z",
        created_at: createdAt,
        updated_at: "2026-03-12T11:00:00.000Z"
      }
    ],
    assets: [
      {
        id: assetA,
        asset_tag: "LAP-1001",
        name: "MacBook Pro 14",
        category: "Laptop",
        brand: "Apple",
        model: "M3 Pro",
        serial_number: "MBP-14-1001",
        purchase_date: "2025-08-15",
        warranty_expiry: "2026-08-15",
        location: "Bengaluru HQ",
        condition: "good",
        status: "assigned",
        notes: "Primary engineering laptop.",
        archived_at: null,
        created_at: createdAt,
        updated_at: "2026-04-01T08:20:00.000Z",
        current_employee_id: employeeA
      },
      {
        id: assetB,
        asset_tag: "MON-2204",
        name: "Dell 27 Monitor",
        category: "Monitor",
        brand: "Dell",
        model: "P2724H",
        serial_number: "DEL-MON-2204",
        purchase_date: "2025-05-03",
        warranty_expiry: "2026-05-03",
        location: "Hyderabad",
        condition: "good",
        status: "in_stock",
        notes: "",
        archived_at: null,
        created_at: createdAt,
        updated_at: createdAt,
        current_employee_id: null
      },
      {
        id: assetC,
        asset_tag: "PHN-1103",
        name: "iPhone 15",
        category: "Phone",
        brand: "Apple",
        model: "iPhone 15",
        serial_number: "IPH-1103",
        purchase_date: "2025-10-10",
        warranty_expiry: "2026-10-10",
        location: "IT Locker",
        condition: "fair",
        status: "maintenance",
        notes: "Speaker issue reported.",
        archived_at: null,
        created_at: createdAt,
        updated_at: "2026-03-28T16:10:00.000Z",
        current_employee_id: null
      },
      {
        id: assetD,
        asset_tag: "LAP-1008",
        name: "ThinkPad T14",
        category: "Laptop",
        brand: "Lenovo",
        model: "T14 Gen 4",
        serial_number: "LNV-1008",
        purchase_date: "2025-07-01",
        warranty_expiry: "2026-04-25",
        location: "Bench Pool",
        condition: "new",
        status: "in_stock",
        notes: "Reserved for onboarding.",
        archived_at: null,
        created_at: createdAt,
        updated_at: createdAt,
        current_employee_id: null
      }
    ],
    assignments: [
      {
        id: assignmentA,
        asset_id: assetA,
        employee_id: employeeA,
        assigned_at: "2026-03-14T10:00:00.000Z",
        due_date: "2026-04-10",
        returned_at: null,
        assigned_condition: "good",
        return_condition: null,
        return_notes: "",
        notes: "Assigned as primary device.",
        status: "active"
      }
    ],
    maintenanceRecords: [
      {
        id: maintenanceA,
        asset_id: assetC,
        issue_type: "Audio issue",
        notes: "Speaker volume drops intermittently.",
        vendor: "MobileCare",
        cost: null,
        opened_at: "2026-03-28T16:10:00.000Z",
        closed_at: null,
        resolution: "",
        status: "open"
      }
    ],
    documents: [],
    activityLogs: [
      {
        id: createId("log"),
        entity_type: "assignment",
        entity_id: assignmentA,
        asset_id: assetA,
        action: "asset_assigned",
        message: "Assigned LAP-1001 to Ava Johnson.",
        metadata: {
          asset_id: assetA,
          employee_id: employeeA
        },
        created_at: "2026-03-14T10:00:00.000Z",
        actor_name: "Rohan Kapoor",
        actor_email: "it@company.com"
      },
      {
        id: createId("log"),
        entity_type: "maintenance",
        entity_id: maintenanceA,
        asset_id: assetC,
        action: "maintenance_opened",
        message: "Opened maintenance for PHN-1103.",
        metadata: {
          asset_id: assetC
        },
        created_at: "2026-03-28T16:10:00.000Z",
        actor_name: "Rohan Kapoor",
        actor_email: "it@company.com"
      }
    ]
  };
}

function readState() {
  if (typeof window === "undefined") {
    return seedDemoState();
  }

  const existing = window.localStorage.getItem(DB_KEY);
  if (!existing) {
    const seed = seedDemoState();
    writeState(seed);
    return seed;
  }

  return safeJsonParse<DemoState>(existing, seedDemoState());
}

function writeState(state: DemoState) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DB_KEY, JSON.stringify(state));
  }
}

function getCurrentSessionProfileId() {
  if (typeof window === "undefined") {
    return null;
  }

  window.localStorage.removeItem(SESSION_KEY);
  return window.sessionStorage.getItem(SESSION_KEY);
}

function setCurrentSessionProfileId(profileId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (profileId) {
    window.sessionStorage.setItem(SESSION_KEY, profileId);
  } else {
    window.sessionStorage.removeItem(SESSION_KEY);
  }
}

function requireActor(profile: Profile | null | undefined) {
  if (!profile) {
    throw new Error("Sign in to continue.");
  }

  return profile;
}

function requireAdmin(profile: Profile | null | undefined) {
  const actor = requireActor(profile);
  if (actor.role !== "admin") {
    throw new Error("Only admins can access this action.");
  }

  return actor;
}

function logActivity(
  state: DemoState,
  actor: Profile,
  entry: Omit<
    DemoState["activityLogs"][number],
    "id" | "created_at" | "actor_name" | "actor_email"
  >
) {
  state.activityLogs.unshift({
    id: createId("log"),
    created_at: nowIso(),
    actor_name: actor.full_name,
    actor_email: actor.email,
    ...entry
  });
}

function ensureUniqueAssetTag(state: DemoState, assetTag: string, assetId?: string) {
  const exists = state.assets.some(
    (asset) => asset.asset_tag.toLowerCase() === assetTag.toLowerCase() && asset.id !== assetId
  );
  if (exists) {
    throw new Error("Asset tag already exists.");
  }
}

function ensureUniqueEmployee(state: DemoState, employee: EmployeeInput, employeeId?: string) {
  const codeExists = state.employees.some(
    (item) =>
      item.employee_code.toLowerCase() === employee.employee_code.toLowerCase() &&
      item.id !== employeeId
  );
  if (codeExists) {
    throw new Error("Employee code already exists.");
  }

  const emailExists = state.employees.some(
    (item) => item.email.toLowerCase() === employee.email.toLowerCase() && item.id !== employeeId
  );
  if (emailExists) {
    throw new Error("Employee email already exists.");
  }
}

function getAssetOrThrow(state: DemoState, assetId: string) {
  const asset = state.assets.find((item) => item.id === assetId);
  if (!asset) {
    throw new Error("Asset not found.");
  }

  return asset;
}

function getEmployeeOrThrow(state: DemoState, employeeId: string) {
  const employee = state.employees.find((item) => item.id === employeeId);
  if (!employee) {
    throw new Error("Employee not found.");
  }

  return employee;
}

function getAssignmentOrThrow(state: DemoState, assignmentId: string) {
  const assignment = state.assignments.find((item) => item.id === assignmentId);
  if (!assignment) {
    throw new Error("Assignment not found.");
  }

  return assignment;
}

function getMaintenanceOrThrow(state: DemoState, maintenanceId: string) {
  const record = state.maintenanceRecords.find((item) => item.id === maintenanceId);
  if (!record) {
    throw new Error("Maintenance record not found.");
  }

  return record;
}

function buildAssignmentsWithRelations(
  state: DemoState,
  assignments: AssetAssignment[]
): AssignmentWithRelations[] {
  return assignments.map((assignment) => ({
    ...assignment,
    asset: state.assets.find((asset) => asset.id === assignment.asset_id),
    employee: state.employees.find((employee) => employee.id === assignment.employee_id)
  }));
}

function buildMaintenanceWithAssets(
  state: DemoState,
  records: MaintenanceRecord[]
): MaintenanceWithAsset[] {
  return records.map((record) => ({
    ...record,
    asset: state.assets.find((asset) => asset.id === record.asset_id)
  }));
}

function activeAssignmentsForEmployee(state: DemoState, employeeId: string) {
  return state.assignments.filter(
    (assignment) => assignment.employee_id === employeeId && assignment.status === "active"
  );
}

function activeAssignmentForAsset(state: DemoState, assetId: string) {
  return state.assignments.find(
    (assignment) => assignment.asset_id === assetId && assignment.status === "active"
  );
}

function openMaintenanceForAsset(state: DemoState, assetId: string) {
  return state.maintenanceRecords.find(
    (record) => record.asset_id === assetId && record.status === "open"
  );
}

function sortByNewest<T extends { created_at?: string; assigned_at?: string; opened_at?: string }>(
  values: T[]
) {
  return [...values].sort((left, right) => {
    const leftDate = new Date(
      left.created_at ?? left.assigned_at ?? left.opened_at ?? 0
    ).getTime();
    const rightDate = new Date(
      right.created_at ?? right.assigned_at ?? right.opened_at ?? 0
    ).getTime();
    return rightDate - leftDate;
  });
}

async function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export function getDemoSessionProfile() {
  const state = readState();
  const currentId = getCurrentSessionProfileId();
  const profile = state.profiles.find((item) => item.id === currentId);
  return profile ? profileWithoutPassword(profile) : null;
}

export async function signInDemo(input: LoginInput) {
  const state = readState();
  const profile = state.profiles.find(
    (item) =>
      item.email.toLowerCase() === input.email.toLowerCase() &&
      item.password === input.password &&
      item.active
  );

  if (!profile) {
    throw new Error("Invalid demo credentials.");
  }

  setCurrentSessionProfileId(profile.id);
  return profileWithoutPassword(profile);
}

export async function signUpDemo(input: LoginInput & { full_name: string }) {
  const state = readState();
  const email = input.email.trim().toLowerCase();
  const fullName = input.full_name.trim();

  if (state.profiles.some((item) => item.email.toLowerCase() === email)) {
    throw new Error("A demo user with this email already exists.");
  }

  const profile: DemoProfileRecord = {
    id: createId("profile"),
    email,
    full_name: fullName,
    role: "it_staff",
    active: true,
    created_at: nowIso(),
    password: input.password
  };

  state.profiles.unshift(profile);
  writeState(state);
  setCurrentSessionProfileId(profile.id);

  return profileWithoutPassword(profile);
}

export async function signOutDemo() {
  setCurrentSessionProfileId(null);
}

export function createDemoRepository(currentProfile: Profile | null): Repository {
  return {
    async getDashboardSummary(): Promise<DashboardSummary> {
      requireActor(currentProfile);
      const state = readState();
      return buildDashboardSummary(
        state.assets,
        state.employees,
        buildAssignmentsWithRelations(state, state.assignments),
        buildMaintenanceWithAssets(state, state.maintenanceRecords)
      );
    },

    async listAssets() {
      requireActor(currentProfile);
      const state = readState();
      return sortByNewest(state.assets);
    },

    async getAssetDetail(assetId: string): Promise<AssetDetail> {
      requireActor(currentProfile);
      const state = readState();
      const asset = getAssetOrThrow(state, assetId);
      const assignments = buildAssignmentsWithRelations(
        state,
        state.assignments
          .filter((assignment) => assignment.asset_id === assetId)
          .sort(
            (left, right) =>
              new Date(right.assigned_at).getTime() - new Date(left.assigned_at).getTime()
          )
      );
      const maintenanceRecords = [...state.maintenanceRecords]
        .filter((record) => record.asset_id === assetId)
        .sort(
          (left, right) =>
            new Date(right.opened_at).getTime() - new Date(left.opened_at).getTime()
        );
      const documents = [...state.documents]
        .filter((document) => document.asset_id === assetId)
        .sort(
          (left, right) =>
            new Date(right.uploaded_at).getTime() - new Date(left.uploaded_at).getTime()
        );
      const activityLogs = [...state.activityLogs]
        .filter(
          (log) =>
            log.asset_id === assetId ||
            (log.entity_type === "asset" && log.entity_id === assetId)
        )
        .sort(
          (left, right) =>
            new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
        );

      return {
        asset,
        assignments,
        maintenanceRecords,
        documents,
        activityLogs
      };
    },

    async createAsset(input: AssetInput) {
      const actor = requireActor(currentProfile);
      const state = readState();
      ensureUniqueAssetTag(state, input.asset_tag);
      const asset: Asset = {
        id: createId("asset"),
        current_employee_id: null,
        archived_at: null,
        created_at: nowIso(),
        updated_at: nowIso(),
        ...input
      };

      state.assets.unshift(asset);
      logActivity(state, actor, {
        entity_type: "asset",
        entity_id: asset.id,
        asset_id: asset.id,
        action: "asset_created",
        message: `Created asset ${asset.asset_tag}.`,
        metadata: { asset_tag: asset.asset_tag }
      });
      writeState(state);
      return asset;
    },

    async updateAsset(assetId: string, input: AssetInput) {
      const actor = requireActor(currentProfile);
      const state = readState();
      ensureUniqueAssetTag(state, input.asset_tag, assetId);
      const asset = getAssetOrThrow(state, assetId);

      if (asset.status === "assigned" && input.status !== "assigned") {
        throw new Error("Return the asset before changing it out of assigned status.");
      }

      Object.assign(asset, input, { updated_at: nowIso() });
      logActivity(state, actor, {
        entity_type: "asset",
        entity_id: asset.id,
        asset_id: asset.id,
        action: "asset_updated",
        message: `Updated asset ${asset.asset_tag}.`,
        metadata: { asset_tag: asset.asset_tag }
      });
      writeState(state);
      return asset;
    },

    async archiveAsset(assetId: string) {
      const actor = requireActor(currentProfile);
      const state = readState();
      const asset = getAssetOrThrow(state, assetId);

      if (activeAssignmentForAsset(state, assetId)) {
        throw new Error("Return the asset before archiving it.");
      }

      asset.archived_at = nowIso();
      asset.updated_at = nowIso();
      logActivity(state, actor, {
        entity_type: "asset",
        entity_id: asset.id,
        asset_id: asset.id,
        action: "asset_archived",
        message: `Archived asset ${asset.asset_tag}.`,
        metadata: { asset_tag: asset.asset_tag }
      });
      writeState(state);
    },

    async listEmployees() {
      requireActor(currentProfile);
      const state = readState();
      return sortByNewest(state.employees);
    },

    async getEmployeeDetail(employeeId: string): Promise<EmployeeDetail> {
      requireActor(currentProfile);
      const state = readState();
      const employee = getEmployeeOrThrow(state, employeeId);
      const assignments = buildAssignmentsWithRelations(
        state,
        state.assignments.filter((assignment) => assignment.employee_id === employeeId)
      ).sort(
        (left, right) =>
          new Date(right.assigned_at).getTime() - new Date(left.assigned_at).getTime()
      );

      const activityLogs = [...state.activityLogs]
        .filter(
          (log) =>
            (log.entity_type === "employee" && log.entity_id === employeeId) ||
            log.metadata.employee_id === employeeId
        )
        .sort(
          (left, right) =>
            new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
        );

      return {
        employee,
        assignments,
        activityLogs
      };
    },

    async createEmployee(input: EmployeeInput) {
      const actor = requireActor(currentProfile);
      const state = readState();
      ensureUniqueEmployee(state, input);
      const employee: Employee = {
        id: createId("employee"),
        archived_at: input.status === "inactive" ? nowIso() : null,
        created_at: nowIso(),
        updated_at: nowIso(),
        ...input
      };

      state.employees.unshift(employee);
      logActivity(state, actor, {
        entity_type: "employee",
        entity_id: employee.id,
        asset_id: null,
        action: "employee_created",
        message: `Created employee ${employee.full_name}.`,
        metadata: { employee_id: employee.id }
      });
      writeState(state);
      return employee;
    },

    async updateEmployee(employeeId: string, input: EmployeeInput) {
      const actor = requireActor(currentProfile);
      const state = readState();
      ensureUniqueEmployee(state, input, employeeId);
      const employee = getEmployeeOrThrow(state, employeeId);

      if (input.status === "inactive" && activeAssignmentsForEmployee(state, employeeId).length) {
        throw new Error("Return or reassign active assets before deactivating the employee.");
      }

      Object.assign(employee, input, {
        archived_at: input.status === "inactive" ? employee.archived_at ?? nowIso() : null,
        updated_at: nowIso()
      });
      logActivity(state, actor, {
        entity_type: "employee",
        entity_id: employee.id,
        asset_id: null,
        action: "employee_updated",
        message: `Updated employee ${employee.full_name}.`,
        metadata: { employee_id: employee.id }
      });
      writeState(state);
      return employee;
    },

    async deactivateEmployee(employeeId: string) {
      const actor = requireActor(currentProfile);
      const state = readState();
      const employee = getEmployeeOrThrow(state, employeeId);

      if (activeAssignmentsForEmployee(state, employeeId).length > 0) {
        throw new Error("Return or reassign active assets before deactivating the employee.");
      }

      employee.status = "inactive";
      employee.archived_at = employee.archived_at ?? nowIso();
      employee.updated_at = nowIso();
      logActivity(state, actor, {
        entity_type: "employee",
        entity_id: employee.id,
        asset_id: null,
        action: "employee_deactivated",
        message: `Deactivated employee ${employee.full_name}.`,
        metadata: { employee_id: employee.id }
      });
      writeState(state);
    },

    async listAssignments() {
      requireActor(currentProfile);
      const state = readState();
      return buildAssignmentsWithRelations(state, state.assignments).sort(
        (left, right) =>
          new Date(right.assigned_at).getTime() - new Date(left.assigned_at).getTime()
      );
    },

    async assignAsset(input: AssignAssetInput) {
      const actor = requireActor(currentProfile);
      const state = readState();
      const asset = getAssetOrThrow(state, input.asset_id);
      const employee = getEmployeeOrThrow(state, input.employee_id);

      if (asset.archived_at) {
        throw new Error("Archived assets cannot be assigned.");
      }
      if (employee.status !== "active" || employee.archived_at) {
        throw new Error("Only active employees can receive assets.");
      }
      if (asset.status !== "in_stock") {
        throw new Error("Only in-stock assets can be assigned.");
      }
      if (openMaintenanceForAsset(state, asset.id)) {
        throw new Error("Close maintenance before assigning this asset.");
      }

      const assignment: AssetAssignment = {
        id: createId("assignment"),
        asset_id: asset.id,
        employee_id: employee.id,
        assigned_at: nowIso(),
        due_date: input.due_date || null,
        returned_at: null,
        assigned_condition: asset.condition,
        return_condition: null,
        return_notes: "",
        notes: input.notes,
        status: "active"
      };

      state.assignments.unshift(assignment);
      asset.status = "assigned";
      asset.current_employee_id = employee.id;
      asset.updated_at = nowIso();
      logActivity(state, actor, {
        entity_type: "assignment",
        entity_id: assignment.id,
        asset_id: asset.id,
        action: "asset_assigned",
        message: `Assigned ${asset.asset_tag} to ${employee.full_name}.`,
        metadata: {
          asset_id: asset.id,
          employee_id: employee.id
        }
      });
      writeState(state);
    },

    async returnAsset(input: ReturnAssetInput) {
      const actor = requireActor(currentProfile);
      const state = readState();
      const assignment = getAssignmentOrThrow(state, input.assignment_id);

      if (assignment.status !== "active") {
        throw new Error("This assignment has already been returned.");
      }

      const asset = getAssetOrThrow(state, assignment.asset_id);
      assignment.status = "returned";
      assignment.returned_at = nowIso();
      assignment.return_condition = input.return_condition;
      assignment.return_notes = input.return_notes;
      asset.current_employee_id = null;
      asset.condition = input.return_condition;
      asset.status = input.send_to_maintenance ? "maintenance" : "in_stock";
      asset.updated_at = nowIso();

      logActivity(state, actor, {
        entity_type: "assignment",
        entity_id: assignment.id,
        asset_id: asset.id,
        action: "asset_returned",
        message: `Returned ${asset.asset_tag}.`,
        metadata: {
          asset_id: asset.id,
          employee_id: assignment.employee_id,
          send_to_maintenance: input.send_to_maintenance
        }
      });

      if (input.send_to_maintenance) {
        const record: MaintenanceRecord = {
          id: createId("maintenance"),
          asset_id: asset.id,
          issue_type: "Return inspection",
          notes: input.return_notes || "Returned for IT inspection.",
          vendor: "Internal IT",
          cost: null,
          opened_at: nowIso(),
          closed_at: null,
          resolution: "",
          status: "open"
        };
        state.maintenanceRecords.unshift(record);
        logActivity(state, actor, {
          entity_type: "maintenance",
          entity_id: record.id,
          asset_id: asset.id,
          action: "maintenance_opened",
          message: `Opened maintenance for ${asset.asset_tag} after return.`,
          metadata: {
            asset_id: asset.id,
            source: "return_flow"
          }
        });
      }

      writeState(state);
    },

    async listMaintenanceRecords() {
      requireActor(currentProfile);
      const state = readState();
      return buildMaintenanceWithAssets(state, state.maintenanceRecords).sort(
        (left, right) =>
          new Date(right.opened_at).getTime() - new Date(left.opened_at).getTime()
      );
    },

    async openMaintenance(input: OpenMaintenanceInput) {
      const actor = requireActor(currentProfile);
      const state = readState();
      const asset = getAssetOrThrow(state, input.asset_id);

      if (asset.status === "assigned") {
        throw new Error("Return the asset before sending it to maintenance.");
      }

      if (openMaintenanceForAsset(state, asset.id)) {
        throw new Error("This asset already has an open maintenance record.");
      }

      const record: MaintenanceRecord = {
        id: createId("maintenance"),
        asset_id: asset.id,
        issue_type: input.issue_type,
        notes: input.notes,
        vendor: input.vendor,
        cost: null,
        opened_at: nowIso(),
        closed_at: null,
        resolution: "",
        status: "open"
      };

      state.maintenanceRecords.unshift(record);
      asset.status = "maintenance";
      asset.updated_at = nowIso();
      logActivity(state, actor, {
        entity_type: "maintenance",
        entity_id: record.id,
        asset_id: asset.id,
        action: "maintenance_opened",
        message: `Opened maintenance for ${asset.asset_tag}.`,
        metadata: {
          asset_id: asset.id
        }
      });
      writeState(state);
    },

    async closeMaintenance(input: CloseMaintenanceInput) {
      const actor = requireActor(currentProfile);
      const state = readState();
      const record = getMaintenanceOrThrow(state, input.maintenance_id);

      if (record.status !== "open") {
        throw new Error("This maintenance record is already closed.");
      }

      const asset = getAssetOrThrow(state, record.asset_id);
      record.status = "closed";
      record.closed_at = nowIso();
      record.resolution = input.resolution;
      record.cost = input.cost;
      asset.status = "in_stock";
      asset.updated_at = nowIso();
      logActivity(state, actor, {
        entity_type: "maintenance",
        entity_id: record.id,
        asset_id: asset.id,
        action: "maintenance_closed",
        message: `Closed maintenance for ${asset.asset_tag}.`,
        metadata: {
          asset_id: asset.id
        }
      });
      writeState(state);
    },

    async uploadAssetDocument(assetId: string, file: File) {
      const actor = requireActor(currentProfile);
      const state = readState();
      const asset = getAssetOrThrow(state, assetId);
      const dataUrl = await toDataUrl(file);
      const document: AssetDocument = {
        id: createId("document"),
        asset_id: asset.id,
        name: file.name,
        content_type: file.type || "application/octet-stream",
        size: file.size,
        storage_path: `demo/${asset.id}/${file.name}`,
        url: dataUrl,
        uploaded_at: nowIso(),
        uploaded_by: actor.full_name
      };

      state.documents.unshift(document);
      logActivity(state, actor, {
        entity_type: "document",
        entity_id: document.id,
        asset_id: asset.id,
        action: "document_uploaded",
        message: `Uploaded document ${file.name} for ${asset.asset_tag}.`,
        metadata: {
          asset_id: asset.id,
          file_name: file.name
        }
      });
      writeState(state);
      return document;
    },

    async listProfiles() {
      requireAdmin(currentProfile);
      const state = readState();
      return state.profiles.map(profileWithoutPassword);
    },

    async inviteUser(input: InviteUserInput) {
      const actor = requireAdmin(currentProfile);
      const state = readState();
      const emailExists = state.profiles.some(
        (profile) => profile.email.toLowerCase() === input.email.toLowerCase()
      );
      if (emailExists) {
        throw new Error("User email already exists.");
      }

      state.profiles.unshift({
        id: createId("profile"),
        email: input.email,
        full_name: input.full_name,
        role: input.role,
        active: true,
        created_at: nowIso(),
        password: DEFAULT_PASSWORD
      });
      logActivity(state, actor, {
        entity_type: "user",
        entity_id: input.email,
        asset_id: null,
        action: "user_invited",
        message: `Invited ${input.email} as ${input.role}.`,
        metadata: { role: input.role }
      });
      writeState(state);
    },

    async updateUserRole(userId: string, role: Role) {
      const actor = requireAdmin(currentProfile);
      const state = readState();
      const profile = state.profiles.find((item) => item.id === userId);
      if (!profile) {
        throw new Error("User not found.");
      }

      profile.role = role;
      logActivity(state, actor, {
        entity_type: "user",
        entity_id: profile.id,
        asset_id: null,
        action: "role_updated",
        message: `Updated ${profile.email} to ${role}.`,
        metadata: { role }
      });
      writeState(state);
    }
  };
}
