import { cn, titleCase } from "../../lib/utils";
import type { AssetStatus } from "../../types/app";

function normalizeStatus(status: AssetStatus) {
  switch (status) {
    case "maintenance":
      return {
        label: "Maintenance",
        className:
          "border border-amber-500/20 bg-amber-500/10 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.12)]"
      };
    case "retired":
      return {
        label: "Retired",
        className:
          "border border-rose-500/20 bg-rose-500/10 text-rose-300 shadow-[0_0_18px_rgba(225,29,72,0.12)]"
      };
    case "lost":
      return {
        label: "Lost",
        className:
          "border border-rose-500/20 bg-rose-500/10 text-rose-300 shadow-[0_0_18px_rgba(225,29,72,0.12)]"
      };
    default:
      return {
        label: status === "assigned" ? "Active" : titleCase(status),
        className:
          "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.12)]"
      };
  }
}

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const tone = normalizeStatus(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase",
        tone.className
      )}
    >
      {tone.label}
    </span>
  );
}
