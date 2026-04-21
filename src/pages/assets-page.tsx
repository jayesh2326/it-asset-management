import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Plus, RefreshCcw, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { EmptyState } from "../components/common/empty-state";
import { Input, Select } from "../components/common/fields";
import { PageHeader } from "../components/common/page-header";
import { AssetFormModal } from "../components/forms/asset-form-modal";
import { AssignAssetModal } from "../components/forms/assign-asset-modal";
import { OpenMaintenanceModal } from "../components/forms/maintenance-modals";
import { ReturnAssetModal } from "../components/forms/return-asset-modal";
import { DataTable } from "../components/tables/data-table";
import { downloadCsv } from "../lib/csv";
import { formatDate } from "../lib/date";
import { toAssetInput } from "../lib/entity-mappers";
import { queryKeys } from "../lib/query-keys";
import { useRepository } from "../hooks/use-repository";
import { useToast } from "../hooks/use-toast";
import type { Asset, AssignmentWithRelations } from "../types/app";

export function AssetsPage() {
  const repository = useRepository();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assigningAssetId, setAssigningAssetId] = useState<string | null>(null);
  const [returningAssignment, setReturningAssignment] =
    useState<AssignmentWithRelations | null>(null);
  const [maintenanceAssetId, setMaintenanceAssetId] = useState<string | null>(null);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: queryKeys.assets,
    queryFn: () => repository.listAssets()
  });
  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees,
    queryFn: () => repository.listEmployees()
  });
  const { data: assignments = [] } = useQuery({
    queryKey: queryKeys.assignments,
    queryFn: () => repository.listAssignments()
  });

  async function refreshLists() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.assets }),
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments }),
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    ]);
  }

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.createAsset>[0]) =>
      repository.createAsset(input),
    onSuccess: async () => {
      toast.success("Asset created");
      setCreateOpen(false);
      await refreshLists();
    },
    onError: (error) => {
      toast.error("Unable to create asset", error instanceof Error ? error.message : undefined);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ assetId, input }: { assetId: string; input: Parameters<typeof repository.updateAsset>[1] }) =>
      repository.updateAsset(assetId, input),
    onSuccess: async () => {
      toast.success("Asset updated");
      setEditingAsset(null);
      await refreshLists();
    },
    onError: (error) => {
      toast.error("Unable to update asset", error instanceof Error ? error.message : undefined);
    }
  });

  const archiveMutation = useMutation({
    mutationFn: (assetId: string) => repository.archiveAsset(assetId),
    onSuccess: async () => {
      toast.success("Asset archived");
      await refreshLists();
    },
    onError: (error) => {
      toast.error("Unable to archive asset", error instanceof Error ? error.message : undefined);
    }
  });

  const assignMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.assignAsset>[0]) =>
      repository.assignAsset(input),
    onSuccess: async () => {
      toast.success("Asset assigned");
      setAssigningAssetId(null);
      await refreshLists();
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
      setReturningAssignment(null);
      await refreshLists();
    },
    onError: (error) => {
      toast.error("Unable to return asset", error instanceof Error ? error.message : undefined);
    }
  });

  const maintenanceMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.openMaintenance>[0]) =>
      repository.openMaintenance(input),
    onSuccess: async () => {
      toast.success("Maintenance record opened");
      setMaintenanceAssetId(null);
      await refreshLists();
    },
    onError: (error) => {
      toast.error(
        "Unable to open maintenance",
        error instanceof Error ? error.message : undefined
      );
    }
  });

  const activeAssignmentsByAsset = useMemo(() => {
    const map = new Map<string, AssignmentWithRelations>();
    assignments
      .filter((assignment) => assignment.status === "active")
      .forEach((assignment) => {
        map.set(assignment.asset_id, assignment);
      });
    return map;
  }, [assignments]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesArchived = showArchived ? true : !asset.archived_at;
      const matchesStatus = statusFilter === "all" ? true : asset.status === statusFilter;
      const haystack = [
        asset.asset_tag,
        asset.name,
        asset.category,
        asset.brand,
        asset.model,
        asset.location
      ]
        .join(" ")
        .toLowerCase();
      return matchesArchived && matchesStatus && haystack.includes(search.trim().toLowerCase());
    });
  }, [assets, search, showArchived, statusFilter]);

  const assignableAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          !asset.archived_at &&
          asset.status === "in_stock" &&
          !activeAssignmentsByAsset.has(asset.id)
      ),
    [activeAssignmentsByAsset, assets]
  );

  const maintenanceAssets = useMemo(
    () => assets.filter((asset) => !asset.archived_at && asset.status === "in_stock"),
    [assets]
  );

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.status === "active" && !employee.archived_at),
    [employees]
  );

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading assets...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        description="Manage inventory, edit metadata, assign hardware, and keep every lifecycle change tracked."
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                downloadCsv(
                  "assets-export.csv",
                  ["Asset Tag", "Name", "Category", "Status", "Location", "Warranty"],
                  filteredAssets.map((asset) => [
                    asset.asset_tag,
                    asset.name,
                    asset.category,
                    asset.status,
                    asset.location,
                    asset.warranty_expiry ?? ""
                  ])
                )
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </>
        }
      />

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-[2fr_1fr_1fr_auto]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by tag, name, category, brand, or location"
        />
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="in_stock">In stock</option>
          <option value="assigned">Assigned</option>
          <option value="maintenance">Maintenance</option>
          <option value="retired">Retired</option>
          <option value="lost">Lost</option>
        </Select>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(event) => setShowArchived(event.target.checked)}
          />
          Show archived
        </label>
        <Button type="button" variant="ghost" onClick={() => void refreshLists()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <DataTable title="Inventory" subtitle={`${filteredAssets.length} assets in the current view`}>
        {filteredAssets.length ? (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Warranty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => {
                const activeAssignment = activeAssignmentsByAsset.get(asset.id);
                return (
                  <tr key={asset.id}>
                    <td>
                      <Link to={`/assets/${asset.id}`} className="font-semibold text-brand-700">
                        {asset.asset_tag}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">{asset.name}</p>
                    </td>
                    <td>{asset.category}</td>
                    <td>{asset.location}</td>
                    <td>
                      <Badge value={asset.status} />
                    </td>
                    <td>{activeAssignment?.employee?.full_name ?? "Available"}</td>
                    <td>{formatDate(asset.warranty_expiry)}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="ghost" className="px-3 py-1.5" onClick={() => setEditingAsset(asset)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-3 py-1.5"
                          onClick={() => setAssigningAssetId(asset.id)}
                          disabled={asset.status !== "in_stock" || !!asset.archived_at}
                        >
                          <ShieldCheck className="mr-1 h-4 w-4" />
                          Assign
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-3 py-1.5"
                          onClick={() => setReturningAssignment(activeAssignment ?? null)}
                          disabled={!activeAssignment}
                        >
                          <RefreshCcw className="mr-1 h-4 w-4" />
                          Return
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-3 py-1.5"
                          onClick={() => setMaintenanceAssetId(asset.id)}
                          disabled={asset.status !== "in_stock"}
                        >
                          <Wrench className="mr-1 h-4 w-4" />
                          Maintenance
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-3 py-1.5"
                          onClick={() => void archiveMutation.mutateAsync(asset.id)}
                          disabled={!!asset.archived_at || asset.status === "assigned"}
                        >
                          <FileText className="mr-1 h-4 w-4" />
                          Archive
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No assets match this view"
              description="Change your filters or add a new asset to populate the inventory table."
            />
          </div>
        )}
      </DataTable>

      <AssetFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Asset"
        onSubmit={(input) => createMutation.mutateAsync(input)}
      />

      <AssetFormModal
        open={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        title="Edit Asset"
        initialValues={editingAsset ? toAssetInput(editingAsset) : null}
        onSubmit={async (input) => {
          if (!editingAsset) {
            return;
          }
          await updateMutation.mutateAsync({ assetId: editingAsset.id, input });
        }}
      />

      <AssignAssetModal
        open={!!assigningAssetId}
        onClose={() => setAssigningAssetId(null)}
        assets={assignableAssets}
        employees={activeEmployees}
        defaultAssetId={assigningAssetId ?? undefined}
        onSubmit={(input) => assignMutation.mutateAsync(input)}
      />

      <ReturnAssetModal
        open={!!returningAssignment}
        onClose={() => setReturningAssignment(null)}
        assignment={returningAssignment}
        onSubmit={(input) => returnMutation.mutateAsync(input)}
      />

      <OpenMaintenanceModal
        open={!!maintenanceAssetId}
        onClose={() => setMaintenanceAssetId(null)}
        assets={maintenanceAssets}
        defaultAssetId={maintenanceAssetId ?? undefined}
        onSubmit={(input) => maintenanceMutation.mutateAsync(input)}
      />
    </div>
  );
}
