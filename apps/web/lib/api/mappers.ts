import type {
  ArticleDetailDTO,
  ArticleListItemDTO,
  CategoryDTO,
  HomeFeedDTO,
  MatchDTO,
  PaginatedArticlesDTO,
} from "@portal-corinthians/contracts";

import type { ArticleStory } from "@/content/articles";
import type {
  FeaturedStory,
  MatchInfo,
  NewsCategory,
  NewsCategoryId,
  NewsItem,
} from "@/content/home";

function formatPublishedAt(value: string) {
  const date = new Date(value);
  const diffMinutes = Math.round((date.getTime() - Date.now()) / (1000 * 60));
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 60) {
    return diffMinutes <= 0 ? `Atualizado há ${Math.max(1, absMinutes)} min` : `Em ${absMinutes} min`;
  }

  const absHours = Math.round(absMinutes / 60);

  if (absHours < 24) {
    return diffMinutes <= 0 ? `Há ${absHours} h` : `Em ${absHours} h`;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function createHighlightsFromArticle(article: ArticleListItemDTO) {
  return [article.dek, article.summary]
    .flatMap((text) => text.split(/[.!?]/))
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function mapCategory(category: CategoryDTO): NewsCategory {
  return {
    id: category.slug,
    label: category.label,
    description: category.description,
  };
}

export function mapArticleListItemToNewsItem(article: ArticleListItemDTO): NewsItem {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    categoryId: article.category.slug,
    categoryLabel: article.category.label,
    source: article.sourceName,
    publishedAt: formatPublishedAt(article.publishedAt),
    readTime: article.readTime,
    image: article.imageUrl ?? undefined,
    imageAlt: article.imageAlt ?? undefined,
    badge: article.badge ?? undefined,
    badgeLabel: article.badgeLabel ?? undefined,
    tone: article.tone ?? undefined,
  };
}

export function mapArticleDetailToStory(article: ArticleDetailDTO): ArticleStory {
  return {
    ...mapArticleListItemToNewsItem(article),
    slug: article.slug,
    subheadline: article.dek,
    body: article.body,
    originalUrl: article.sourceUrl,
    canonicalUrl: article.canonicalUrl,
    viewCount: article.viewCount,
  };
}

export function mapArticleToFeaturedStory(article: ArticleListItemDTO): FeaturedStory {
  return {
    ...mapArticleListItemToNewsItem(article),
    subheadline: article.dek,
    highlights: createHighlightsFromArticle(article),
  };
}

export function mapMatchToMatchInfo(match: MatchDTO): MatchInfo {
  return {
    competition: match.competition,
    round: match.round,
    homeTeam: match.homeTeam.name,
    homeTeamBadgeUrl: match.homeTeam.badgeUrl ?? undefined,
    awayTeam: match.awayTeam.name,
    awayTeamBadgeUrl: match.awayTeam.badgeUrl ?? undefined,
    venue: match.venue,
    kickOff: match.kickOff,
    broadcast: match.broadcast,
    note: match.note,
    statusLabel: match.statusLabel,
    statusTone: match.statusTone,
  };
}

function getCategoryItems(homeFeed: HomeFeedDTO, slug: Exclude<NewsCategoryId, "todas">) {
  return (
    homeFeed.categories.find((entry) => entry.category.slug === slug)?.items.map(mapArticleListItemToNewsItem) ?? []
  );
}

export function mapHomeFeedToViewModel(homeFeed: HomeFeedDTO) {
  return {
    featuredStory: homeFeed.featured ? mapArticleToFeaturedStory(homeFeed.featured) : null,
    secondaryHighlights: homeFeed.highlights.map(mapArticleListItemToNewsItem),
    latestStories: homeFeed.latest.map(mapArticleListItemToNewsItem),
    mostReadStories: homeFeed.mostRead.map(mapArticleListItemToNewsItem),
    spotlightStories: homeFeed.spotlight.map(mapArticleListItemToNewsItem),
    newsCategories: [
      {
        id: "todas" as const,
        label: "Todas",
        description: "Panorama geral com os movimentos que puxam o dia.",
      },
      ...homeFeed.categories.map(({ category }) => mapCategory(category)),
    ],
    newsByCategory: {
      todas: [
        ...(homeFeed.featured ? [mapArticleListItemToNewsItem(homeFeed.featured)] : []),
        ...homeFeed.highlights.map(mapArticleListItemToNewsItem),
        ...homeFeed.latest.map(mapArticleListItemToNewsItem),
      ].slice(0, 6),
      profissional: getCategoryItems(homeFeed, "profissional"),
      feminino: getCategoryItems(homeFeed, "feminino"),
      base: getCategoryItems(homeFeed, "base"),
      mercado: getCategoryItems(homeFeed, "mercado"),
      torcida: getCategoryItems(homeFeed, "torcida"),
      clube: getCategoryItems(homeFeed, "clube"),
    },
    upcomingMatch: homeFeed.upcomingMatch ? mapMatchToMatchInfo(homeFeed.upcomingMatch) : null,
  };
}

export function mapPaginatedArticlesToViewModel(payload: PaginatedArticlesDTO) {
  return {
    category: mapCategory(payload.category),
    items: payload.items.map(mapArticleListItemToNewsItem),
    page: payload.page,
    limit: payload.limit,
    total: payload.total,
    totalPages: payload.totalPages,
  };
}
