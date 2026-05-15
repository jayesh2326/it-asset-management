import { z } from "zod";
import { assetCategories, assetConditions, assetStatuses } from "../types/app";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const signupSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const assetSchema = z.object({
  asset_tag: z.string().min(2, "Asset tag is required"),
  name: z.string().min(2, "Asset name is required"),
  category: z.string().min(2).refine((value) => [...assetCategories].includes(value as never), {
    message: "Choose a valid category"
  }),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  serial_number: z.string().min(1, "Serial number is required"),
  purchase_date: z.string().optional().or(z.literal("")),
  warranty_expiry: z.string().optional().or(z.literal("")),
  location: z.string().min(2, "Location is required"),
  condition: z.enum(assetConditions),
  status: z.enum(assetStatuses),
  notes: z.string().max(500).optional().or(z.literal(""))
});

export const employeeSchema = z.object({
  employee_code: z.string().min(2, "Employee code is required"),
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  department: z.string().min(2, "Department is required"),
  designation: z.string().min(2, "Designation is required"),
  location: z.string().min(2, "Location is required"),
  phone: z.string().min(7, "Phone is required"),
  status: z.enum(["active", "inactive"]),
  notes: z.string().max(500).optional().or(z.literal(""))
});

export const assignAssetSchema = z.object({
  asset_id: z.string().min(1, "Choose an asset"),
  employee_id: z.string().min(1, "Choose an employee"),
  due_date: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal(""))
});

export const returnAssetSchema = z.object({
  assignment_id: z.string().min(1),
  return_condition: z.enum(assetConditions),
  send_to_maintenance: z.boolean().default(false),
  return_notes: z.string().max(500).optional().or(z.literal(""))
});

export const maintenanceOpenSchema = z.object({
  asset_id: z.string().min(1, "Choose an asset"),
  issue_type: z.string().min(2, "Issue type is required"),
  notes: z.string().min(2, "Notes are required"),
  vendor: z.string().min(2, "Vendor is required")
});

export const maintenanceCloseSchema = z.object({
  maintenance_id: z.string().min(1),
  resolution: z.string().min(2, "Resolution is required"),
  cost: z.string().optional().or(z.literal(""))
});

export const inviteUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  full_name: z.string().min(2, "Full name is required"),
  role: z.enum(["admin", "it_staff"])
});
