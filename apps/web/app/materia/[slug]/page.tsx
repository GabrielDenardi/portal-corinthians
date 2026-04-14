import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleViewTracker } from "@/components/news/article-view-tracker";
import { NewsCard } from "@/components/news/news-card";
import { StoryMedia } from "@/components/news/story-media";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, ClockIcon, NewspaperIcon } from "@/components/ui/icons";
import { getArticlePageContent } from "@/lib/api/content";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getArticlePageContent(slug);

  if (!content) {
    return {
      title: "Matéria não encontrada",
    };
  }

  return {
    title: content.article.title,
    description: content.article.subheadline,
    openGraph: {
      title: content.article.title,
      description: content.article.subheadline,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const content = await getArticlePageContent(slug);

  if (!content) {
    notFound();
  }

  const { article, relatedArticles } = content;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.subheadline,
    datePublished: article.publishedAt,
    articleSection: article.categoryLabel,
    mainEntityOfPage: article.share?.url ?? `/materia/${article.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Portal Corinthians",
    },
  };

  return (
    <main className="flex-1 bg-app">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ArticleViewTracker slug={article.slug} />

      <section className="border-b border-white/8 bg-surface">
        <Container className="py-14 md:py-16">
          <nav className="flex flex-wrap gap-2 text-sm text-ink-secondary">
            {(article.breadcrumbs ?? []).map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 max-w-4xl">
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
              {article.viewCount ? <span className="inline-flex items-center gap-2">{article.viewCount} views</span> : null}
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
                <p className="editorial-kicker">Fonte e contexto</p>
                <div className="mt-5 space-y-3">
                  <p className="type-body text-ink-secondary">{article.sourceContext?.note}</p>
                  {article.sourceContext?.originalTitle ? (
                    <p className="type-body text-ink-secondary">
                      Título original: <span className="text-white">{article.sourceContext.originalTitle}</span>
                    </p>
                  ) : null}
                </div>
                <div className="mt-5 flex flex-col gap-3">
                  <Link href="/" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                    Voltar para home
                  </Link>
                  <Link
                    href={`/categorias/${article.categoryId}`}
                    className={buttonStyles({ variant: "ghost", size: "lg" })}
                  >
                    Ver editoria
                  </Link>
                  {article.originalUrl ? (
                    <a
                      href={article.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonStyles({ variant: "ghost", size: "lg" })}
                    >
                      Fonte original
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
                <p className="editorial-kicker">Compartilhar</p>
                <div className="mt-5 flex flex-col gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.share?.title ?? article.title)}&url=${encodeURIComponent(article.share?.url ?? `/materia/${article.slug}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonStyles({ variant: "secondary", size: "lg" })}
                  >
                    Compartilhar matéria
                  </a>
                </div>
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
            <Link href={`/categorias/${article.categoryId}`} className={buttonStyles({ variant: "ghost", size: "md" })}>
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
