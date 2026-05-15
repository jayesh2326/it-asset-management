import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { EmptyState } from "../components/common/empty-state";
import { Input } from "../components/common/fields";
import { PageHeader } from "../components/common/page-header";
import { AssignAssetModal } from "../components/forms/assign-asset-modal";
import { ReturnAssetModal } from "../components/forms/return-asset-modal";
import { DataTable } from "../components/tables/data-table";
import { formatDate } from "../lib/date";
import { queryKeys } from "../lib/query-keys";
import { useRepository } from "../hooks/use-repository";
import { useToast } from "../hooks/use-toast";
import type { AssignmentWithRelations } from "../types/app";

export function AssignmentsPage() {
  const repository = useRepository();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [returningAssignment, setReturningAssignment] =
    useState<AssignmentWithRelations | null>(null);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: queryKeys.assignments,
    queryFn: () => repository.listAssignments()
  });
  const { data: assets = [] } = useQuery({
    queryKey: queryKeys.assets,
    queryFn: () => repository.listAssets()
  });
  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees,
    queryFn: () => repository.listEmployees()
  });

  async function refreshLists() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments }),
      queryClient.invalidateQueries({ queryKey: queryKeys.assets }),
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    ]);
  }

  const assignMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.assignAsset>[0]) =>
      repository.assignAsset(input),
    onSuccess: async () => {
      toast.success("Asset assigned");
      setAssignOpen(false);
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

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const haystack = [
        assignment.asset?.asset_tag,
        assignment.asset?.name,
        assignment.employee?.full_name,
        assignment.employee?.department
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [assignments, search]);

  const activeAssignments = filteredAssignments.filter(
    (assignment) => assignment.status === "active"
  );
  const historyAssignments = filteredAssignments.filter(
    (assignment) => assignment.status === "returned"
  );

  const assignableAssets = assets.filter(
    (asset) => !asset.archived_at && asset.status === "in_stock"
  );
  const activeEmployees = employees.filter(
    (employee) => employee.status === "active" && !employee.archived_at
  );

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading assignments...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Track who has what, when it was issued, when it is due back, and when it returns."
        actions={
          <Button type="button" onClick={() => setAssignOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        }
      />

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by asset tag, asset name, employee, or department"
        />
        <Button type="button" variant="ghost" onClick={() => void refreshLists()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <DataTable title="Active Assignments" subtitle={`${activeAssignments.length} active handovers`}>
        {activeAssignments.length ? (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Employee</th>
                <th>Assigned</th>
                <th>Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>
                    <Link to={`/assets/${assignment.asset_id}`} className="font-semibold text-brand-700">
                      {assignment.asset?.asset_tag}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{assignment.asset?.name}</p>
                  </td>
                  <td>
                    <Link
                      to={`/employees/${assignment.employee_id}`}
                      className="font-semibold text-brand-700"
                    >
                      {assignment.employee?.full_name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                      {assignment.employee?.department}
                    </p>
                  </td>
                  <td>{formatDate(assignment.assigned_at)}</td>
                  <td>{formatDate(assignment.due_date)}</td>
                  <td>
                    <Badge value={assignment.status} />
                  </td>
                  <td>
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-3 py-1.5"
                      onClick={() => setReturningAssignment(assignment)}
                    >
                      Return
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No active assignments"
              description="Assign an asset to start tracking ownership here."
            />
          </div>
        )}
      </DataTable>

      <DataTable title="Return History" subtitle={`${historyAssignments.length} completed returns`}>
        {historyAssignments.length ? (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Employee</th>
                <th>Assigned</th>
                <th>Returned</th>
                <th>Condition</th>
              </tr>
            </thead>
            <tbody>
              {historyAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>
                    <Link to={`/assets/${assignment.asset_id}`} className="font-semibold text-brand-700">
                      {assignment.asset?.asset_tag}
                    </Link>
                  </td>
                  <td>{assignment.employee?.full_name}</td>
                  <td>{formatDate(assignment.assigned_at)}</td>
                  <td>{formatDate(assignment.returned_at)}</td>
                  <td>{assignment.return_condition ?? assignment.assigned_condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No return history"
              description="Returned assets will appear here once they are checked back in."
            />
          </div>
        )}
      </DataTable>

      <AssignAssetModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        assets={assignableAssets}
        employees={activeEmployees}
        onSubmit={(input) => assignMutation.mutateAsync(input)}
      />

      <ReturnAssetModal
        open={!!returningAssignment}
        onClose={() => setReturningAssignment(null)}
        assignment={returningAssignment}
        onSubmit={(input) => returnMutation.mutateAsync(input)}
      />
    </div>
  );
}
