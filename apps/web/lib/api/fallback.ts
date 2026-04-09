import {
  articleStories,
  getArticleBySlug,
  getRelatedArticles,
  type ArticleStory,
} from "@/content/articles";
import {
  featuredStory,
  footerLinkGroups,
  latestStories,
  mostReadStories,
  newsByCategory,
  newsCategories,
  secondaryHighlights,
  siteNavigation,
  spotlightStories,
  upcomingMatch,
} from "@/content/home";

export function getFallbackNavigation() {
  return siteNavigation;
}

export function getFallbackFooterGroups() {
  return footerLinkGroups;
}

export function getFallbackHomePageContent() {
  return {
    featuredStory,
    secondaryHighlights,
    latestStories,
    mostReadStories,
    spotlightStories,
    newsCategories,
    newsByCategory,
    upcomingMatch,
  };
}

export function getFallbackArticlePageContent(slug: string) {
  const article = getArticleBySlug(slug);

  if (!article) {
    return null;
  }

  return {
    article,
    relatedArticles: getRelatedArticles(article),
  };
}

export function getFallbackCategoryPageContent(slug: string, page = 1, limit = 12) {
  const category = newsCategories.find((item) => item.id === slug);

  if (!category || category.id === "todas") {
    return null;
  }

  const allItems = newsByCategory[category.id];
  const offset = (page - 1) * limit;

  return {
    category,
    items: allItems.slice(offset, offset + limit),
    page,
    limit,
    total: allItems.length,
    totalPages: Math.max(1, Math.ceil(allItems.length / limit)),
  };
}

export function getFallbackMatchesPageContent() {
  return {
    upcomingMatch,
    matches: [upcomingMatch],
  };
}

export function getFallbackArticleStories(): ArticleStory[] {
  return articleStories;
}
