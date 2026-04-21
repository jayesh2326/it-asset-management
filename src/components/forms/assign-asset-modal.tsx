import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Asset, AssignAssetInput, Employee } from "../../types/app";
import { assignAssetSchema } from "../../lib/validations";
import { Button } from "../common/button";
import { Field, Select, Textarea, Input } from "../common/fields";
import { Modal } from "../common/modal";

type AssignFormValues = {
  asset_id: string;
  employee_id: string;
  due_date: string;
  notes: string;
};

export function AssignAssetModal({
  open,
  onClose,
  assets,
  employees,
  defaultAssetId,
  onSubmit
}: {
  open: boolean;
  onClose: () => void;
  assets: Asset[];
  employees: Employee[];
  defaultAssetId?: string;
  onSubmit: (input: AssignAssetInput) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AssignFormValues>({
    resolver: zodResolver(assignAssetSchema),
    defaultValues: {
      asset_id: defaultAssetId ?? "",
      employee_id: "",
      due_date: "",
      notes: ""
    }
  });

  useEffect(() => {
    reset({
      asset_id: defaultAssetId ?? "",
      employee_id: "",
      due_date: "",
      notes: ""
    });
  }, [defaultAssetId, open, reset]);

  return (
    <Modal
      open={open}
      title="Assign Asset"
      description="Create a tracked handover with due date and assignment notes."
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            ...values,
            due_date: values.due_date || null
          });
          onClose();
        })}
      >
        <Field label="Asset" error={errors.asset_id?.message}>
          <Select {...register("asset_id")}>
            <option value="">Select an asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.asset_tag} - {asset.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Employee" error={errors.employee_id?.message}>
          <Select {...register("employee_id")}>
            <option value="">Select an employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name} - {employee.department}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Due Date" error={errors.due_date?.message}>
          <Input type="date" {...register("due_date")} />
        </Field>
        <Field label="Notes" error={errors.notes?.message}>
          <Textarea {...register("notes")} placeholder="Assignment purpose or handover notes" />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign Asset"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
