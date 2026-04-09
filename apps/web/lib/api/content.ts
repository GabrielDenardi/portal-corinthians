import "server-only";

import type {
  ArticleDetailDTO,
  HomeFeedDTO,
  MatchDTO,
  PaginatedArticlesDTO,
} from "@portal-corinthians/contracts";

import { fetchApiJson } from "./base";
import {
  getFallbackArticlePageContent,
  getFallbackCategoryPageContent,
  getFallbackHomePageContent,
  getFallbackMatchesPageContent,
} from "./fallback";
import {
  mapArticleDetailToStory,
  mapArticleListItemToNewsItem,
  mapHomeFeedToViewModel,
  mapMatchToMatchInfo,
  mapPaginatedArticlesToViewModel,
} from "./mappers";

export async function getHomePageContent() {
  const payload = await fetchApiJson<HomeFeedDTO>("/public/home", 300);

  if (!payload) {
    return getFallbackHomePageContent();
  }

  return mapHomeFeedToViewModel(payload);
}

export async function getArticlePageContent(slug: string) {
  const payload = await fetchApiJson<ArticleDetailDTO>(`/public/articles/${slug}`, 300);

  if (!payload) {
    return getFallbackArticlePageContent(slug);
  }

  return {
    article: mapArticleDetailToStory(payload),
    relatedArticles: payload.related.map(mapArticleListItemToNewsItem),
  };
}

export async function getCategoryPageContent(slug: string, page = 1, limit = 12) {
  const payload = await fetchApiJson<PaginatedArticlesDTO>(
    `/public/categories/${slug}/articles?page=${page}&limit=${limit}`,
    300,
  );

  if (!payload) {
    return getFallbackCategoryPageContent(slug, page, limit);
  }

  return mapPaginatedArticlesToViewModel(payload);
}

export async function getMatchesPageContent() {
  const payload = await fetchApiJson<MatchDTO[]>("/public/matches?scope=all", 60);

  if (!payload) {
    return getFallbackMatchesPageContent();
  }

  const matches = payload.map(mapMatchToMatchInfo);

  return {
    upcomingMatch: matches[0] ?? null,
    matches,
  };
}
