import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { EmployeeInput } from "../../types/app";
import { employeeSchema } from "../../lib/validations";
import { Button } from "../common/button";
import { Field, Input, Select, Textarea } from "../common/fields";
import { Modal } from "../common/modal";

type EmployeeFormValues = EmployeeInput;

const defaults: EmployeeFormValues = {
  employee_code: "",
  full_name: "",
  email: "",
  department: "",
  designation: "",
  location: "",
  phone: "",
  status: "active",
  notes: ""
};

export function EmployeeFormModal({
  open,
  onClose,
  initialValues,
  onSubmit,
  title
}: {
  open: boolean;
  onClose: () => void;
  initialValues?: EmployeeInput | null;
  onSubmit: (input: EmployeeInput) => Promise<unknown>;
  title: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialValues ?? defaults
  });

  useEffect(() => {
    reset(initialValues ?? defaults);
  }, [initialValues, reset, open]);

  return (
    <Modal
      open={open}
      title={title}
      description="Keep your employee directory clean so assignments stay accurate."
      onClose={onClose}
    >
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          onClose();
        })}
      >
        <Field label="Employee Code" error={errors.employee_code?.message}>
          <Input {...register("employee_code")} placeholder="EMP-1015" />
        </Field>
        <Field label="Full Name" error={errors.full_name?.message}>
          <Input {...register("full_name")} placeholder="Jamie Ortiz" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} placeholder="jamie@company.com" />
        </Field>
        <Field label="Department" error={errors.department?.message}>
          <Input {...register("department")} placeholder="Finance" />
        </Field>
        <Field label="Designation" error={errors.designation?.message}>
          <Input {...register("designation")} placeholder="Analyst" />
        </Field>
        <Field label="Location" error={errors.location?.message}>
          <Input {...register("location")} placeholder="Mumbai" />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <Input {...register("phone")} placeholder="+91 90000 10015" />
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Select {...register("status")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Notes" error={errors.notes?.message}>
            <Textarea {...register("notes")} placeholder="Any onboarding or location notes" />
          </Field>
        </div>
        <div className="md:col-span-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Employee"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
