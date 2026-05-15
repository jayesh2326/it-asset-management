import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assetCategories, assetConditions, assetStatuses, type AssetInput } from "../../types/app";
import { assetSchema } from "../../lib/validations";
import { createAssetTag, createSerialNumber } from "../../lib/utils";
import { Button } from "../common/button";
import { Field, Input, Select, Textarea } from "../common/fields";
import { Modal } from "../common/modal";

type AssetFormValues = {
  asset_tag: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  serial_number: string;
  purchase_date: string;
  warranty_expiry: string;
  location: string;
  condition: AssetInput["condition"];
  status: AssetInput["status"];
  notes: string;
};

function createDefaults(category = "Laptop", brand = ""): AssetFormValues {
  return {
    asset_tag: createAssetTag(category),
    name: "",
    category,
    brand,
    model: "",
    serial_number: createSerialNumber(brand),
    purchase_date: "",
    warranty_expiry: "",
    location: "",
    condition: "good",
    status: "in_stock",
    notes: ""
  };
}

export function AssetFormModal({
  open,
  onClose,
  initialValues,
  onSubmit,
  title
}: {
  open: boolean;
  onClose: () => void;
  initialValues?: AssetInput | null;
  onSubmit: (input: AssetInput) => Promise<unknown>;
  title: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: initialValues
      ? {
          ...initialValues,
          purchase_date: initialValues.purchase_date ?? "",
          warranty_expiry: initialValues.warranty_expiry ?? ""
        }
      : createDefaults()
  });

  useEffect(() => {
    reset(
      initialValues
        ? {
            ...initialValues,
            purchase_date: initialValues.purchase_date ?? "",
            warranty_expiry: initialValues.warranty_expiry ?? ""
          }
        : createDefaults()
    );
  }, [initialValues, reset, open]);

  const category = watch("category");
  const brand = watch("brand");

  return (
    <Modal
      open={open}
      title={title}
      description="Capture inventory details, ownership readiness, and support notes."
      onClose={onClose}
    >
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            ...values,
            purchase_date: values.purchase_date || null,
            warranty_expiry: values.warranty_expiry || null
          });
          onClose();
        })}
      >
        <Field label="Asset Tag" error={errors.asset_tag?.message}>
          <Input {...register("asset_tag")} placeholder="LAP-1009" />
        </Field>
        <div className="flex items-end">
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setValue("asset_tag", createAssetTag(category), { shouldDirty: true })}
          >
            Generate Tag
          </Button>
        </div>
        <Field label="Asset Name" error={errors.name?.message}>
          <Input {...register("name")} placeholder="ThinkPad T14" />
        </Field>
        <Field label="Category" error={errors.category?.message}>
          <Select {...register("category")}>
            {assetCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Brand" error={errors.brand?.message}>
          <Input {...register("brand")} placeholder="Lenovo" />
        </Field>
        <Field label="Model" error={errors.model?.message}>
          <Input {...register("model")} placeholder="T14 Gen 4" />
        </Field>
        <Field label="Serial Number" error={errors.serial_number?.message}>
          <Input {...register("serial_number")} placeholder="LNV-1008" />
        </Field>
        <div className="flex items-end">
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() =>
              setValue("serial_number", createSerialNumber(brand), { shouldDirty: true })
            }
          >
            Generate Serial
          </Button>
        </div>
        <Field label="Purchase Date" error={errors.purchase_date?.message}>
          <Input type="date" {...register("purchase_date")} />
        </Field>
        <Field label="Warranty Expiry" error={errors.warranty_expiry?.message}>
          <Input type="date" {...register("warranty_expiry")} />
        </Field>
        <Field label="Location" error={errors.location?.message}>
          <Input {...register("location")} placeholder="Bench Pool" />
        </Field>
        <Field label="Condition" error={errors.condition?.message}>
          <Select {...register("condition")}>
            {assetConditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Select {...register("status")}>
            {assetStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </Field>
        <div />
        <div className="md:col-span-2">
          <Field label="Notes" error={errors.notes?.message}>
            <Textarea {...register("notes")} placeholder="Any support or location notes" />
          </Field>
        </div>
        <div className="md:col-span-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Asset"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
