import Link from "next/link";

import { articleHref } from "@/content/articles";
import type { NewsItem } from "@/content/home";

import { StoryMedia } from "@/components/news/story-media";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { ArrowRightIcon, ClockIcon, NewspaperIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export interface NewsCardProps {
  story: NewsItem;
  layout?: "vertical" | "horizontal" | "compact";
}

const wrapperClasses = {
  vertical: "flex flex-col gap-5",
  horizontal: "grid gap-5 md:grid-cols-[minmax(0,1fr)_1.05fr] md:items-start",
  compact: "grid grid-cols-[96px_minmax(0,1fr)] gap-4 sm:grid-cols-[104px_minmax(0,1fr)]",
};

const mediaLayout = {
  vertical: "landscape" as const,
  horizontal: "landscape" as const,
  compact: "compact" as const,
};

export function NewsCard({ story, layout = "vertical" }: NewsCardProps) {
  return (
    <article
      className={cn(
        "group rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-4 shadow-[var(--shadow-card)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 hover:bg-card-hover",
        wrapperClasses[layout],
      )}
    >
      <StoryMedia
        title={story.title}
        categoryLabel={story.categoryLabel}
        badgeLabel={story.badgeLabel}
        image={story.image}
        imageAlt={story.imageAlt}
        tone={story.tone}
        layout={mediaLayout[layout]}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          {story.badge && story.badgeLabel ? (
            <Badge variant={story.badge}>{story.badgeLabel}</Badge>
          ) : (
            <Badge variant="category">{story.categoryLabel}</Badge>
          )}
        </div>

        <h3
          className={cn(
            "mt-4 text-balance text-white transition-colors group-hover:text-white/92",
            layout === "compact" ? "type-h3 text-xl" : "type-h3",
          )}
        >
          {story.title}
        </h3>

        <p className="type-body mt-3 flex-1 text-ink-secondary">{story.summary}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-2">
            <NewspaperIcon className="size-4" />
            {story.source}
          </span>
          <span className="inline-flex items-center gap-2">
            <ClockIcon className="size-4" />
            {story.publishedAt}
          </span>
        </div>

        <div className="mt-5">
          <Link
            href={articleHref(story)}
            className={buttonStyles({ variant: "ghost", size: "sm", className: "pl-0" })}
            aria-label={`Ler matéria: ${story.title}`}
          >
            Ver matéria
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
