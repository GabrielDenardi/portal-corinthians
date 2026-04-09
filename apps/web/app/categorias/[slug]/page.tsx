import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsCard } from "@/components/news/news-card";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { newsCategories } from "@/content/home";
import { getCategoryPageContent } from "@/lib/api/content";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = newsCategories.find((item) => item.id === slug);

  return {
    title: category ? category.label : "Categoria",
    description: category?.description ?? "Cobertura editorial por categoria no Portal Corinthians.",
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page ?? "1");
  const content = await getCategoryPageContent(slug, currentPage, 12);

  if (!content) {
    notFound();
  }

  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < content.totalPages ? currentPage + 1 : null;

  return (
    <main className="flex-1 bg-app">
      <section className="border-b border-white/8 bg-surface">
        <Container className="py-14 md:py-16">
          <p className="editorial-kicker">Editorias</p>
          <h1 className="type-display mt-5 max-w-4xl text-balance text-white">{content.category.label}</h1>
          <p className="type-body-lg mt-6 max-w-3xl text-ink-secondary">{content.category.description}</p>
        </Container>
      </section>

      <section className="bg-app">
        <Container className="py-12 md:py-14">
          <SectionHeading
            eyebrow="Listagem editorial"
            title="Matérias da editoria"
            description={`Página ${content.page} de ${content.totalPages} com ${content.total} itens disponíveis na categoria.`}
            action={
              <Link href="/jogos" className={buttonStyles({ variant: "ghost" })}>
                Ver jogos
                <ArrowRightIcon className="size-4" />
              </Link>
            }
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {content.items.map((story) => (
              <NewsCard key={story.id} story={story} layout="vertical" />
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {previousPage ? (
              <Link
                href={`/categorias/${slug}?page=${previousPage}`}
                className={buttonStyles({ variant: "secondary", size: "md" })}
              >
                Página anterior
              </Link>
            ) : null}
            {nextPage ? (
              <Link
                href={`/categorias/${slug}?page=${nextPage}`}
                className={buttonStyles({ variant: "ghost", size: "md" })}
              >
                Próxima página
              </Link>
            ) : null}
          </div>
        </Container>
      </section>
    </main>
  );
}
