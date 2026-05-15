import { Link } from "react-router-dom";
import { Card } from "../common/card";
import { EmptyState } from "../common/empty-state";
import { AssetStatusBadge } from "./asset-status-badge";
import type { AssetStatus } from "../../types/app";

export interface AssetOverviewRow {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  owner: string;
  location: string;
  status: AssetStatus;
  updatedAt: string;
}

export function AssetOverviewTable({
  rows
}: {
  rows: AssetOverviewRow[];
}) {
  return (
    <Card className="overflow-hidden rounded-[16px] border-white/8 bg-[#111111] p-0 shadow-[0_24px_54px_rgba(0,0,0,0.34)] ring-1 ring-inset ring-white/[0.03]">
      <div className="flex flex-col gap-4 border-b border-white/8 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9CA3AF]">
            Asset List
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Inventory Snapshot</h2>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            The latest filtered assets across ownership, maintenance, and lifecycle state.
          </p>
        </div>
        <Link
          to="/assets"
          className="inline-flex items-center rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-[#E50914]/40 hover:bg-[#E50914]/10 hover:shadow-[0_0_24px_rgba(229,9,20,0.14)]"
        >
          View all assets
        </Link>
      </div>

      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/8 bg-[#0D0D0D]">
                {["Asset", "Category", "Owner", "Location", "Status", "Updated"].map((label) => (
                  <th
                    key={label}
                    className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9CA3AF]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/[0.05] transition-colors duration-200 hover:bg-white/[0.03]"
                >
                  <td className="px-6 py-4">
                    <Link
                      to={`/assets/${row.id}`}
                      className="font-semibold text-white transition-colors duration-200 hover:text-[#E50914]"
                    >
                      {row.assetTag}
                    </Link>
                    <p className="mt-1 text-sm text-[#9CA3AF]">{row.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#D1D5DB]">{row.category}</td>
                  <td className="px-6 py-4 text-sm text-[#D1D5DB]">{row.owner}</td>
                  <td className="px-6 py-4 text-sm text-[#9CA3AF]">{row.location}</td>
                  <td className="px-6 py-4">
                    <AssetStatusBadge status={row.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-[#9CA3AF]">{row.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6">
          <EmptyState
            title="No assets in this view"
            description="Adjust the dashboard filters to populate the asset snapshot."
          />
        </div>
      )}
    </Card>
  );
}
