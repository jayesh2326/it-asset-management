import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "../common/card";
import { cn } from "../../lib/utils";

type Tone = "red" | "emerald" | "amber" | "slate";

const tones: Record<Tone, { icon: string; glow: string }> = {
  red: {
    icon: "bg-[#E50914]/12 text-[#E50914] ring-1 ring-[#E50914]/20",
    glow: "hover:shadow-[0_0_32px_rgba(229,9,20,0.16)]"
  },
  emerald: {
    icon: "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-500/20",
    glow: "hover:shadow-[0_0_32px_rgba(16,185,129,0.14)]"
  },
  amber: {
    icon: "bg-amber-500/12 text-amber-300 ring-1 ring-amber-500/20",
    glow: "hover:shadow-[0_0_32px_rgba(245,158,11,0.14)]"
  },
  slate: {
    icon: "bg-white/[0.05] text-white ring-1 ring-white/10",
    glow: "hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]"
  }
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "slate"
}: {
  label: string;
  value: number | string;
  hint: string;
  icon?: ReactNode;
  tone?: Tone;
}) {
  const styles = tones[tone];

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-full"
    >
      <Card
        className={cn(
          "h-full rounded-[16px] border-white/8 bg-[#111111] p-5 text-white shadow-[0_20px_48px_rgba(0,0,0,0.3)] ring-1 ring-inset ring-white/[0.03] transition-all duration-200",
          styles.glow
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
              {label}
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{value}</p>
          </div>
          <div className={cn("rounded-[14px] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]", styles.icon)}>
            {icon}
          </div>
        </div>
        <p className="text-sm leading-6 text-[#9CA3AF]">{hint}</p>
      </Card>
    </motion.div>
  );
}
