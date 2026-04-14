import type {
  ArticleEditorDTO,
  AuditLogDTO,
  CategoryDTO,
  HomeSlotAssignmentDTO,
  IncomingStoryDTO,
  ProviderHealthDTO,
  UserListItemDTO,
} from "@portal-corinthians/contracts";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { toCategoryDTO } from "../articles/article.helpers";
import { ArticlesService } from "../articles/articles.service";
import { AuthService } from "../auth/auth.service";
import type { AuthenticatedSession } from "../auth/auth.types";
import { MatchesService } from "../matches/matches.service";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly articlesService: ArticlesService,
    private readonly matchesService: MatchesService,
    private readonly authService: AuthService,
  ) {}

  async listInbox(): Promise<IncomingStoryDTO[]> {
    const stories = await this.prisma.incomingStory.findMany({
      orderBy: [{ status: "asc" }, { priority: "desc" }, { publishedAt: "desc" }],
      include: {
        source: true,
        suggestedCategory: true,
      },
    });

    return stories.map((story) => ({
      id: story.id,
      title: story.title,
      summary: story.summary,
      sourceName: story.source.name,
      sourceUrl: story.originalUrl,
      publishedAt: story.publishedAt.toISOString(),
      status: story.status,
      suggestedCategory: toCategoryDTO(story.suggestedCategory),
      matchedArticleId: story.articleId,
      priority: story.priority,
      relevance: story.relevance,
    }));
  }

  async approveIncomingStory(id: string, actor: AuthenticatedSession) {
    const article = await this.articlesService.createDraftFromIncomingStory(id);
    await this.audit(actor, "incoming_story.approve", "IncomingStory", id, `article:${article.id}`);
    return this.getArticleEditor(article.id);
  }

  async rejectIncomingStory(id: string, actor: AuthenticatedSession) {
    const story = await this.prisma.incomingStory.findUnique({ where: { id } });

    if (!story) {
      throw new NotFoundException("Incoming story not found");
    }

    await this.prisma.incomingStory.update({
      where: { id },
      data: { status: "rejected" },
    });
    await this.audit(actor, "incoming_story.reject", "IncomingStory", id);
    return { success: true };
  }

  async listArticles(): Promise<ArticleEditorDTO[]> {
    const articles = await this.prisma.article.findMany({
      orderBy: [{ updatedAt: "desc" }],
      include: {
        source: true,
        category: true,
        pinnedCategories: { include: { category: true } },
      },
    });

    return articles.map((article) => toArticleEditorDTO(article));
  }

  async getArticleEditor(id: string): Promise<ArticleEditorDTO> {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        source: true,
        category: true,
        pinnedCategories: { include: { category: true } },
      },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    return toArticleEditorDTO(article);
  }

  async updateArticle(
    id: string,
    input: {
      title?: string;
      dek?: string;
      summary?: string;
      body?: string[] | string;
      categoryId?: string;
      featuredRank?: number;
      sortOrder?: number;
      isPinnedHome?: boolean;
      pinnedCategoryIds?: string[];
      action?: "save" | "approve" | "publish" | "unpublish" | "archive";
    },
    actor: AuthenticatedSession,
  ) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: { category: true, source: true, pinnedCategories: true },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    if ((input.action === "publish" || input.action === "unpublish") && actor.user.role !== "admin") {
      throw new ForbiddenException("Somente admin pode publicar");
    }

    const normalizedBody = normalizeBodyInput(input.body ?? article.body);
    const status =
      input.action === "approve"
        ? "approved"
        : input.action === "publish"
          ? "published"
          : input.action === "archive"
            ? "archived"
            : input.action === "unpublish"
              ? "approved"
              : undefined;

    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        title: input.title ?? article.title,
        slug: input.title ? slugify(input.title) : article.slug,
        dek: input.dek ?? article.dek,
        summary: input.summary ?? article.summary,
        body: normalizedBody,
        categoryId: input.categoryId ?? article.categoryId,
        readTime: estimateReadTime(normalizedBody),
        featuredRank: input.featuredRank ?? article.featuredRank,
        sortOrder: input.sortOrder ?? article.sortOrder,
        isPinnedHome: input.isPinnedHome ?? article.isPinnedHome,
        ...(status ? { status } : {}),
        ...(input.action === "approve" ? { approvedAt: new Date(), approvedById: actor.user.id } : {}),
        ...(input.action === "publish"
          ? { publishedAt: article.publishedAt ?? new Date(), publishedById: actor.user.id, unpublishedAt: null }
          : {}),
        ...(input.action === "unpublish" ? { unpublishedAt: new Date() } : {}),
      },
      include: {
        source: true,
        category: true,
        pinnedCategories: { include: { category: true } },
      },
    });

    if (input.pinnedCategoryIds) {
      await this.prisma.pinnedArticle.deleteMany({ where: { articleId: id } });
      for (const categoryId of input.pinnedCategoryIds) {
        await this.prisma.pinnedArticle.create({
          data: {
            articleId: id,
            categoryId,
          },
        });
      }
    }

    await this.audit(actor, "article.update", "Article", id, input.action ?? "save");
    return this.getArticleEditor(updated.id);
  }

  async listCategories(): Promise<CategoryDTO[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return categories.map(toCategoryDTO);
  }

  async upsertCategory(
    input: { id?: string; slug: string; label: string; description: string; sortOrder?: number; isActive?: boolean },
    actor: AuthenticatedSession,
  ) {
    const category = input.id
      ? await this.prisma.category.update({
          where: { id: input.id },
          data: {
            slug: input.slug,
            label: input.label,
            description: input.description,
            sortOrder: input.sortOrder ?? 0,
            isActive: input.isActive ?? true,
          },
        })
      : await this.prisma.category.create({
          data: {
            slug: input.slug,
            label: input.label,
            description: input.description,
            sortOrder: input.sortOrder ?? 0,
            isActive: input.isActive ?? true,
          },
        });

    await this.audit(actor, "category.upsert", "Category", category.id, category.slug);
    return toCategoryDTO(category);
  }

  async listHomeSlots(): Promise<HomeSlotAssignmentDTO[]> {
    const slots = await this.prisma.homeSlot.findMany({
      orderBy: { slotKey: "asc" },
    });

    return slots.map((slot) => ({
      slot: slot.slotKey as HomeSlotAssignmentDTO["slot"],
      articleId: slot.articleId,
    }));
  }

  async updateHomeSlots(assignments: HomeSlotAssignmentDTO[], actor: AuthenticatedSession) {
    ensureAdmin(actor);
    for (const assignment of assignments) {
      await this.prisma.homeSlot.upsert({
        where: { slotKey: assignment.slot },
        update: {
          articleId: assignment.articleId ?? null,
        },
        create: {
          slotKey: assignment.slot,
          articleId: assignment.articleId ?? null,
        },
      });
    }

    await this.audit(actor, "home_slots.update", "HomeSlot", "all");
    return this.listHomeSlots();
  }

  async listMatches() {
    return this.matchesService.listManagedMatches();
  }

  async getMatch(id: string) {
    return this.matchesService.getMatchDetail(id);
  }

  async updateMatch(
    id: string,
    input: Parameters<MatchesService["updateMatchCoverage"]>[1],
    actor: AuthenticatedSession,
  ) {
    const updated = await this.matchesService.updateMatchCoverage(id, input);
    await this.audit(actor, "match.update", "Match", id, input.phase);
    return updated;
  }

  async listUsers(): Promise<UserListItemDTO[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    }));
  }

  async upsertUser(
    input: { email: string; name: string; role: "admin" | "editor"; password?: string },
    actor: AuthenticatedSession,
  ) {
    ensureAdmin(actor);
    const user = await this.authService.upsertUser(input);
    await this.audit(actor, "user.upsert", "User", user.id, user.email);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    } satisfies UserListItemDTO;
  }

  async listAuditLogs(): Promise<AuditLogDTO[]> {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { actor: true },
    });

    return logs.map((log) => ({
      id: log.id,
      actorName: log.actor?.name ?? "Sistema",
      actorRole: log.actor?.role ?? "admin",
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      createdAt: log.createdAt.toISOString(),
      details: log.details,
    }));
  }

  async getProviderHealth(): Promise<ProviderHealthDTO[]> {
    const runs = await this.prisma.syncRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    const latestByProvider = new Map<string, (typeof runs)[number]>();

    for (const run of runs) {
      const key = run.provider ?? run.jobName;
      if (!latestByProvider.has(key)) {
        latestByProvider.set(key, run);
      }
    }

    return [...latestByProvider.entries()].map(([provider, run]) => ({
      provider,
      status: run.status === "succeeded" ? "ok" : run.status === "failed" ? "failed" : "degraded",
      lastRunAt: run.finishedAt?.toISOString() ?? run.startedAt.toISOString(),
      lastMessage: run.message,
    }));
  }

  private async audit(
    actor: AuthenticatedSession,
    action: string,
    entityType: string,
    entityId: string,
    details?: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        actorId: actor.user.id,
        action,
        entityType,
        entityId,
        details,
      },
    });
  }
}

function normalizeBodyInput(value: string[] | string | Prisma.JsonValue) {
  if (typeof value === "string") {
    return value
      .split(/\r?\n\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => `${entry}`.trim()).filter(Boolean);
  }

  return [];
}

function estimateReadTime(paragraphs: string[]) {
  const words = paragraphs.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(2, Math.round(words / 180))} min`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureAdmin(actor: AuthenticatedSession) {
  if (actor.user.role !== "admin") {
    throw new ForbiddenException("Somente admin");
  }
}

function toArticleEditorDTO(
  article: Prisma.ArticleGetPayload<{
    include: {
      source: true;
      category: true;
      pinnedCategories: { include: { category: true } };
    };
  }>,
): ArticleEditorDTO {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    summary: article.summary,
    body: normalizeBodyInput(article.body),
    status: article.status,
    featuredRank: article.featuredRank,
    sortOrder: article.sortOrder,
    isPinnedHome: article.isPinnedHome,
    pinnedCategoryIds: article.pinnedCategories.map((entry) => entry.category.id),
    category: {
      id: article.category.id,
      slug: article.category.slug,
      label: article.category.label,
      description: article.category.description,
    },
    sourceName: article.source.name,
    sourceUrl: article.originalUrl,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    imageUrl: article.imageUrl,
    imageAlt: article.imageAlt,
    viewCount: article.viewCount,
    badge: (article.badge as ArticleEditorDTO["badge"]) ?? null,
    badgeLabel: article.badgeLabel,
  };
}
