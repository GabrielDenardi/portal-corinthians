import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface ContainerProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function Container({
  as: Component = "div",
  children,
  className,
}: ContainerProps) {
  return <Component className={cn("portal-container", className)}>{children}</Component>;
}
