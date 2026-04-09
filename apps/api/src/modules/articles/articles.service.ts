import type {
  ArticleDetailDTO,
  CategorySlug,
  HomeCategoryFeedDTO,
  HomeFeedDTO,
  PaginatedArticlesDTO,
} from "@portal-corinthians/contracts";
import { Injectable, NotFoundException } from "@nestjs/common";
import { MatchStatusTone } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { GNewsClient } from "./gnews.client";
import {
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
import { CATEGORY_META, assertCategorySlug } from "./categories";

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gNewsClient: GNewsClient,
  ) {}

  async getHomeFeed(upcomingMatch: HomeFeedDTO["upcomingMatch"]): Promise<HomeFeedDTO> {
    const [featuredCandidates, latestRecords, mostReadRecords] = await Promise.all([
      this.prisma.article.findMany({
        where: { isActive: true },
        take: 8,
        orderBy: [{ featuredRank: "desc" }, { publishedAt: "desc" }],
        include: { source: true },
      }),
      this.prisma.article.findMany({
        where: { isActive: true },
        take: 6,
        orderBy: { publishedAt: "desc" },
        include: { source: true },
      }),
      this.prisma.article.findMany({
        where: { isActive: true },
        take: 3,
        orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
        include: { source: true },
      }),
    ]);

    const featured = featuredCandidates[0] ? toArticleListItemDTO(featuredCandidates[0]) : null;
    const highlights = featuredCandidates.slice(1, 4).map(toArticleListItemDTO);
    const latest = latestRecords.map(toArticleListItemDTO);
    const mostRead = mostReadRecords.map(toArticleListItemDTO);

    const usedIds = new Set(
      [featured?.id, ...highlights.map((item) => item.id), ...mostRead.map((item) => item.id)].filter(Boolean),
    );

    const spotlight = featuredCandidates
      .filter((article) => !usedIds.has(article.id))
      .slice(0, 3)
      .map(toArticleListItemDTO);

    const categories = await this.getHomeCategoryFeeds();

    return {
      featured,
      highlights,
      latest,
      mostRead,
      spotlight,
      categories,
      upcomingMatch,
      updatedAt: new Date().toISOString(),
    };
  }

  async getHomeCategoryFeeds(): Promise<HomeCategoryFeedDTO[]> {
    const feeds = await Promise.all(
      Object.keys(CATEGORY_META).map(async (category) => {
        const slug = category as CategorySlug;
        const items = await this.prisma.article.findMany({
          where: { isActive: true, category: slug },
          take: 4,
          orderBy: { publishedAt: "desc" },
          include: { source: true },
        });

        return {
          category: CATEGORY_META[slug],
          items: items.map(toArticleListItemDTO),
        };
      }),
    );

    return feeds;
  }

  async getArticleBySlug(slug: string): Promise<ArticleDetailDTO> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { source: true },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    const related = await this.prisma.article.findMany({
      where: {
        isActive: true,
        category: article.category,
        id: { not: article.id },
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
      include: { source: true },
    });

    return toArticleDetailDTO(article, related);
  }

  async getCategoryArticles(slugValue: string, page = 1, limit = 12): Promise<PaginatedArticlesDTO> {
    const slug = assertCategorySlug(slugValue);
    const skip = Math.max(0, (page - 1) * limit);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where: { isActive: true, category: slug },
        take: limit,
        skip,
        orderBy: { publishedAt: "desc" },
        include: { source: true },
      }),
      this.prisma.article.count({
        where: { isActive: true, category: slug },
      }),
    ]);

    return {
      category: CATEGORY_META[slug],
      items: items.map(toArticleListItemDTO),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async syncLatestArticles() {
    const liveArticles = await this.gNewsClient.fetchLatestCorinthiansArticles();
    let processed = 0;

    for (const liveArticle of liveArticles) {
      const title = normalizeHeadline(liveArticle.title);
      const category = inferCategory(title, liveArticle.description);
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

      const body = buildArticleBody(
        buildEditorialSummary(liveArticle.description, title),
        category,
        liveArticle.sourceName,
      );
      const badge = getBadgeForCategory(category);
      const slug = createArticleSlug(title);
      const existing = await this.prisma.article.findFirst({
        where: {
          OR: [
            { originalUrl: liveArticle.url },
            { canonicalUrl: liveArticle.canonicalUrl },
            { slug },
          ],
        },
      });

      const articleData = {
        slug,
        title,
        dek: buildEditorialSummary(liveArticle.description, title),
        summary: buildEditorialSummary(liveArticle.description, title),
        body,
        originalUrl: liveArticle.url,
        canonicalUrl: liveArticle.canonicalUrl,
        imageUrl: liveArticle.imageUrl,
        imageAlt: title,
        category,
        publishedAt: liveArticle.publishedAt,
        readTime: estimateReadTime(body),
        badge: badge.badge,
        badgeLabel: badge.badgeLabel,
        tone: toPrismaTone(getToneForCategory(category)),
        featuredRank: getFeaturedRank(category),
        isActive: true,
        sourceId: source.id,
        syncedAt: new Date(),
      } as const;

      if (existing) {
        await this.prisma.article.update({
          where: { id: existing.id },
          data: articleData,
        });
      } else {
        await this.prisma.article.create({
          data: articleData,
        });
      }

      processed += 1;
    }

    return processed;
  }
}

function getFeaturedRank(category: CategorySlug) {
  if (category === "profissional") return 100;
  if (category === "mercado") return 80;
  if (category === "feminino") return 70;
  if (category === "torcida") return 60;
  if (category === "clube") return 50;
  return 40;
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
