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
    <div className="grid gap-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-panel lg:grid-cols-3">
      <label className="text-sm font-medium text-[var(--text-secondary)]">
        Trend window
        <Select
          className="mt-2"
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
      <label className="text-sm font-medium text-[var(--text-secondary)]">
        Asset location
        <Select
          className="mt-2"
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
      <label className="text-sm font-medium text-[var(--text-secondary)]">
        Asset category
        <Select
          className="mt-2"
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
  );
}
