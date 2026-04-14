import type { MetadataRoute } from "next";

import { fetchApiJson } from "@/lib/api/base";

const SITE_URL = process.env.PORTAL_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [home, matches] = await Promise.all([
    fetchApiJson<{
      categories: Array<{ category: { slug: string } }>;
      latest: Array<{ slug: string; publishedAt: string }>;
      highlights: Array<{ slug: string; publishedAt: string }>;
      spotlight: Array<{ slug: string; publishedAt: string }>;
      featured: { slug: string; publishedAt: string } | null;
    }>("/public/home", { revalidate: 300 }),
    fetchApiJson<Array<{ id: string }>>("/public/matches?scope=all", { revalidate: 60 }),
  ]);

  const articleEntries = [
    ...(home?.featured ? [home.featured] : []),
    ...(home?.latest ?? []),
    ...(home?.highlights ?? []),
    ...(home?.spotlight ?? []),
  ];
  const seenArticles = new Set<string>();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/jogos`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...(home?.categories ?? []).map((entry) => ({
      url: `${SITE_URL}/categorias/${entry.category.slug}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    ...articleEntries
      .filter((entry) => {
        if (seenArticles.has(entry.slug)) {
          return false;
        }
        seenArticles.add(entry.slug);
        return true;
      })
      .map((entry) => ({
        url: `${SITE_URL}/materia/${entry.slug}`,
        lastModified: entry.publishedAt,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
    ...(matches ?? []).map((match) => ({
      url: `${SITE_URL}/jogos/${match.id}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
  ];
}
