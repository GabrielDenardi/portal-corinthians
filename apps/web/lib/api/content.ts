import "server-only";

import type {
  ArticleDetailDTO,
  HomeFeedDTO,
  MatchDTO,
  MatchDetailDTO,
  PaginatedArticlesDTO,
} from "@portal-corinthians/contracts";

import { fetchApiJson } from "./base";
import {
  getFallbackArticlePageContent,
  getFallbackCategoryPageContent,
  getFallbackHomePageContent,
  getFallbackMatchDetail,
  getFallbackMatchesPageContent,
} from "./fallback";
import {
  mapArticleDetailToStory,
  mapArticleListItemToNewsItem,
  mapHomeFeedToViewModel,
  mapMatchDetailToViewModel,
  mapMatchToMatchInfo,
  mapPaginatedArticlesToViewModel,
} from "./mappers";

export async function getHomePageContent() {
  const payload = await fetchApiJson<HomeFeedDTO>("/public/home", {
    revalidate: 300,
    tags: ["home-feed"],
  });

  if (!payload) {
    return getFallbackHomePageContent();
  }

  return mapHomeFeedToViewModel(payload);
}

export async function getArticlePageContent(slug: string) {
  const payload = await fetchApiJson<ArticleDetailDTO>(`/public/articles/${slug}`, {
    revalidate: 300,
    tags: [`article:${slug}`, `category:${slug}`],
  });

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
    {
      revalidate: 300,
      tags: [`category:${slug}`],
    },
  );

  if (!payload) {
    return getFallbackCategoryPageContent(slug, page, limit);
  }

  return mapPaginatedArticlesToViewModel(payload);
}

export async function getMatchesPageContent() {
  const payload = await fetchApiJson<MatchDTO[]>("/public/matches?scope=all", {
    revalidate: 60,
    tags: ["matches"],
  });

  if (!payload) {
    return getFallbackMatchesPageContent();
  }

  const matches = payload.map(mapMatchToMatchInfo);

  return {
    upcomingMatch: matches[0] ?? null,
    matches,
  };
}

export async function getMatchPageContent(id: string) {
  const payload = await fetchApiJson<MatchDetailDTO>(`/public/matches/${id}`, {
    revalidate: 60,
    tags: ["matches", `match:${id}`],
  });

  if (!payload) {
    return getFallbackMatchDetail(id);
  }

  return {
    match: mapMatchDetailToViewModel(payload),
  };
}
