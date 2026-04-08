import Image from "next/image";

import type { NewsTone } from "@/content/home";
import { cn } from "@/lib/cn";

interface StoryMediaProps {
  title: string;
  categoryLabel: string;
  badgeLabel?: string;
  image?: string;
  imageAlt?: string;
  tone?: NewsTone;
  layout?: "hero" | "landscape" | "compact";
}

const toneClasses: Record<NewsTone, string> = {
  default: "from-white/14 via-white/4 to-transparent",
  alert: "from-alert/40 via-white/6 to-transparent",
  success: "from-success/34 via-white/6 to-transparent",
  warning: "from-warning/28 via-white/5 to-transparent",
};

const layoutClasses = {
  hero: "aspect-[16/10] md:aspect-[16/9]",
  landscape: "aspect-[16/9]",
  compact: "aspect-[4/3]",
};

export function StoryMedia({
  title,
  categoryLabel,
  badgeLabel,
  image,
  imageAlt,
  tone = "default",
  layout = "landscape",
}: StoryMediaProps) {
  const hasLocalImage = Boolean(image?.startsWith("/"));

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-card",
        layoutClasses[layout],
      )}
    >
      {hasLocalImage ? (
        <Image
          src={image!}
          alt={imageAlt ?? title}
          fill
          className="object-cover"
          sizes={layout === "hero" ? "(min-width: 1280px) 60vw, 100vw" : "(min-width: 768px) 50vw, 100vw"}
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.09),transparent_45%)]" />
      <div className={cn("absolute inset-0 bg-gradient-to-br", toneClasses[tone])} />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0%,transparent_48%,rgba(255,255,255,0.08)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/18" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08))]" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/78">
          <span>{categoryLabel}</span>
          {badgeLabel ? <span className="text-white/48">/</span> : null}
          {badgeLabel ? <span>{badgeLabel}</span> : null}
        </div>
        <p className="mt-3 max-w-[18ch] font-display text-3xl uppercase leading-none tracking-[0.04em] text-white/16 md:text-4xl">
          Portal
        </p>
      </div>
    </div>
  );
}
