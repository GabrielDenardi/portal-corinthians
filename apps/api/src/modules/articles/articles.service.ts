import { createHash } from "node:crypto";

import type {
  ArticleDetailDTO,
  HomeCategoryFeedDTO,
  HomeFeedDTO,
  PaginatedArticlesDTO,
} from "@portal-corinthians/contracts";
import { Injectable, NotFoundException } from "@nestjs/common";
import { MatchStatusTone } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { GNewsClient } from "./gnews.client";
import {
  ArticleWithRelations,
  buildArticleBody,
  buildEditorialSummary,
  createArticleSlug,
  estimateReadTime,
  getBadgeForCategory,
  getToneForCategory,
  inferCategory,
  normalizeHeadline,
  toArticleDetailDTO,
  toArticleListItemDTO,
} from "./article.helpers";

const DEFAULT_HOME_SLOTS = [
  "featured",
  "highlight-1",
  "highlight-2",
  "highlight-3",
  "spotlight-1",
  "spotlight-2",
  "spotlight-3",
] as const;

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gNewsClient: GNewsClient,
  ) {}

  async getHomeFeed(upcomingMatch: HomeFeedDTO["upcomingMatch"]): Promise<HomeFeedDTO> {
    const [publishedArticles, mostReadRecords, categories, slots] = await Promise.all([
      this.prisma.article.findMany({
        where: { status: "published" },
        orderBy: [{ isPinnedHome: "desc" }, { featuredRank: "desc" }, { publishedAt: "desc" }],
        take: 24,
        include: { source: true, category: true },
      }),
      this.prisma.article.findMany({
        where: { status: "published" },
        take: 3,
        orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
        include: { source: true, category: true },
      }),
      this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      this.prisma.homeSlot.findMany({
        where: { slotKey: { in: [...DEFAULT_HOME_SLOTS] } },
        include: {
          article: {
            include: { source: true, category: true },
          },
        },
      }),
    ]);

    const slotEntries: Array<[string, ArticleWithRelations]> = [];
    for (const slot of slots) {
      if (slot.article) {
        slotEntries.push([slot.slotKey, slot.article]);
      }
    }
    const slotMap = new Map<string, ArticleWithRelations>(slotEntries);

    const usedIds = new Set<string>();
    const featured = selectSlotOrFallback(slotMap.get("featured"), publishedArticles, usedIds, 0);
    const highlights = [
      selectSlotOrFallback(slotMap.get("highlight-1"), publishedArticles, usedIds, 1),
      selectSlotOrFallback(slotMap.get("highlight-2"), publishedArticles, usedIds, 1),
      selectSlotOrFallback(slotMap.get("highlight-3"), publishedArticles, usedIds, 1),
    ].filter(Boolean) as ArticleWithRelations[];

    const spotlight = [
      selectSlotOrFallback(slotMap.get("spotlight-1"), publishedArticles, usedIds, 1),
      selectSlotOrFallback(slotMap.get("spotlight-2"), publishedArticles, usedIds, 1),
      selectSlotOrFallback(slotMap.get("spotlight-3"), publishedArticles, usedIds, 1),
    ].filter(Boolean) as ArticleWithRelations[];

    const latest = publishedArticles.filter((article) => !usedIds.has(article.id)).slice(0, 6);
    const mostRead = mostReadRecords.map(toArticleListItemDTO);
    const homeCategories = await Promise.all(
      categories.map(async (category) => {
        const items = await this.prisma.article.findMany({
          where: {
            status: "published",
            categoryId: category.id,
          },
          orderBy: { publishedAt: "desc" },
          take: 4,
          include: { source: true, category: true },
        });

        return {
          category: {
            id: category.id,
            slug: category.slug,
            label: category.label,
            description: category.description,
          },
          items: items.map(toArticleListItemDTO),
        } satisfies HomeCategoryFeedDTO;
      }),
    );

    return {
      featured: featured ? toArticleListItemDTO(featured) : null,
      highlights: highlights.map(toArticleListItemDTO),
      latest: latest.map(toArticleListItemDTO),
      mostRead,
      spotlight: spotlight.map(toArticleListItemDTO),
      categories: homeCategories,
      upcomingMatch,
      updatedAt: new Date().toISOString(),
    };
  }

  async getArticleBySlug(slug: string): Promise<ArticleDetailDTO> {
    const article = await this.prisma.article.findFirst({
      where: { slug, status: "published" },
      include: { source: true, category: true },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    const related = await this.prisma.article.findMany({
      where: {
        status: "published",
        categoryId: article.categoryId,
        id: { not: article.id },
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
      include: { source: true, category: true },
    });

    return toArticleDetailDTO(article, related);
  }

  async getCategoryArticles(slug: string, page = 1, limit = 12): Promise<PaginatedArticlesDTO> {
    const category = await this.prisma.category.findFirst({
      where: { slug, isActive: true },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const skip = Math.max(0, (page - 1) * limit);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where: { status: "published", categoryId: category.id },
        take: limit,
        skip,
        orderBy: { publishedAt: "desc" },
        include: { source: true, category: true },
      }),
      this.prisma.article.count({
        where: { status: "published", categoryId: category.id },
      }),
    ]);

    return {
      category: {
        id: category.id,
        slug: category.slug,
        label: category.label,
        description: category.description,
      },
      items: items.map(toArticleListItemDTO),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async listPublishedArticles() {
    return this.prisma.article.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      include: { source: true, category: true },
    });
  }

  async syncLatestArticles() {
    const liveArticles = await this.gNewsClient.fetchLatestCorinthiansArticles();
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, slug: true },
    });

    const categoryBySlug = new Map(categories.map((category) => [category.slug, category.id]));
    let processed = 0;

    for (const liveArticle of liveArticles) {
      const title = normalizeHeadline(liveArticle.title);
      const categorySlug = inferCategory(title, liveArticle.description);
      const categoryId = categoryBySlug.get(categorySlug);

      if (!categoryId) {
        continue;
      }

      const sourceBaseUrl = tryExtractOrigin(liveArticle.sourceUrl);
      const source = await this.prisma.articleSource.upsert({
        where: {
          name_baseUrl: {
            name: liveArticle.sourceName,
            baseUrl: sourceBaseUrl,
          },
        },
        update: {},
        create: {
          name: liveArticle.sourceName,
          baseUrl: sourceBaseUrl,
        },
      });

      const fingerprint = createIncomingFingerprint(title, liveArticle.canonicalUrl, liveArticle.sourceName);
      const existing = await this.prisma.incomingStory.findFirst({
        where: {
          OR: [
            { originalUrl: liveArticle.url },
            { canonicalUrl: liveArticle.canonicalUrl },
            { fingerprint },
          ],
        },
      });

      const incomingData = {
        externalId: liveArticle.url,
        slug: createArticleSlug(title),
        title,
        summary: buildEditorialSummary(liveArticle.description, title),
        canonicalUrl: liveArticle.canonicalUrl,
        originalUrl: liveArticle.url,
        originalTitle: liveArticle.title,
        imageUrl: liveArticle.imageUrl,
        publishedAt: liveArticle.publishedAt,
        fingerprint,
        priority: categorySlug === "profissional" ? 90 : 60,
        relevance: categorySlug === "profissional" ? 85 : 65,
        sourceId: source.id,
        suggestedCategoryId: categoryId,
      } as const;

      if (existing) {
        await this.prisma.incomingStory.update({
          where: { id: existing.id },
          data: incomingData,
        });
      } else {
        await this.prisma.incomingStory.create({
          data: incomingData,
        });
      }

      processed += 1;
    }

    return processed;
  }

  async createDraftFromIncomingStory(storyId: string) {
    const story = await this.prisma.incomingStory.findUnique({
      where: { id: storyId },
      include: {
        source: true,
        suggestedCategory: true,
      },
    });

    if (!story) {
      throw new NotFoundException("Incoming story not found");
    }

    const existingArticle = story.articleId
      ? await this.prisma.article.findUnique({
          where: { id: story.articleId },
          include: { source: true, category: true },
        })
      : null;

    const body = buildArticleBody(story.summary, story.suggestedCategory.slug, story.source.name);
    const badge = getBadgeForCategory(story.suggestedCategory.slug);
    const tone = toPrismaTone(getToneForCategory(story.suggestedCategory.slug));

    const article = existingArticle
      ? await this.prisma.article.update({
          where: { id: existingArticle.id },
          data: {
            title: story.title,
            dek: story.summary,
            summary: story.summary,
            body,
            originalTitle: story.originalTitle,
            originalUrl: story.originalUrl,
            canonicalUrl: story.canonicalUrl,
            imageUrl: story.imageUrl,
            imageAlt: story.title,
            categoryId: story.suggestedCategoryId,
            readTime: estimateReadTime(body),
            badge: badge.badge,
            badgeLabel: badge.badgeLabel,
            tone,
            sourceId: story.sourceId,
            syncedAt: new Date(),
          },
          include: { source: true, category: true },
        })
      : await this.prisma.article.create({
          data: {
            slug: story.slug,
            title: story.title,
            dek: story.summary,
            summary: story.summary,
            body,
            originalTitle: story.originalTitle,
            originalUrl: story.originalUrl,
            canonicalUrl: story.canonicalUrl,
            imageUrl: story.imageUrl,
            imageAlt: story.title,
            categoryId: story.suggestedCategoryId,
            readTime: estimateReadTime(body),
            badge: badge.badge,
            badgeLabel: badge.badgeLabel,
            tone,
            sourceId: story.sourceId,
          },
          include: { source: true, category: true },
        });

    await this.prisma.incomingStory.update({
      where: { id: story.id },
      data: {
        articleId: article.id,
        status: "approved",
      },
    });

    return article;
  }
}

function selectSlotOrFallback(
  slotArticle: ArticleWithRelations | null | undefined,
  fallback: ArticleWithRelations[],
  usedIds: Set<string>,
  fallbackIndex: number,
) {
  if (slotArticle && !usedIds.has(slotArticle.id)) {
    usedIds.add(slotArticle.id);
    return slotArticle;
  }

  const candidate = fallback.find((article, index) => index >= fallbackIndex && !usedIds.has(article.id));

  if (!candidate) {
    return null;
  }

  usedIds.add(candidate.id);
  return candidate;
}

function createIncomingFingerprint(title: string, canonicalUrl: string, sourceName: string) {
  return createHash("sha256").update(`${title}|${canonicalUrl}|${sourceName}`).digest("hex");
}

function tryExtractOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
}

function toPrismaTone(tone: ReturnType<typeof getToneForCategory>) {
  if (tone === "alert") return MatchStatusTone.alert;
  if (tone === "success") return MatchStatusTone.success;
  if (tone === "warning") return MatchStatusTone.warning;
  return MatchStatusTone.default;
}
