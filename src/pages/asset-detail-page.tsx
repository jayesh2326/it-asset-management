import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, RefreshCcw, ShieldCheck, Trash2, Upload, Wrench } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Card } from "../components/common/card";
import { EmptyState } from "../components/common/empty-state";
import { PageHeader } from "../components/common/page-header";
import { AssetFormModal } from "../components/forms/asset-form-modal";
import { AssignAssetModal } from "../components/forms/assign-asset-modal";
import {
  CloseMaintenanceModal,
  OpenMaintenanceModal
} from "../components/forms/maintenance-modals";
import { ReturnAssetModal } from "../components/forms/return-asset-modal";
import { DataTable } from "../components/tables/data-table";
import { formatDate, formatDateTime } from "../lib/date";
import { toAssetInput } from "../lib/entity-mappers";
import { queryKeys } from "../lib/query-keys";
import { formatCurrency, titleCase } from "../lib/utils";
import { useRepository } from "../hooks/use-repository";
import { useToast } from "../hooks/use-toast";

export function AssetDetailPage() {
  const { assetId = "" } = useParams();
  const navigate = useNavigate();
  const repository = useRepository();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [closeMaintenanceOpen, setCloseMaintenanceOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.asset(assetId),
    queryFn: () => repository.getAssetDetail(assetId),
    enabled: !!assetId
  });
  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees,
    queryFn: () => repository.listEmployees()
  });

  async function refreshDetail() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.asset(assetId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.assets }),
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments }),
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    ]);
  }

  const updateMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.updateAsset>[1]) =>
      repository.updateAsset(assetId, input),
    onSuccess: async () => {
      toast.success("Asset updated");
      setEditOpen(false);
      await refreshDetail();
    },
    onError: (error) => {
      toast.error("Unable to update asset", error instanceof Error ? error.message : undefined);
    }
  });

  const assignMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.assignAsset>[0]) =>
      repository.assignAsset(input),
    onSuccess: async () => {
      toast.success("Asset assigned");
      setAssignOpen(false);
      await refreshDetail();
    },
    onError: (error) => {
      toast.error("Unable to assign asset", error instanceof Error ? error.message : undefined);
    }
  });

  const returnMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.returnAsset>[0]) =>
      repository.returnAsset(input),
    onSuccess: async () => {
      toast.success("Asset returned");
      setReturnOpen(false);
      await refreshDetail();
    },
    onError: (error) => {
      toast.error("Unable to return asset", error instanceof Error ? error.message : undefined);
    }
  });

  const openMaintenanceMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.openMaintenance>[0]) =>
      repository.openMaintenance(input),
    onSuccess: async () => {
      toast.success("Maintenance record opened");
      setMaintenanceOpen(false);
      await refreshDetail();
    },
    onError: (error) => {
      toast.error(
        "Unable to open maintenance",
        error instanceof Error ? error.message : undefined
      );
    }
  });

  const closeMaintenanceMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.closeMaintenance>[0]) =>
      repository.closeMaintenance(input),
    onSuccess: async () => {
      toast.success("Maintenance closed");
      setCloseMaintenanceOpen(false);
      await refreshDetail();
    },
    onError: (error) => {
      toast.error(
        "Unable to close maintenance",
        error instanceof Error ? error.message : undefined
      );
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => repository.uploadAssetDocument(assetId, file),
    onSuccess: async () => {
      toast.success("Document uploaded");
      await refreshDetail();
    },
    onError: (error) => {
      toast.error("Unable to upload document", error instanceof Error ? error.message : undefined);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => repository.deleteAsset(assetId),
    onSuccess: async () => {
      toast.success("Asset deleted");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.assets }),
        queryClient.invalidateQueries({ queryKey: queryKeys.assignments }),
        queryClient.invalidateQueries({ queryKey: queryKeys.maintenance }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      ]);
      navigate("/assets", { replace: true });
    },
    onError: (error) => {
      toast.error("Unable to delete asset", error instanceof Error ? error.message : undefined);
    }
  });

  if (isLoading || !data) {
    return <div className="text-sm text-slate-500">Loading asset details...</div>;
  }

  const { asset } = data;
  const currentAssignment = data.assignments.find((assignment) => assignment.status === "active");
  const openMaintenance = data.maintenanceRecords.find((record) => record.status === "open");
  const activeEmployees = employees.filter(
    (employee) => employee.status === "active" && !employee.archived_at
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${asset.asset_tag} - ${asset.name}`}
        description="View lifecycle metadata, ownership history, maintenance work, supporting documents, and activity logs."
        actions={
          <>
            <Button type="button" variant="ghost" onClick={() => void refreshDetail()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditOpen(true)}>
              Edit Asset
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (
                  window.confirm(
                    `Delete ${asset.asset_tag}? This permanently removes the asset and its related records.`
                  )
                ) {
                  void deleteMutation.mutateAsync();
                }
              }}
              disabled={!!currentAssignment || deleteMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button
              type="button"
              onClick={() => setAssignOpen(true)}
              disabled={asset.status !== "in_stock"}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Assign
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Badge value={asset.status} />
            <Badge value={asset.condition} />
            {asset.archived_at ? <Badge value="archived" /> : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Category", asset.category],
              ["Brand", asset.brand],
              ["Model", asset.model],
              ["Serial Number", asset.serial_number],
              ["Location", asset.location],
              ["Purchase Date", formatDate(asset.purchase_date)],
              ["Warranty Expiry", formatDate(asset.warranty_expiry)],
              ["Current Owner", currentAssignment?.employee?.full_name ?? "Available"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Notes</p>
            <p className="mt-2 text-sm text-slate-600">{asset.notes || "No notes captured."}</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-950">Current Lifecycle State</h2>
            {currentAssignment ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p>
                  Assigned to <strong>{currentAssignment.employee?.full_name}</strong> on{" "}
                  {formatDate(currentAssignment.assigned_at)}.
                </p>
                <p className="mt-2">Due date: {formatDate(currentAssignment.due_date)}</p>
                <Button type="button" className="mt-4" onClick={() => setReturnOpen(true)}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Return Asset
                </Button>
              </div>
            ) : openMaintenance ? (
              <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">
                <p>
                  Open maintenance for <strong>{openMaintenance.issue_type}</strong> with{" "}
                  {openMaintenance.vendor}.
                </p>
                <Button
                  type="button"
                  className="mt-4"
                  onClick={() => setCloseMaintenanceOpen(true)}
                >
                  Close Maintenance
                </Button>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-950">
                <p>This asset is available for assignment.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button type="button" onClick={() => setAssignOpen(true)}>
                    Assign Asset
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setMaintenanceOpen(true)}>
                    <Wrench className="mr-2 h-4 w-4" />
                    Send To Maintenance
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Documents</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Upload warranty cards, invoices, or repair paperwork.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
                <Upload className="mr-2 h-4 w-4" />
                Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadMutation.mutateAsync(file);
                    }
                  }}
                />
              </label>
            </div>

            {data.documents.length ? (
              <div className="mt-4 space-y-3">
                {data.documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{document.name}</p>
                      <p className="text-xs text-slate-500">
                        {document.uploaded_by} - {formatDateTime(document.uploaded_at)}
                      </p>
                    </div>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Open
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No documents uploaded yet.</p>
            )}
          </Card>
        </div>
      </div>

      <DataTable title="Assignment History" subtitle="Past and current handovers for this asset">
        {data.assignments.length ? (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Returned</th>
                <th>Condition</th>
              </tr>
            </thead>
            <tbody>
              {data.assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>
                    <Link
                      to={`/employees/${assignment.employee_id}`}
                      className="font-semibold text-brand-700"
                    >
                      {assignment.employee?.full_name}
                    </Link>
                  </td>
                  <td>
                    <Badge value={assignment.status} />
                  </td>
                  <td>{formatDate(assignment.assigned_at)}</td>
                  <td>{formatDate(assignment.returned_at)}</td>
                  <td>{titleCase(assignment.return_condition ?? assignment.assigned_condition)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No assignment history"
              description="This asset has not been handed over yet."
            />
          </div>
        )}
      </DataTable>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DataTable title="Maintenance History" subtitle="Repair and service work for this asset">
          {data.maintenanceRecords.length ? (
            <table>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Vendor</th>
                  <th>Opened</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {data.maintenanceRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.issue_type}</td>
                    <td>
                      <Badge value={record.status} />
                    </td>
                    <td>{record.vendor}</td>
                    <td>{formatDate(record.opened_at)}</td>
                    <td>{formatCurrency(record.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              <EmptyState
                title="No maintenance history"
                description="Repairs and inspections will be tracked here."
              />
            </div>
          )}
        </DataTable>

        <DataTable title="Activity Timeline" subtitle="Every logged action affecting this asset">
          {data.activityLogs.length ? (
            <div className="divide-y divide-slate-200">
              {data.activityLogs.map((log) => (
                <div key={log.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">{log.message}</p>
                    <Badge value={log.entity_type} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {log.actor_name} - {formatDateTime(log.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                title="No activity yet"
                description="Actions will appear here as the asset moves through its lifecycle."
              />
            </div>
          )}
        </DataTable>
      </div>

      <AssetFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Asset"
        initialValues={toAssetInput(asset)}
        onSubmit={(input) => updateMutation.mutateAsync(input)}
      />

      <AssignAssetModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        assets={[asset]}
        employees={activeEmployees}
        defaultAssetId={asset.id}
        onSubmit={(input) => assignMutation.mutateAsync(input)}
      />

      <ReturnAssetModal
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        assignment={currentAssignment ?? null}
        onSubmit={(input) => returnMutation.mutateAsync(input)}
      />

      <OpenMaintenanceModal
        open={maintenanceOpen}
        onClose={() => setMaintenanceOpen(false)}
        assets={[asset]}
        defaultAssetId={asset.id}
        onSubmit={(input) => openMaintenanceMutation.mutateAsync(input)}
      />

      <CloseMaintenanceModal
        open={closeMaintenanceOpen}
        onClose={() => setCloseMaintenanceOpen(false)}
        record={openMaintenance ? { ...openMaintenance, asset } : null}
        onSubmit={(input) => closeMaintenanceMutation.mutateAsync(input)}
      />
    </div>
  );
}
