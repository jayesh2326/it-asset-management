import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw, UserMinus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Card } from "../components/common/card";
import { EmptyState } from "../components/common/empty-state";
import { PageHeader } from "../components/common/page-header";
import { EmployeeFormModal } from "../components/forms/employee-form-modal";
import { DataTable } from "../components/tables/data-table";
import { formatDate, formatDateTime } from "../lib/date";
import { toEmployeeInput } from "../lib/entity-mappers";
import { queryKeys } from "../lib/query-keys";
import { titleCase } from "../lib/utils";
import { useRepository } from "../hooks/use-repository";
import { useToast } from "../hooks/use-toast";

export function EmployeeDetailPage() {
  const { employeeId = "" } = useParams();
  const repository = useRepository();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.employee(employeeId),
    queryFn: () => repository.getEmployeeDetail(employeeId),
    enabled: !!employeeId
  });

  async function refreshDetail() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.employee(employeeId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.employees }),
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    ]);
  }

  const updateMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.updateEmployee>[1]) =>
      repository.updateEmployee(employeeId, input),
    onSuccess: async () => {
      toast.success("Employee updated");
      setEditOpen(false);
      await refreshDetail();
    },
    onError: (error) => {
      toast.error("Unable to update employee", error instanceof Error ? error.message : undefined);
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: () => repository.deactivateEmployee(employeeId),
    onSuccess: async () => {
      toast.success("Employee deactivated");
      await refreshDetail();
    },
    onError: (error) => {
      toast.error(
        "Unable to deactivate employee",
        error instanceof Error ? error.message : undefined
      );
    }
  });

  if (isLoading || !data) {
    return <div className="text-sm text-slate-500">Loading employee details...</div>;
  }

  const activeAssignments = data.assignments.filter((assignment) => assignment.status === "active");

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.employee.full_name}
        description="View employee metadata, assigned assets, and ownership history."
        actions={
          <>
            <Button type="button" variant="ghost" onClick={() => void refreshDetail()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => void deactivateMutation.mutateAsync()}
              disabled={data.employee.status !== "active"}
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Deactivate
            </Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Badge value={data.employee.status} />
          {data.employee.archived_at ? <Badge value="archived" /> : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Employee Code", data.employee.employee_code],
            ["Email", data.employee.email],
            ["Department", data.employee.department],
            ["Designation", data.employee.designation],
            ["Location", data.employee.location],
            ["Phone", data.employee.phone],
            ["Joined Record", formatDate(data.employee.created_at)],
            ["Active Assets", String(activeAssignments.length)]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Notes</p>
          <p className="mt-2 text-sm text-slate-600">
            {data.employee.notes || "No notes captured for this employee."}
          </p>
        </div>
      </Card>

      <DataTable title="Active Assets" subtitle="Assets currently issued to this employee">
        {activeAssignments.length ? (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Due</th>
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
                    <Badge value={assignment.asset?.status} />
                  </td>
                  <td>{formatDate(assignment.assigned_at)}</td>
                  <td>{formatDate(assignment.due_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No active assets"
              description="This employee currently has no issued assets."
            />
          </div>
        )}
      </DataTable>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DataTable title="Assignment History" subtitle="Past ownership and return records">
          {data.assignments.length ? (
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
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
                      <Link to={`/assets/${assignment.asset_id}`} className="font-semibold text-brand-700">
                        {assignment.asset?.asset_tag}
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
                description="This employee has no asset history yet."
              />
            </div>
          )}
        </DataTable>

        <DataTable title="Activity Timeline" subtitle="Employee-related asset actions">
          {data.activityLogs.length ? (
            <div className="divide-y divide-slate-200">
              {data.activityLogs.map((log) => (
                <div key={log.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">{log.message}</p>
                    <Badge value={log.entity_type} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {log.actor_name} · {formatDateTime(log.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                title="No activity yet"
                description="Assignments and ownership changes will appear here."
              />
            </div>
          )}
        </DataTable>
      </div>

      <EmployeeFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Employee"
        initialValues={toEmployeeInput(data.employee)}
        onSubmit={(input) => updateMutation.mutateAsync(input)}
      />
    </div>
  );
}
