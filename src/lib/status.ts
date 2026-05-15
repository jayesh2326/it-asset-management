import type {
  Asset,
  AssetStatus,
  AssignmentWithRelations,
  Employee
} from "../types/app";

export function getStatusTone(status: AssetStatus | string) {
  switch (status) {
    case "in_stock":
    case "active":
      return "emerald";
    case "assigned":
      return "blue";
    case "maintenance":
      return "amber";
    case "retired":
    case "lost":
    case "inactive":
      return "rose";
    default:
      return "slate";
  }
}

export function canAssignAsset(asset: Asset, employee?: Employee | null) {
  return (
    asset.status === "in_stock" &&
    !asset.archived_at &&
    (!!employee ? employee.status === "active" && !employee.archived_at : true)
  );
}

export function canReturnAssignment(assignment: AssignmentWithRelations) {
  return assignment.status === "active" && !assignment.returned_at;
}
