import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "../common/card";
import { cn } from "../../lib/utils";

export function ChartCard({
  eyebrow = "Analytics",
  title,
  description,
  children,
  action,
  className
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative h-full overflow-hidden rounded-[16px] border-white/8 bg-[#111111] p-6 shadow-[0_24px_54px_rgba(0,0,0,0.32)] ring-1 ring-inset ring-white/[0.03]",
          className
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#E50914]/70 to-transparent"
        />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9CA3AF]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#9CA3AF]">{description}</p>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>

        <div className="mt-6">{children}</div>
      </Card>
    </motion.section>
  );
}
