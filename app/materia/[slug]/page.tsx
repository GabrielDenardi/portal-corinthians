import Link from "next/link";
import type { Metadata } from "next";

import { NewsCard } from "@/components/news/news-card";
import { StoryMedia } from "@/components/news/story-media";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, ClockIcon, NewspaperIcon } from "@/components/ui/icons";
import { articleStories, getRelatedArticles, requireArticleBySlug } from "@/content/articles";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articleStories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = requireArticleBySlug(slug);

  return {
    title: article.title,
    description: article.subheadline,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = requireArticleBySlug(slug);
  const relatedArticles = getRelatedArticles(article);

  return (
    <main className="flex-1 bg-app">
      <section className="border-b border-white/8 bg-surface">
        <Container className="py-14 md:py-16">
          <div className="max-w-4xl">
            <Badge variant={article.badge ?? "category"}>
              {article.badgeLabel ?? article.categoryLabel}
            </Badge>
            <h1 className="type-display mt-5 max-w-5xl text-balance text-white">{article.title}</h1>
            <p className="type-body-lg mt-6 max-w-3xl text-ink-secondary">{article.subheadline}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-2">
                <NewspaperIcon className="size-4" />
                {article.source}
              </span>
              <span className="inline-flex items-center gap-2">
                <ClockIcon className="size-4" />
                {article.publishedAt}
              </span>
              <span className="inline-flex items-center gap-2">{article.readTime}</span>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-white/8 bg-app">
        <Container className="py-10 md:py-12">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_360px]">
            <article className="min-w-0">
              <StoryMedia
                title={article.title}
                categoryLabel={article.categoryLabel}
                badgeLabel={article.badgeLabel}
                image={article.image}
                imageAlt={article.imageAlt}
                tone={article.tone}
                layout="hero"
              />

              <div className="mt-8 rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
                <div className="space-y-5">
                  {article.body.map((paragraph) => (
                    <p key={paragraph} className="type-body-lg text-ink-secondary">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </article>

            <aside className="space-y-5">
              <div className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
                <p className="editorial-kicker">Navegação</p>
                <div className="mt-5 flex flex-col gap-3">
                  <Link href="/" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                    Voltar para home
                  </Link>
                  <Link href="/#ultimas" className={buttonStyles({ variant: "ghost", size: "lg" })}>
                    Ver últimas notícias
                  </Link>
                </div>
              </div>

              <div className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
                <p className="editorial-kicker">Categoria</p>
                <h2 className="type-h3 mt-4 text-white">{article.categoryLabel}</h2>
                <p className="type-body mt-3 text-ink-secondary">
                  Matéria organizada dentro da editoria {article.categoryLabel.toLowerCase()}, mantendo
                  o mesmo padrão visual e editorial da home.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-surface">
        <Container className="py-12 md:py-14">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="editorial-kicker">Continuidade</p>
              <h2 className="type-h2 mt-3 text-white">Matérias relacionadas</h2>
            </div>
            <Link href="/#destaques" className={buttonStyles({ variant: "ghost", size: "md" })}>
              Ver mais
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedArticles.map((story) => (
              <NewsCard key={story.id} story={story} layout="vertical" />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
