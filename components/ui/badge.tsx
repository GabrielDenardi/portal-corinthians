import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type BadgeVariant = "breaking" | "live" | "category" | "status";

const badgeClasses: Record<BadgeVariant, string> = {
  breaking: "border-alert/35 bg-alert/18 text-white",
  live: "border-white/18 bg-white text-app",
  category: "border-white/12 bg-white/6 text-ink-secondary",
  status: "border-warning/30 bg-warning/14 text-white",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}

export function Badge({
  children,
  className,
  variant = "category",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-full)] border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em]",
        badgeClasses[variant],
        className,
      )}
      {...props}
    >
      {variant === "live" ? (
        <span className="size-1.5 rounded-full bg-alert" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}
