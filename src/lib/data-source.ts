import { buildDashboardSummary } from "./metrics";
import { supabase } from "./supabase";
import type { Repository } from "./repository";
import type {
  ActivityEntity,
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
  MaintenanceRecord,
  MaintenanceWithAsset,
  OpenMaintenanceInput,
  Profile,
  ReturnAssetInput
} from "../types/app";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

function mapAssignmentsWithRelations(
  assignments: AssetAssignment[],
  assets: Asset[],
  employees: Employee[]
): AssignmentWithRelations[] {
  return assignments.map((assignment) => ({
    ...assignment,
    asset: assets.find((asset) => asset.id === assignment.asset_id),
    employee: employees.find((employee) => employee.id === assignment.employee_id)
  }));
}

function mapMaintenanceWithAsset(records: MaintenanceRecord[], assets: Asset[]) {
  return records.map((record) => ({
    ...record,
    asset: assets.find((asset) => asset.id === record.asset_id)
  }));
}

async function createSignedDocuments(documents: AssetDocument[]) {
  const client = requireSupabase();
  return Promise.all(
    documents.map(async (document) => {
      if (!document.storage_path) {
        return document;
      }

      const { data } = await client.storage
        .from("asset-files")
        .createSignedUrl(document.storage_path, 60 * 60);

      return {
        ...document,
        url: data?.signedUrl ?? document.url
      };
    })
  );
}

function handleError(error: unknown): never {
  if (error instanceof Error) {
    throw error;
  }
  if (typeof error === "string") {
    throw new Error(error);
  }

  throw new Error("Unexpected error.");
}

async function insertActivityLog(
  currentProfile: Profile | null,
  entry: {
    entity_type: ActivityEntity;
    entity_id: string;
    asset_id: string | null;
    action: string;
    message: string;
    metadata?: Record<string, unknown>;
  }
) {
  const client = requireSupabase();
  const { error } = await client.from("activity_logs").insert({
    ...entry,
    metadata: entry.metadata ?? {},
    actor_id: currentProfile?.id ?? null,
    actor_name: currentProfile?.full_name ?? "System",
    actor_email: currentProfile?.email ?? ""
  });

  if (error) {
    handleError(error);
  }
}

function createSupabaseRepository(currentProfile: Profile | null): Repository {
  const repository: Repository = {
    async getDashboardSummary(): Promise<DashboardSummary> {
      const [assets, employees, assignments, maintenance] = await Promise.all([
        repository.listAssets(),
        repository.listEmployees(),
        repository.listAssignments(),
        repository.listMaintenanceRecords()
      ]);
      return buildDashboardSummary(assets, employees, assignments, maintenance);
    },

    async listAssets() {
      const client = requireSupabase();
      const { data, error } = await client
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        handleError(error);
      }

      return (data ?? []) as Asset[];
    },

    async getAssetDetail(assetId: string): Promise<AssetDetail> {
      const client = requireSupabase();
      const [
        { data: asset, error: assetError },
        { data: assignments },
        { data: maintenance },
        { data: documents },
        { data: logs },
        { data: employees }
      ] = await Promise.all([
        client.from("assets").select("*").eq("id", assetId).single(),
        client
          .from("asset_assignments")
          .select("*")
          .eq("asset_id", assetId)
          .order("assigned_at", { ascending: false }),
        client
          .from("maintenance_records")
          .select("*")
          .eq("asset_id", assetId)
          .order("opened_at", { ascending: false }),
        client
          .from("asset_documents")
          .select("*")
          .eq("asset_id", assetId)
          .order("uploaded_at", { ascending: false }),
        client
          .from("activity_logs")
          .select("*")
          .eq("asset_id", assetId)
          .order("created_at", { ascending: false }),
        client.from("employees").select("*")
      ]);

      if (assetError || !asset) {
        handleError(assetError ?? "Asset not found.");
      }

      return {
        asset: asset as Asset,
        assignments: mapAssignmentsWithRelations(
          (assignments ?? []) as AssetAssignment[],
          [asset as Asset],
          (employees ?? []) as Employee[]
        ),
        maintenanceRecords: (maintenance ?? []) as MaintenanceRecord[],
        documents: await createSignedDocuments((documents ?? []) as AssetDocument[]),
        activityLogs: (logs ?? []) as AssetDetail["activityLogs"]
      };
    },

    async createAsset(input: AssetInput) {
      const client = requireSupabase();
      const { data, error } = await client
        .from("assets")
        .insert(input)
        .select("*")
        .single();

      if (error || !data) {
        handleError(error ?? "Unable to create asset.");
      }

      await insertActivityLog(currentProfile, {
        entity_type: "asset",
        entity_id: data.id,
        asset_id: data.id,
        action: "asset_created",
        message: `Created asset ${data.asset_tag}.`,
        metadata: {
          asset_tag: data.asset_tag
        }
      });
      return data as Asset;
    },

    async updateAsset(assetId: string, input: AssetInput) {
      const client = requireSupabase();
      const { data, error } = await client
        .from("assets")
        .update(input)
        .eq("id", assetId)
        .select("*")
        .single();

      if (error || !data) {
        handleError(error ?? "Unable to update asset.");
      }

      await insertActivityLog(currentProfile, {
        entity_type: "asset",
        entity_id: data.id,
        asset_id: data.id,
        action: "asset_updated",
        message: `Updated asset ${data.asset_tag}.`,
        metadata: {
          asset_tag: data.asset_tag
        }
      });
      return data as Asset;
    },

    async archiveAsset(assetId: string) {
      const client = requireSupabase();
      const { error } = await client.rpc("archive_asset", {
        p_asset_id: assetId
      });

      if (error) {
        handleError(error);
      }
    },

    async listEmployees() {
      const client = requireSupabase();
      const { data, error } = await client
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        handleError(error);
      }

      return (data ?? []) as Employee[];
    },

    async getEmployeeDetail(employeeId: string): Promise<EmployeeDetail> {
      const client = requireSupabase();
      const [
        { data: employee, error: employeeError },
        { data: assignments },
        { data: assets },
        { data: logs }
      ] = await Promise.all([
        client.from("employees").select("*").eq("id", employeeId).single(),
        client
          .from("asset_assignments")
          .select("*")
          .eq("employee_id", employeeId)
          .order("assigned_at", { ascending: false }),
        client.from("assets").select("*"),
        client
          .from("activity_logs")
          .select("*")
          .eq("entity_id", employeeId)
          .order("created_at", { ascending: false })
      ]);

      if (employeeError || !employee) {
        handleError(employeeError ?? "Employee not found.");
      }

      return {
        employee: employee as Employee,
        assignments: mapAssignmentsWithRelations(
          (assignments ?? []) as AssetAssignment[],
          (assets ?? []) as Asset[],
          [employee as Employee]
        ),
        activityLogs: (logs ?? []) as EmployeeDetail["activityLogs"]
      };
    },

    async createEmployee(input: EmployeeInput) {
      const client = requireSupabase();
      const { data, error } = await client
        .from("employees")
        .insert({
          ...input,
          archived_at: input.status === "inactive" ? new Date().toISOString() : null
        })
        .select("*")
        .single();

      if (error || !data) {
        handleError(error ?? "Unable to create employee.");
      }

      await insertActivityLog(currentProfile, {
        entity_type: "employee",
        entity_id: data.id,
        asset_id: null,
        action: "employee_created",
        message: `Created employee ${data.full_name}.`,
        metadata: {
          employee_id: data.id
        }
      });
      return data as Employee;
    },

    async updateEmployee(employeeId: string, input: EmployeeInput) {
      const client = requireSupabase();
      const { data, error } = await client
        .from("employees")
        .update({
          ...input,
          archived_at: input.status === "inactive" ? new Date().toISOString() : null
        })
        .eq("id", employeeId)
        .select("*")
        .single();

      if (error || !data) {
        handleError(error ?? "Unable to update employee.");
      }

      await insertActivityLog(currentProfile, {
        entity_type: "employee",
        entity_id: data.id,
        asset_id: null,
        action: "employee_updated",
        message: `Updated employee ${data.full_name}.`,
        metadata: {
          employee_id: data.id
        }
      });
      return data as Employee;
    },

    async deactivateEmployee(employeeId: string) {
      const client = requireSupabase();
      const { data: activeAssignments, error: assignmentError } = await client
        .from("asset_assignments")
        .select("id")
        .eq("employee_id", employeeId)
        .eq("status", "active");

      if (assignmentError) {
        handleError(assignmentError);
      }

      if ((activeAssignments ?? []).length > 0) {
        throw new Error("Return or reassign active assets before deactivating the employee.");
      }

      const { error } = await client
        .from("employees")
        .update({
          status: "inactive",
          archived_at: new Date().toISOString()
        })
        .eq("id", employeeId);

      if (error) {
        handleError(error);
      }

      await insertActivityLog(currentProfile, {
        entity_type: "employee",
        entity_id: employeeId,
        asset_id: null,
        action: "employee_deactivated",
        message: "Deactivated employee record.",
        metadata: {
          employee_id: employeeId
        }
      });
    },

    async listAssignments() {
      const client = requireSupabase();
      const [{ data: assignments, error }, { data: assets }, { data: employees }] =
        await Promise.all([
          client
            .from("asset_assignments")
            .select("*")
            .order("assigned_at", { ascending: false }),
          client.from("assets").select("*"),
          client.from("employees").select("*")
        ]);

      if (error) {
        handleError(error);
      }

      return mapAssignmentsWithRelations(
        (assignments ?? []) as AssetAssignment[],
        (assets ?? []) as Asset[],
        (employees ?? []) as Employee[]
      );
    },

    async assignAsset(input: AssignAssetInput) {
      const client = requireSupabase();
      const { error } = await client.rpc("assign_asset", {
        p_asset_id: input.asset_id,
        p_employee_id: input.employee_id,
        p_due_date: input.due_date || null,
        p_notes: input.notes || null
      });

      if (error) {
        handleError(error);
      }
    },

    async returnAsset(input: ReturnAssetInput) {
      const client = requireSupabase();
      const { error } = await client.rpc("return_asset", {
        p_assignment_id: input.assignment_id,
        p_return_condition: input.return_condition,
        p_send_to_maintenance: input.send_to_maintenance,
        p_return_notes: input.return_notes || null
      });

      if (error) {
        handleError(error);
      }
    },

    async listMaintenanceRecords() {
      const client = requireSupabase();
      const [{ data: records, error }, { data: assets }] = await Promise.all([
        client
          .from("maintenance_records")
          .select("*")
          .order("opened_at", { ascending: false }),
        client.from("assets").select("*")
      ]);

      if (error) {
        handleError(error);
      }

      return mapMaintenanceWithAsset(
        (records ?? []) as MaintenanceRecord[],
        (assets ?? []) as Asset[]
      );
    },

    async openMaintenance(input: OpenMaintenanceInput) {
      const client = requireSupabase();
      const { error } = await client.rpc("open_maintenance", {
        p_asset_id: input.asset_id,
        p_issue_type: input.issue_type,
        p_notes: input.notes,
        p_vendor: input.vendor
      });

      if (error) {
        handleError(error);
      }
    },

    async closeMaintenance(input: CloseMaintenanceInput) {
      const client = requireSupabase();
      const { error } = await client.rpc("close_maintenance", {
        p_maintenance_id: input.maintenance_id,
        p_resolution: input.resolution,
        p_cost: input.cost
      });

      if (error) {
        handleError(error);
      }
    },

    async uploadAssetDocument(assetId: string, file: File) {
      const client = requireSupabase();
      const storagePath = `${assetId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await client.storage
        .from("asset-files")
        .upload(storagePath, file, { upsert: false });

      if (uploadError) {
        handleError(uploadError);
      }

      const { data, error } = await client
        .from("asset_documents")
        .insert({
          asset_id: assetId,
          name: file.name,
          content_type: file.type || "application/octet-stream",
          size: file.size,
          storage_path: storagePath,
          url: ""
        })
        .select("*")
        .single();

      if (error || !data) {
        handleError(error ?? "Unable to store document metadata.");
      }

      await insertActivityLog(currentProfile, {
        entity_type: "document",
        entity_id: data.id,
        asset_id: assetId,
        action: "document_uploaded",
        message: `Uploaded document ${data.name}.`,
        metadata: {
          asset_id: assetId,
          file_name: data.name
        }
      });
      const [document] = await createSignedDocuments([data as AssetDocument]);
      return document;
    },

    async listProfiles() {
      if (currentProfile?.role !== "admin") {
        throw new Error("Only admins can access this action.");
      }

      const client = requireSupabase();
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        handleError(error);
      }

      return (data ?? []) as Profile[];
    },

    async inviteUser(input: InviteUserInput) {
      if (currentProfile?.role !== "admin") {
        throw new Error("Only admins can invite users.");
      }

      const client = requireSupabase();
      const { error } = await client.functions.invoke("admin-invite-user", {
        body: input
      });

      if (error) {
        handleError(error);
      }
    },

    async updateUserRole(userId: string, role: Profile["role"]) {
      if (currentProfile?.role !== "admin") {
        throw new Error("Only admins can update roles.");
      }

      const client = requireSupabase();
      const { error } = await client.functions.invoke("admin-update-user-role", {
        body: { userId, role }
      });

      if (error) {
        handleError(error);
      }
    }
  };

  return repository;
}

export function createRepository(currentProfile: Profile | null): Repository {
  return createSupabaseRepository(currentProfile);
}
