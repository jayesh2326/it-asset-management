export const queryKeys = {
  dashboard: ["dashboard"] as const,
  assets: ["assets"] as const,
  asset: (assetId: string) => ["asset", assetId] as const,
  employees: ["employees"] as const,
  employee: (employeeId: string) => ["employee", employeeId] as const,
  assignments: ["assignments"] as const,
  maintenance: ["maintenance"] as const,
  profiles: ["profiles"] as const
};
