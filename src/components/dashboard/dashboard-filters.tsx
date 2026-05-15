import type { DashboardDateRangePreset } from "../../types/app";
import { Select } from "../common/fields";

const rangeOptions: Array<{ label: string; value: DashboardDateRangePreset }> = [
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 180 days", value: "180d" },
  { label: "Last 12 months", value: "365d" },
  { label: "All time", value: "all" }
];

export function DashboardFiltersBar({
  dateRange,
  location,
  category,
  locations,
  categories,
  onDateRangeChange,
  onLocationChange,
  onCategoryChange
}: {
  dateRange: DashboardDateRangePreset;
  location: string;
  category: string;
  locations: string[];
  categories: string[];
  onDateRangeChange: (value: DashboardDateRangePreset) => void;
  onLocationChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[16px] border border-white/8 bg-[#111111] p-5 shadow-[0_20px_48px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/[0.03]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9CA3AF]">
            Dashboard Filters
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">Refine the analytics view</h2>
        </div>
        <p className="text-sm text-[#9CA3AF]">
          Focus the dashboard by time range, location, and category.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <label className="text-sm font-medium text-[#D1D5DB]">
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#9CA3AF]">
            Trend window
          </span>
          <Select
            className="mt-2 h-12 rounded-[14px] border-white/8 bg-[#0D0D0D] text-white focus:border-[#E50914] focus:shadow-[0_0_22px_rgba(229,9,20,0.12)]"
            value={dateRange}
            onChange={(event) => onDateRangeChange(event.target.value as DashboardDateRangePreset)}
          >
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
        <label className="text-sm font-medium text-[#D1D5DB]">
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#9CA3AF]">
            Asset location
          </span>
          <Select
            className="mt-2 h-12 rounded-[14px] border-white/8 bg-[#0D0D0D] text-white focus:border-[#E50914] focus:shadow-[0_0_22px_rgba(229,9,20,0.12)]"
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
          >
            <option value="all">All locations</option>
            {locations.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
        <label className="text-sm font-medium text-[#D1D5DB]">
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#9CA3AF]">
            Asset category
          </span>
          <Select
            className="mt-2 h-12 rounded-[14px] border-white/8 bg-[#0D0D0D] text-white focus:border-[#E50914] focus:shadow-[0_0_22px_rgba(229,9,20,0.12)]"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
      </div>
    </div>
  );
}
