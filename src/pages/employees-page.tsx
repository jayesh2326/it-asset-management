import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCcw, UserMinus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { EmptyState } from "../components/common/empty-state";
import { Input, Select } from "../components/common/fields";
import { PageHeader } from "../components/common/page-header";
import { EmployeeFormModal } from "../components/forms/employee-form-modal";
import { DataTable } from "../components/tables/data-table";
import { formatDate } from "../lib/date";
import { toEmployeeInput } from "../lib/entity-mappers";
import { queryKeys } from "../lib/query-keys";
import { useRepository } from "../hooks/use-repository";
import { useToast } from "../hooks/use-toast";
import type { Employee } from "../types/app";

export function EmployeesPage() {
  const repository = useRepository();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: queryKeys.employees,
    queryFn: () => repository.listEmployees()
  });
  const { data: assignments = [] } = useQuery({
    queryKey: queryKeys.assignments,
    queryFn: () => repository.listAssignments()
  });

  const activeAssignmentCounts = useMemo(() => {
    const map = new Map<string, number>();
    assignments
      .filter((assignment) => assignment.status === "active")
      .forEach((assignment) => {
        map.set(assignment.employee_id, (map.get(assignment.employee_id) ?? 0) + 1);
      });
    return map;
  }, [assignments]);

  async function refreshLists() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.employees }),
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    ]);
  }

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.createEmployee>[0]) =>
      repository.createEmployee(input),
    onSuccess: async () => {
      toast.success("Employee created");
      setCreateOpen(false);
      await refreshLists();
    },
    onError: (error) => {
      toast.error("Unable to create employee", error instanceof Error ? error.message : undefined);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ employeeId, input }: { employeeId: string; input: Parameters<typeof repository.updateEmployee>[1] }) =>
      repository.updateEmployee(employeeId, input),
    onSuccess: async () => {
      toast.success("Employee updated");
      setEditingEmployee(null);
      await refreshLists();
    },
    onError: (error) => {
      toast.error("Unable to update employee", error instanceof Error ? error.message : undefined);
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: (employeeId: string) => repository.deactivateEmployee(employeeId),
    onSuccess: async () => {
      toast.success("Employee deactivated");
      await refreshLists();
    },
    onError: (error) => {
      toast.error(
        "Unable to deactivate employee",
        error instanceof Error ? error.message : undefined
      );
    }
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "archived"
            ? !!employee.archived_at
            : employee.status === statusFilter;
      const haystack = [
        employee.employee_code,
        employee.full_name,
        employee.email,
        employee.department,
        employee.designation
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && haystack.includes(search.trim().toLowerCase());
    });
  }, [employees, search, statusFilter]);

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading employees...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Keep the employee directory aligned with active ownership and equipment history."
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        }
      />

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-[2fr_1fr_auto]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, code, department, designation, or email"
        />
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All employees</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </Select>
        <Button type="button" variant="ghost" onClick={() => void refreshLists()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <DataTable title="Directory" subtitle={`${filteredEmployees.length} employees in the current view`}>
        {filteredEmployees.length ? (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Status</th>
                <th>Active Assets</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <Link to={`/employees/${employee.id}`} className="font-semibold text-brand-700">
                      {employee.full_name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                      {employee.employee_code} · {employee.email}
                    </p>
                  </td>
                  <td>
                    {employee.department}
                    <p className="mt-1 text-sm text-slate-500">{employee.designation}</p>
                  </td>
                  <td>
                    <Badge value={employee.status} />
                  </td>
                  <td>{activeAssignmentCounts.get(employee.id) ?? 0}</td>
                  <td>{formatDate(employee.created_at)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-3 py-1.5"
                        onClick={() => setEditingEmployee(employee)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-3 py-1.5"
                        onClick={() => void deactivateMutation.mutateAsync(employee.id)}
                        disabled={employee.status !== "active"}
                      >
                        <UserMinus className="mr-1 h-4 w-4" />
                        Deactivate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No employees match this view"
              description="Adjust your filters or add a new employee record."
            />
          </div>
        )}
      </DataTable>

      <EmployeeFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Employee"
        onSubmit={(input) => createMutation.mutateAsync(input)}
      />

      <EmployeeFormModal
        open={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        title="Edit Employee"
        initialValues={editingEmployee ? toEmployeeInput(editingEmployee) : null}
        onSubmit={async (input) => {
          if (!editingEmployee) {
            return;
          }
          await updateMutation.mutateAsync({
            employeeId: editingEmployee.id,
            input
          });
        }}
      />
    </div>
  );
}
