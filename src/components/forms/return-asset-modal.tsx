import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AssignmentWithRelations, ReturnAssetInput } from "../../types/app";
import { assetConditions } from "../../types/app";
import { returnAssetSchema } from "../../lib/validations";
import { Button } from "../common/button";
import { Field, Select, Textarea } from "../common/fields";
import { Modal } from "../common/modal";

type ReturnFormValues = {
  assignment_id: string;
  return_condition: ReturnAssetInput["return_condition"];
  send_to_maintenance: boolean;
  return_notes: string;
};

export function ReturnAssetModal({
  open,
  onClose,
  assignment,
  onSubmit
}: {
  open: boolean;
  onClose: () => void;
  assignment?: AssignmentWithRelations | null;
  onSubmit: (input: ReturnAssetInput) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ReturnFormValues>({
    resolver: zodResolver(returnAssetSchema),
    defaultValues: {
      assignment_id: assignment?.id ?? "",
      return_condition: "good",
      send_to_maintenance: false,
      return_notes: ""
    }
  });

  useEffect(() => {
    reset({
      assignment_id: assignment?.id ?? "",
      return_condition: "good",
      send_to_maintenance: false,
      return_notes: ""
    });
  }, [assignment, reset, open]);

  return (
    <Modal
      open={open}
      title="Return Asset"
      description="Capture the condition at return and move the asset back to stock or maintenance."
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          onClose();
        })}
      >
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          {assignment ? (
            <>
              Returning <strong>{assignment.asset?.asset_tag}</strong> from{" "}
              <strong>{assignment.employee?.full_name}</strong>.
            </>
          ) : (
            "Select an active assignment first."
          )}
        </div>
        <Field label="Return Condition" error={errors.return_condition?.message}>
          <Select {...register("return_condition")}>
            {assetConditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </Select>
        </Field>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" {...register("send_to_maintenance")} />
          Send this asset to maintenance after return
        </label>
        <Field label="Return Notes" error={errors.return_notes?.message}>
          <Textarea {...register("return_notes")} placeholder="Condition details or missing accessory notes" />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !assignment}>
            {isSubmitting ? "Saving..." : "Complete Return"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
