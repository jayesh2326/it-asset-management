import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { EmptyState } from "../components/common/empty-state";
import { Input } from "../components/common/fields";
import { PageHeader } from "../components/common/page-header";
import {
  CloseMaintenanceModal,
  OpenMaintenanceModal
} from "../components/forms/maintenance-modals";
import { DataTable } from "../components/tables/data-table";
import { formatDate } from "../lib/date";
import { queryKeys } from "../lib/query-keys";
import { useRepository } from "../hooks/use-repository";
import { useToast } from "../hooks/use-toast";
import type { MaintenanceWithAsset } from "../types/app";

export function MaintenancePage() {
  const repository = useRepository();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [closingRecord, setClosingRecord] = useState<MaintenanceWithAsset | null>(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: queryKeys.maintenance,
    queryFn: () => repository.listMaintenanceRecords()
  });
  const { data: assets = [] } = useQuery({
    queryKey: queryKeys.assets,
    queryFn: () => repository.listAssets()
  });

  async function refreshLists() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance }),
      queryClient.invalidateQueries({ queryKey: queryKeys.assets }),
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    ]);
  }

  const openMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.openMaintenance>[0]) =>
      repository.openMaintenance(input),
    onSuccess: async () => {
      toast.success("Maintenance record opened");
      setOpenModal(false);
      await refreshLists();
    },
    onError: (error) => {
      toast.error(
        "Unable to open maintenance",
        error instanceof Error ? error.message : undefined
      );
    }
  });

  const closeMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.closeMaintenance>[0]) =>
      repository.closeMaintenance(input),
    onSuccess: async () => {
      toast.success("Maintenance closed");
      setClosingRecord(null);
      await refreshLists();
    },
    onError: (error) => {
      toast.error(
        "Unable to close maintenance",
        error instanceof Error ? error.message : undefined
      );
    }
  });

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const haystack = [
        record.asset?.asset_tag,
        record.asset?.name,
        record.issue_type,
        record.vendor
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [records, search]);

  const openRecords = filtered.filter((record) => record.status === "open");
  const closedRecords = filtered.filter((record) => record.status === "closed");

  const maintenanceAssets = assets.filter(
    (asset) => !asset.archived_at && asset.status === "in_stock"
  );

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading maintenance...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description="Track assets under repair, vendor work, resolutions, and costs."
        actions={
          <Button type="button" onClick={() => setOpenModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Open Maintenance
          </Button>
        }
      />

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by asset, issue, or vendor"
        />
        <Button type="button" variant="ghost" onClick={() => void refreshLists()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <DataTable title="Open Queue" subtitle={`${openRecords.length} assets currently under maintenance`}>
        {openRecords.length ? (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Issue</th>
                <th>Vendor</th>
                <th>Opened</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {openRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <Link to={`/assets/${record.asset_id}`} className="font-semibold text-brand-700">
                      {record.asset?.asset_tag}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{record.asset?.name}</p>
                  </td>
                  <td>{record.issue_type}</td>
                  <td>{record.vendor}</td>
                  <td>{formatDate(record.opened_at)}</td>
                  <td>
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-3 py-1.5"
                      onClick={() => setClosingRecord(record)}
                    >
                      Close
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No open maintenance"
              description="Open maintenance records will appear here."
            />
          </div>
        )}
      </DataTable>

      <DataTable title="Completed Work" subtitle={`${closedRecords.length} closed maintenance records`}>
        {closedRecords.length ? (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Opened</th>
                <th>Closed</th>
              </tr>
            </thead>
            <tbody>
              {closedRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <Link to={`/assets/${record.asset_id}`} className="font-semibold text-brand-700">
                      {record.asset?.asset_tag}
                    </Link>
                  </td>
                  <td>{record.issue_type}</td>
                  <td>
                    <Badge value={record.status} />
                  </td>
                  <td>{formatDate(record.opened_at)}</td>
                  <td>{formatDate(record.closed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No completed work yet"
              description="Closed maintenance records will build your repair history here."
            />
          </div>
        )}
      </DataTable>

      <OpenMaintenanceModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        assets={maintenanceAssets}
        onSubmit={(input) => openMutation.mutateAsync(input)}
      />

      <CloseMaintenanceModal
        open={!!closingRecord}
        onClose={() => setClosingRecord(null)}
        record={closingRecord}
        onSubmit={(input) => closeMutation.mutateAsync(input)}
      />
    </div>
  );
}
