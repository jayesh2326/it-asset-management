import type { Asset, AssetInput, Employee, EmployeeInput } from "../types/app";

export function toAssetInput(asset: Asset): AssetInput {
  return {
    asset_tag: asset.asset_tag,
    name: asset.name,
    category: asset.category,
    brand: asset.brand,
    model: asset.model,
    serial_number: asset.serial_number,
    purchase_date: asset.purchase_date,
    warranty_expiry: asset.warranty_expiry,
    location: asset.location,
    condition: asset.condition,
    status: asset.status,
    notes: asset.notes
  };
}

export function toEmployeeInput(employee: Employee): EmployeeInput {
  return {
    employee_code: employee.employee_code,
    full_name: employee.full_name,
    email: employee.email,
    department: employee.department,
    designation: employee.designation,
    location: employee.location,
    phone: employee.phone,
    status: employee.status,
    notes: employee.notes
  };
}
