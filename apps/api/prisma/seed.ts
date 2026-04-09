import { MatchStatusTone, PrismaClient } from "@prisma/client";

import { articleFixtures, teamFixtures } from "./fixtures";

const prisma = new PrismaClient();

async function main() {
  for (const team of teamFixtures) {
    await prisma.team.upsert({
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

    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        dek: article.dek,
        summary: article.summary,
        body: article.body,
        originalUrl: article.originalUrl,
        canonicalUrl: article.originalUrl,
        imageUrl: article.imageUrl,
        imageAlt: article.imageAlt,
        category: article.category,
        publishedAt: article.publishedAt,
        readTime: article.readTime,
        badge: article.badge,
        badgeLabel: article.badgeLabel,
        tone: toPrismaTone(article.tone),
        featuredRank: article.featuredRank,
        sourceId: source.id,
        syncedAt: new Date(),
      },
      create: {
        slug: article.slug,
        title: article.title,
        dek: article.dek,
        summary: article.summary,
        body: article.body,
        originalUrl: article.originalUrl,
        canonicalUrl: article.originalUrl,
        imageUrl: article.imageUrl,
        imageAlt: article.imageAlt,
        category: article.category,
        publishedAt: article.publishedAt,
        readTime: article.readTime,
        badge: article.badge,
        badgeLabel: article.badgeLabel,
        tone: toPrismaTone(article.tone),
        featuredRank: article.featuredRank,
        sourceId: source.id,
      },
    });
  }

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
