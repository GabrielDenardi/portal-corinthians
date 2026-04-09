import type {
  ArticleDetailDTO,
  ArticleListItemDTO,
  BadgeVariant,
  CategorySlug,
  NewsTone,
} from "@portal-corinthians/contracts";
import { Article, ArticleSource, MatchStatusTone, Prisma } from "@prisma/client";

import { CATEGORY_META, inferCategoryFromText } from "./categories";

export type ArticleWithSource = Prisma.ArticleGetPayload<{
  include: { source: true };
}>;

export type ArticleDetailRecord = Prisma.ArticleGetPayload<{
  include: { source: true };
}>;

export function createArticleSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeHeadline(title: string) {
  return title
    .replace(/\s+-\s+[^-]+$/, "")
    .replace(/\s+\|\s+[^|]+$/, "")
    .trim();
}

export function buildEditorialSummary(description: string | null | undefined, fallbackTitle: string) {
  const base = (description ?? fallbackTitle).trim();
  return base.endsWith(".") ? base : `${base}.`;
}

export function estimateReadTime(paragraphs: string[]) {
  const words = paragraphs.join(" ").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(2, Math.round(words / 180));
  return `${minutes} min`;
}

export function inferCategory(title: string, description?: string | null) {
  return inferCategoryFromText(`${title} ${description ?? ""}`);
}

export function getToneForCategory(category: CategorySlug): NewsTone {
  switch (category) {
    case "feminino":
    case "base":
      return "success";
    case "mercado":
    case "clube":
      return "warning";
    case "torcida":
      return "default";
    case "profissional":
    default:
      return "alert";
  }
}

export function getBadgeForCategory(category: CategorySlug): {
  badge: BadgeVariant;
  badgeLabel: string;
} {
  switch (category) {
    case "mercado":
      return { badge: "status", badgeLabel: "Monitorando" };
    case "feminino":
      return { badge: "live", badgeLabel: "Em alta" };
    case "torcida":
      return { badge: "category", badgeLabel: "Arquibancada" };
    case "clube":
      return { badge: "status", badgeLabel: "Clube" };
    case "base":
      return { badge: "live", badgeLabel: "Base" };
    case "profissional":
    default:
      return { badge: "breaking", badgeLabel: "Destaque" };
  }
}

export function buildArticleBody(summary: string, category: CategorySlug, sourceName: string) {
  return [
    `${summary} O recorte editorial do Portal Corinthians reorganiza a apuração para leitura rápida, priorizando contexto, hierarquia visual e entendimento imediato do torcedor.`,
    `Dentro da editoria ${CATEGORY_META[category].label.toLowerCase()}, a matéria cruza impacto esportivo, bastidor e consequência prática para o dia a dia do clube, sem republicar integralmente o texto de origem.`,
    `A fonte original permanece creditada em destaque. Quando houver novas informações, a atualização editorial deve ajustar título, resumo e distribuição na home preservando clareza e atribuição à fonte ${sourceName}.`,
  ];
}

export function formatPublishedAt(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

export function matchStatusToneToNewsTone(tone: MatchStatusTone): NewsTone {
  if (tone === MatchStatusTone.alert) return "alert";
  if (tone === MatchStatusTone.success) return "success";
  if (tone === MatchStatusTone.warning) return "warning";
  return "default";
}

export function articleToneToNewsTone(tone: MatchStatusTone): NewsTone {
  return matchStatusToneToNewsTone(tone);
}

export function toArticleListItemDTO(article: Article & { source: ArticleSource }): ArticleListItemDTO {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    summary: article.summary,
    category: CATEGORY_META[article.category],
    sourceName: article.source.name,
    sourceUrl: article.originalUrl,
    publishedAt: article.publishedAt.toISOString(),
    readTime: article.readTime,
    imageUrl: article.imageUrl,
    imageAlt: article.imageAlt,
    badge: (article.badge as BadgeVariant | null) ?? null,
    badgeLabel: article.badgeLabel,
    tone: articleToneToNewsTone(article.tone),
    viewCount: article.viewCount,
  };
}

export function toArticleDetailDTO(article: ArticleDetailRecord, related: ArticleWithSource[]): ArticleDetailDTO {
  return {
    ...toArticleListItemDTO(article),
    body: Array.isArray(article.body) ? (article.body as string[]) : [],
    canonicalUrl: article.canonicalUrl,
    related: related.map(toArticleListItemDTO),
  };
}
