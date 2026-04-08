"use client";

import { useState } from "react";

import type { NewsCategory, NewsCategoryId, NewsItem } from "@/content/home";

import { NewsCard } from "@/components/news/news-card";
import { cn } from "@/lib/cn";

export interface CategoryTabsProps {
  categories: NewsCategory[];
  itemsByCategory: Record<NewsCategoryId, NewsItem[]>;
}

export function CategoryTabs({ categories, itemsByCategory }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState<NewsCategoryId>(categories[0]?.id ?? "todas");

  const stories = itemsByCategory[activeCategory] ?? [];
  const activeCategoryMeta =
    categories.find((category) => category.id === activeCategory) ?? categories[0];

  return (
    <div className="rounded-[calc(var(--radius-xl)+6px)] border border-white/8 bg-card/72 p-4 shadow-[var(--shadow-card)] md:p-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorias editoriais">
        {categories.map((category) => {
          const isActive = category.id === activeCategory;

          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "rounded-[var(--radius-full)] border px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-all duration-200",
                isActive
                  ? "border-white bg-white text-app"
                  : "border-white/10 bg-white/4 text-ink-secondary hover:border-white/25 hover:bg-white/8 hover:text-white",
              )}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <p className="type-body max-w-2xl text-ink-secondary">{activeCategoryMeta?.description}</p>
      </div>

      <div
        role="tabpanel"
        className="mt-8 grid gap-5 lg:grid-cols-2"
        aria-label={`Matérias da categoria ${activeCategoryMeta?.label}`}
      >
        {stories.map((story, index) => (
          <NewsCard
            key={story.id}
            story={story}
            layout={index === 0 && stories.length > 2 ? "horizontal" : "vertical"}
          />
        ))}
      </div>
    </div>
  );
}
