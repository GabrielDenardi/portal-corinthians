import { notFound } from "next/navigation";

import {
  featuredStory,
  latestStories,
  mostReadStories,
  secondaryHighlights,
  spotlightStories,
  type FeaturedStory,
  type NewsItem,
} from "@/content/home";

export interface ArticleStory extends NewsItem {
  slug: string;
  subheadline: string;
  body: string[];
}

function createArticleSlug(story: Pick<NewsItem, "title">) {
  return story.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createBody(story: NewsItem) {
  return [
    `${story.summary} O recorte editorial parte do entendimento de que a notícia precisa chegar ao torcedor com contexto suficiente para leitura rápida, sem perder o peso do assunto principal.`,
    `A cobertura desta pauta acompanha o impacto direto do tema em ${story.categoryLabel.toLowerCase()}, considerando bastidor, momento esportivo e a forma como o assunto se conecta com a rotina do Corinthians no dia.`,
    `A evolução desta matéria também considera atualização contínua: novas informações podem reposicionar o destaque, ampliar o contexto e ajustar a leitura do cenário conforme a apuração avança.`,
  ];
}

function toArticleStory(story: NewsItem | FeaturedStory): ArticleStory {
  const subheadline = "subheadline" in story ? story.subheadline : story.summary;

  return {
    ...story,
    slug: createArticleSlug(story),
    subheadline,
    body: createBody(story),
  };
}

export const articleStories: ArticleStory[] = [
  toArticleStory(featuredStory),
  ...secondaryHighlights.map(toArticleStory),
  ...latestStories.map(toArticleStory),
  ...mostReadStories.map(toArticleStory),
  ...spotlightStories.map(toArticleStory),
];

export function articleHref(story: Pick<NewsItem, "title"> & { slug?: string }) {
  const rawSlug = story.slug;
  const slug =
    rawSlug && !rawSlug.startsWith("#") && !rawSlug.includes("/")
      ? rawSlug
      : createArticleSlug(story);
  return `/materia/${slug}`;
}

export function getArticleBySlug(slug: string) {
  return articleStories.find((story) => story.slug === slug) ?? null;
}

export function getRelatedArticles(article: ArticleStory, limit = 3) {
  return articleStories
    .filter((story) => story.slug !== article.slug && story.categoryId === article.categoryId)
    .slice(0, limit);
}

export function requireArticleBySlug(slug: string) {
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return article;
}
