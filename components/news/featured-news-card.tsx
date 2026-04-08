import Link from "next/link";

import { articleHref } from "@/content/articles";
import type { FeaturedStory } from "@/content/home";

import { StoryMedia } from "@/components/news/story-media";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { ArrowRightIcon, ClockIcon, NewspaperIcon } from "@/components/ui/icons";

interface FeaturedNewsCardProps {
  story: FeaturedStory;
}

export function FeaturedNewsCard({ story }: FeaturedNewsCardProps) {
  return (
    <article className="overflow-hidden rounded-[calc(var(--radius-xl)+6px)] border border-white/10 bg-card/85 shadow-[var(--shadow-feature)] backdrop-blur-sm">
      <div className="grid gap-6 p-4 md:p-5 xl:grid-cols-[minmax(0,1.08fr)_0.92fr] xl:items-stretch">
        <StoryMedia
          title={story.title}
          categoryLabel={story.categoryLabel}
          badgeLabel={story.badgeLabel}
          image={story.image}
          imageAlt={story.imageAlt}
          tone={story.tone}
          layout="hero"
        />

        <div className="flex flex-col justify-between gap-6 p-1">
          <div>
            <Badge variant={story.badge ?? "category"}>{story.badgeLabel ?? story.categoryLabel}</Badge>
            <h2 className="type-h1 mt-5 max-w-[18ch] text-balance text-white">{story.title}</h2>
            <p className="type-body-lg mt-4 max-w-2xl text-ink-secondary">{story.subheadline}</p>
            <p className="type-body mt-4 max-w-2xl text-ink-secondary/88">{story.summary}</p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-white/8 bg-app/45 p-5">
            <p className="editorial-kicker">Leitura rápida</p>
            <ul className="mt-4 space-y-3">
              {story.highlights.map((highlight) => (
                <li key={highlight} className="type-body flex gap-3 text-ink-secondary">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-alert" aria-hidden="true" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

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

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={articleHref(story)} className={buttonStyles({ size: "lg" })}>
                Ver matéria
                <ArrowRightIcon className="size-4" />
              </Link>
              <Button variant="ghost" size="lg">
                Atualizado agora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
