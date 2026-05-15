import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Asset,
  CloseMaintenanceInput,
  MaintenanceWithAsset,
  OpenMaintenanceInput
} from "../../types/app";
import { maintenanceCloseSchema, maintenanceOpenSchema } from "../../lib/validations";
import { Button } from "../common/button";
import { Field, Input, Select, Textarea } from "../common/fields";
import { Modal } from "../common/modal";

type OpenFormValues = OpenMaintenanceInput;
type CloseFormValues = {
  maintenance_id: string;
  resolution: string;
  cost: string;
};

export function OpenMaintenanceModal({
  open,
  onClose,
  assets,
  defaultAssetId,
  onSubmit
}: {
  open: boolean;
  onClose: () => void;
  assets: Asset[];
  defaultAssetId?: string;
  onSubmit: (input: OpenMaintenanceInput) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<OpenFormValues>({
    resolver: zodResolver(maintenanceOpenSchema),
    defaultValues: {
      asset_id: defaultAssetId ?? "",
      issue_type: "",
      notes: "",
      vendor: ""
    }
  });

  useEffect(() => {
    reset({
      asset_id: defaultAssetId ?? "",
      issue_type: "",
      notes: "",
      vendor: ""
    });
  }, [defaultAssetId, reset, open]);

  return (
    <Modal
      open={open}
      title="Open Maintenance"
      description="Create a maintenance record and move the asset into a non-assignable state."
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
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
        <Field label="Issue Type" error={errors.issue_type?.message}>
          <Input {...register("issue_type")} placeholder="Battery issue" />
        </Field>
        <Field label="Vendor" error={errors.vendor?.message}>
          <Input {...register("vendor")} placeholder="Internal IT or vendor name" />
        </Field>
        <Field label="Notes" error={errors.notes?.message}>
          <Textarea {...register("notes")} placeholder="Describe the issue and troubleshooting context" />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Open Maintenance"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function CloseMaintenanceModal({
  open,
  onClose,
  record,
  onSubmit
}: {
  open: boolean;
  onClose: () => void;
  record?: MaintenanceWithAsset | null;
  onSubmit: (input: CloseMaintenanceInput) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CloseFormValues>({
    resolver: zodResolver(maintenanceCloseSchema),
    defaultValues: {
      maintenance_id: record?.id ?? "",
      resolution: "",
      cost: ""
    }
  });

  useEffect(() => {
    reset({
      maintenance_id: record?.id ?? "",
      resolution: "",
      cost: ""
    });
  }, [record, reset, open]);

  return (
    <Modal
      open={open}
      title="Close Maintenance"
      description="Capture the fix details and return the asset to available stock."
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            maintenance_id: values.maintenance_id,
            resolution: values.resolution,
            cost: values.cost ? Number(values.cost) : null
          });
          onClose();
        })}
      >
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          {record ? (
            <>
              Closing <strong>{record.asset?.asset_tag}</strong> for {record.issue_type}.
            </>
          ) : (
            "Select an open maintenance record first."
          )}
        </div>
        <Field label="Resolution" error={errors.resolution?.message}>
          <Textarea {...register("resolution")} placeholder="What was fixed or replaced?" />
        </Field>
        <Field label="Cost" error={errors.cost?.message as string | undefined}>
          <Input type="number" step="0.01" {...register("cost")} placeholder="150.00" />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !record}>
            {isSubmitting ? "Saving..." : "Close Maintenance"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
