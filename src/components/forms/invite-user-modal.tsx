import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { InviteUserInput } from "../../types/app";
import { inviteUserSchema } from "../../lib/validations";
import { Button } from "../common/button";
import { Field, Input, Select } from "../common/fields";
import { Modal } from "../common/modal";

export function InviteUserModal({
  open,
  onClose,
  onSubmit
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: InviteUserInput) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      full_name: "",
      role: "it_staff"
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        email: "",
        full_name: "",
        role: "it_staff"
      });
    }
  }, [open, reset]);

  return (
    <Modal
      open={open}
      title="Invite User"
      description="Create access for another IT team member."
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          onClose();
        })}
      >
        <Field label="Full Name" error={errors.full_name?.message}>
          <Input {...register("full_name")} placeholder="Priya Menon" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} placeholder="priya@company.com" />
        </Field>
        <Field label="Role" error={errors.role?.message}>
          <Select {...register("role")}>
            <option value="it_staff">IT Staff</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Inviting..." : "Invite User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
