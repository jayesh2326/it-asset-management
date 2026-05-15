import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Plus, RefreshCcw, Shield } from "lucide-react";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Card } from "../components/common/card";
import { EmptyState } from "../components/common/empty-state";
import { PageHeader } from "../components/common/page-header";
import { InviteUserModal } from "../components/forms/invite-user-modal";
import { DataTable } from "../components/tables/data-table";
import { formatDate } from "../lib/date";
import { queryKeys } from "../lib/query-keys";
import { useRepository } from "../hooks/use-repository";
import { useToast } from "../hooks/use-toast";

export function UsersPage() {
  const repository = useRepository();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: queryKeys.profiles,
    queryFn: () => repository.listProfiles()
  });

  async function refreshLists() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.profiles });
  }

  const inviteMutation = useMutation({
    mutationFn: (input: Parameters<typeof repository.inviteUser>[0]) =>
      repository.inviteUser(input),
    onSuccess: async () => {
      toast.success("User invited");
      setInviteOpen(false);
      await refreshLists();
    },
    onError: (error) => {
      toast.error("Unable to invite user", error instanceof Error ? error.message : undefined);
    }
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "admin" | "it_staff" }) =>
      repository.updateUserRole(userId, role),
    onSuccess: async () => {
      toast.success("Role updated");
      await refreshLists();
    },
    onError: (error) => {
      toast.error("Unable to update role", error instanceof Error ? error.message : undefined);
    }
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading user access...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Access"
        description="Invite IT teammates and control which users have full administrative access."
        actions={
          <>
            <Button type="button" variant="ghost" onClick={() => void refreshLists()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button type="button" onClick={() => setInviteOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </>
        }
      />


      <DataTable title="Access Directory" subtitle={`${profiles.length} users with application access`}>
        {profiles.length ? (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td>
                    <p className="font-semibold text-slate-900">{profile.full_name}</p>
                    <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
                  </td>
                  <td>
                    <Badge value={profile.role} />
                  </td>
                  <td>
                    <Badge value={profile.active ? "active" : "inactive"} />
                  </td>
                  <td>{formatDate(profile.created_at)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-3 py-1.5"
                        onClick={() =>
                          void roleMutation.mutateAsync({
                            userId: profile.id,
                            role: profile.role === "admin" ? "it_staff" : "admin"
                          })
                        }
                      >
                        <Shield className="mr-1 h-4 w-4" />
                        Make {profile.role === "admin" ? "IT Staff" : "Admin"}
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
              title="No users found"
              description="Invite your first admin or IT staff member to get started."
            />
          </div>
        )}
      </DataTable>

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSubmit={(input) => inviteMutation.mutateAsync(input)}
      />
    </div>
  );
}
