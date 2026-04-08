import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-white bg-white text-app hover:-translate-y-px hover:bg-[#f2f3f5] active:translate-y-0",
  secondary:
    "border-line bg-white/5 text-ink hover:border-white/25 hover:bg-white/7 active:bg-white/10",
  ghost:
    "border-transparent bg-transparent text-ink-secondary hover:bg-white/6 hover:text-ink active:bg-white/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[0.72rem]",
  md: "h-12 px-5 text-[0.72rem]",
  lg: "h-14 px-6 text-sm",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-full)] border font-semibold uppercase tracking-[0.18em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-app disabled:pointer-events-none disabled:opacity-45",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, size, className })}
      type={type}
      {...props}
    />
  );
}
