import type {
  ArticleDetailDTO,
  ArticleListItemDTO,
  BadgeVariant,
  BreadcrumbDTO,
  CategoryDTO,
  CategorySlug,
  NewsTone,
  ShareMetadataDTO,
  SourceContextDTO,
} from "@portal-corinthians/contracts";
import { Article, ArticleSource, Category, MatchStatusTone, Prisma } from "@prisma/client";

import { inferCategoryFromText } from "./categories";

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: { source: true; category: true };
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
  const label = toCategoryLabel(category).toLowerCase();

  return [
    `${summary} O recorte editorial do Portal Corinthians reorganiza a apuração para leitura rápida, priorizando contexto, hierarquia visual e entendimento imediato do torcedor.`,
    `Dentro da editoria ${label}, a matéria cruza impacto esportivo, bastidor e consequência prática para o dia a dia do clube, sem republicar integralmente o texto de origem.`,
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

export function toCategoryDTO(category: Category): CategoryDTO {
  return {
    id: category.id,
    slug: category.slug,
    label: category.label,
    description: category.description,
  };
}

export function toArticleListItemDTO(
  article: Article & { source: ArticleSource; category: Category },
): ArticleListItemDTO {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    summary: article.summary,
    category: toCategoryDTO(article.category),
    sourceName: article.source.name,
    sourceUrl: article.originalUrl,
    publishedAt: (article.publishedAt ?? article.updatedAt).toISOString(),
    readTime: article.readTime,
    imageUrl: article.imageUrl,
    imageAlt: article.imageAlt,
    badge: (article.badge as BadgeVariant | null) ?? null,
    badgeLabel: article.badgeLabel,
    tone: articleToneToNewsTone(article.tone),
    viewCount: article.viewCount,
  };
}

export function createArticleBreadcrumbs(article: ArticleWithRelations): BreadcrumbDTO[] {
  return [
    { label: "Home", href: "/" },
    { label: article.category.label, href: `/categorias/${article.category.slug}` },
    { label: article.title, href: `/materia/${article.slug}` },
  ];
}

export function createSourceContext(article: ArticleWithRelations): SourceContextDTO {
  return {
    sourceName: article.source.name,
    sourceUrl: article.originalUrl,
    originalTitle: article.originalTitle,
    note: `Texto reorganizado editorialmente com atribuição visível à fonte ${article.source.name}.`,
  };
}

export function createShareMetadata(article: ArticleWithRelations): ShareMetadataDTO {
  return {
    title: article.title,
    description: article.summary,
    url: `/materia/${article.slug}`,
  };
}

export function toArticleDetailDTO(article: ArticleWithRelations, related: ArticleWithRelations[]): ArticleDetailDTO {
  return {
    ...toArticleListItemDTO(article),
    body: Array.isArray(article.body) ? (article.body as string[]) : [],
    canonicalUrl: article.canonicalUrl,
    related: related.map(toArticleListItemDTO),
    breadcrumbs: createArticleBreadcrumbs(article),
    sourceContext: createSourceContext(article),
    share: createShareMetadata(article),
  };
}

function toCategoryLabel(category: CategorySlug) {
  if (category === "profissional") return "Profissional";
  if (category === "feminino") return "Feminino";
  if (category === "base") return "Base";
  if (category === "mercado") return "Mercado";
  if (category === "torcida") return "Torcida";
  if (category === "clube") return "Clube";
  return category;
}
