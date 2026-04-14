import { createHash, randomBytes, scryptSync } from "node:crypto";

import { MatchStatusTone, PrismaClient, UserRole } from "@prisma/client";

import {
  articleFixtures,
  categoryFixtures,
  homeSlotFixtures,
  incomingStoryFixtures,
  matchFixtures,
  teamFixtures,
  userFixtures,
} from "./fixtures";

const prisma = new PrismaClient();

async function main() {
  const categoryBySlug = new Map<string, string>();
  const sourceByName = new Map<string, string>();
  const articleBySlug = new Map<string, string>();
  const teamByNormalizedName = new Map<string, string>();

  for (const category of categoryFixtures) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        label: category.label,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: category,
    });
    categoryBySlug.set(category.slug, record.id);
  }

  for (const user of userFixtures) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: toPrismaRole(user.role),
        passwordHash: hashPassword(user.password),
      },
      create: {
        email: user.email,
        name: user.name,
        role: toPrismaRole(user.role),
        passwordHash: hashPassword(user.password),
      },
    });
  }

  for (const article of articleFixtures) {
    const source = await prisma.articleSource.upsert({
      where: {
        name_baseUrl: {
          name: article.sourceName,
          baseUrl: new URL(article.originalUrl).origin,
        },
      },
      update: {},
      create: {
        name: article.sourceName,
        baseUrl: new URL(article.originalUrl).origin,
      },
    });
    sourceByName.set(article.sourceName, source.id);

    const record = await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        dek: article.dek,
        summary: article.summary,
        body: article.body,
        originalUrl: article.originalUrl,
        canonicalUrl: article.canonicalUrl,
        imageUrl: article.imageUrl,
        imageAlt: article.imageAlt,
        categoryId: categoryBySlug.get(article.categorySlug)!,
        publishedAt: article.publishedAt,
        readTime: article.readTime,
        badge: article.badge,
        badgeLabel: article.badgeLabel,
        tone: toPrismaTone(article.tone),
        featuredRank: article.featuredRank,
        sourceId: source.id,
        status: article.status,
        isPinnedHome: article.isPinnedHome,
        syncedAt: new Date(),
      },
      create: {
        slug: article.slug,
        title: article.title,
        dek: article.dek,
        summary: article.summary,
        body: article.body,
        originalTitle: article.title,
        originalUrl: article.originalUrl,
        canonicalUrl: article.canonicalUrl,
        imageUrl: article.imageUrl,
        imageAlt: article.imageAlt,
        categoryId: categoryBySlug.get(article.categorySlug)!,
        publishedAt: article.publishedAt,
        readTime: article.readTime,
        badge: article.badge,
        badgeLabel: article.badgeLabel,
        tone: toPrismaTone(article.tone),
        featuredRank: article.featuredRank,
        sourceId: source.id,
        status: article.status,
        isPinnedHome: article.isPinnedHome,
      },
    });
    articleBySlug.set(article.slug, record.id);
  }

  for (const incoming of incomingStoryFixtures) {
    const source = await prisma.articleSource.upsert({
      where: {
        name_baseUrl: {
          name: incoming.sourceName,
          baseUrl: new URL(incoming.originalUrl).origin,
        },
      },
      update: {},
      create: {
        name: incoming.sourceName,
        baseUrl: new URL(incoming.originalUrl).origin,
      },
    });

    await prisma.incomingStory.upsert({
      where: { originalUrl: incoming.originalUrl },
      update: {
        title: incoming.title,
        summary: incoming.summary,
        originalTitle: incoming.originalTitle,
        canonicalUrl: incoming.canonicalUrl,
        priority: incoming.priority,
        relevance: incoming.relevance,
        sourceId: source.id,
        suggestedCategoryId: categoryBySlug.get(incoming.suggestedCategorySlug)!,
        fingerprint: storyFingerprint(incoming.title, incoming.originalUrl, incoming.sourceName),
      },
      create: {
        slug: slugify(incoming.title),
        title: incoming.title,
        summary: incoming.summary,
        originalTitle: incoming.originalTitle,
        canonicalUrl: incoming.canonicalUrl,
        originalUrl: incoming.originalUrl,
        sourceId: source.id,
        suggestedCategoryId: categoryBySlug.get(incoming.suggestedCategorySlug)!,
        priority: incoming.priority,
        relevance: incoming.relevance,
        publishedAt: new Date(incoming.publishedAt),
        fingerprint: storyFingerprint(incoming.title, incoming.originalUrl, incoming.sourceName),
      },
    });
  }

  for (const team of teamFixtures) {
    const record = await prisma.team.upsert({
      where: {
        normalizedName: team.normalizedName,
      },
      update: {
        externalId: team.externalId,
        name: team.name,
        shortName: team.shortName,
        badgeUrl: team.badgeUrl,
        country: team.country,
        sport: team.sport,
        alternateNames: team.alternateNames,
        sourceUpdatedAt: new Date(),
      },
      create: {
        externalId: team.externalId,
        name: team.name,
        normalizedName: team.normalizedName,
        shortName: team.shortName,
        badgeUrl: team.badgeUrl,
        country: team.country,
        sport: team.sport,
        alternateNames: team.alternateNames,
        sourceUpdatedAt: new Date(),
      },
    });
    teamByNormalizedName.set(team.normalizedName, record.id);
  }

  for (const slot of homeSlotFixtures) {
    await prisma.homeSlot.upsert({
      where: { slotKey: slot.slotKey },
      update: {
        articleId: slot.articleSlug ? articleBySlug.get(slot.articleSlug) ?? null : null,
      },
      create: {
        slotKey: slot.slotKey,
        articleId: slot.articleSlug ? articleBySlug.get(slot.articleSlug) ?? null : null,
      },
    });
  }

  for (const fixture of matchFixtures) {
    const match = await prisma.match.upsert({
      where: { externalId: fixture.externalId },
      update: {
        competition: fixture.competition,
        round: fixture.round,
        venue: fixture.venue,
        kickOff: fixture.kickOff,
        broadcast: fixture.broadcast,
        note: fixture.note,
        statusLabel: fixture.statusLabel,
        statusTone: toPrismaTone(fixture.statusTone),
        homeTeamId: teamByNormalizedName.get(fixture.homeTeamNormalizedName)!,
        awayTeamId: teamByNormalizedName.get(fixture.awayTeamNormalizedName)!,
      },
      create: {
        externalId: fixture.externalId,
        competition: fixture.competition,
        round: fixture.round,
        venue: fixture.venue,
        kickOff: fixture.kickOff,
        broadcast: fixture.broadcast,
        note: fixture.note,
        statusLabel: fixture.statusLabel,
        statusTone: toPrismaTone(fixture.statusTone),
        homeTeamId: teamByNormalizedName.get(fixture.homeTeamNormalizedName)!,
        awayTeamId: teamByNormalizedName.get(fixture.awayTeamNormalizedName)!,
      },
    });

    await prisma.matchCoverage.upsert({
      where: { matchId: match.id },
      update: {
        phase: fixture.coverage.phase,
        scoreHome: fixture.coverage.scoreHome,
        scoreAway: fixture.coverage.scoreAway,
        stadium: fixture.coverage.stadium,
        competitionStage: fixture.coverage.competitionStage,
      },
      create: {
        matchId: match.id,
        phase: fixture.coverage.phase,
        scoreHome: fixture.coverage.scoreHome,
        scoreAway: fixture.coverage.scoreAway,
        stadium: fixture.coverage.stadium,
        competitionStage: fixture.coverage.competitionStage,
      },
    });

    const coverage = await prisma.matchCoverage.findUniqueOrThrow({
      where: { matchId: match.id },
    });

    await prisma.matchTimelineEvent.deleteMany({ where: { coverageId: coverage.id } });
    await prisma.matchOfficial.deleteMany({ where: { coverageId: coverage.id } });
    await prisma.matchLineup.deleteMany({ where: { coverageId: coverage.id } });

    for (const [index, event] of fixture.coverage.timeline.entries()) {
      await prisma.matchTimelineEvent.create({
        data: {
          coverageId: coverage.id,
          sortOrder: index,
          minute: event.minute,
          type: event.type,
          teamSide: event.teamSide,
          title: event.title,
          description: event.description,
        },
      });
    }

    for (const [index, official] of fixture.coverage.officials.entries()) {
      await prisma.matchOfficial.create({
        data: {
          coverageId: coverage.id,
          sortOrder: index,
          role: official.role,
          name: official.name,
        },
      });
    }

    for (const [index, lineup] of fixture.coverage.lineups.entries()) {
      await prisma.matchLineup.create({
        data: {
          coverageId: coverage.id,
          sortOrder: index,
          teamSide: lineup.teamSide,
          section: lineup.section,
          playerName: lineup.playerName,
          shirtNumber: lineup.shirtNumber,
          role: lineup.role,
        },
      });
    }
  }
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function storyFingerprint(title: string, url: string, sourceName: string) {
  return createHash("sha256").update(`${title}|${url}|${sourceName}`).digest("hex");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toPrismaRole(value: "admin" | "editor") {
  return value === "admin" ? UserRole.admin : UserRole.editor;
}

function toPrismaTone(value: "default" | "alert" | "success" | "warning") {
  if (value === "alert") return MatchStatusTone.alert;
  if (value === "success") return MatchStatusTone.success;
  if (value === "warning") return MatchStatusTone.warning;
  return MatchStatusTone.default;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
