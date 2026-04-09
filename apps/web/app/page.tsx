import Link from "next/link";

import { CategoryTabs } from "@/components/news/category-tabs";
import { FeaturedNewsCard } from "@/components/news/featured-news-card";
import { MatchCard } from "@/components/news/match-card";
import { NewsCard } from "@/components/news/news-card";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { getHomePageContent } from "@/lib/api/content";

export default async function Home() {
  const {
    featuredStory,
    secondaryHighlights,
    latestStories,
    mostReadStories,
    newsByCategory,
    newsCategories,
    spotlightStories,
    upcomingMatch,
  } = await getHomePageContent();

  if (!featuredStory) {
    return null;
  }

  return (
    <main className="flex-1">
      <section
        id="destaque-principal"
        className="relative overflow-hidden border-b border-white/8 bg-app scroll-mt-28"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.22),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_28%)]" />
        <Container className="relative py-10 md:py-14 xl:py-16">
          <div className="max-w-4xl">
            <p className="editorial-kicker">Direto de Itaquera para o torcedor</p>
            <h1 className="type-display mt-5 max-w-4xl text-balance text-white">
              O noticiário do Corinthians organizado com ritmo de redação, leitura rápida e força de
              arquibancada.
            </h1>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_400px] xl:items-start">
            <FeaturedNewsCard story={featuredStory} />

            <aside className="flex flex-col gap-4">
              <div className="rounded-[var(--radius-xl)] border border-white/8 bg-card/65 p-5 shadow-[var(--shadow-card)]">
                <p className="editorial-kicker">Pulso do dia</p>
                <h2 className="type-h3 mt-4 text-white">Movimentos que puxam a cobertura</h2>
                <p className="type-body mt-3 text-ink-secondary">
                  Dados reais do portal agora organizam a home com destaque principal, blocos
                  editoriais e leitura rápida por categoria.
                </p>
              </div>

              {secondaryHighlights.map((story) => (
                <NewsCard key={story.id} story={story} layout="compact" />
              ))}
            </aside>
          </div>
        </Container>
      </section>

      <section id="proximo-jogo" className="border-b border-white/8 bg-surface scroll-mt-28">
        <Container className="py-14 md:py-16">
          <SectionHeading
            eyebrow="Agenda em evidência"
            title="Próximo jogo"
            action={
              <Link href="/jogos" className={buttonStyles({ variant: "ghost" })}>
                Ver cobertura
                <ArrowRightIcon className="size-4" />
              </Link>
            }
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_0.8fr]">
            {upcomingMatch ? <MatchCard match={upcomingMatch} /> : null}

            <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-5 shadow-[var(--shadow-card)]">
              <p className="editorial-kicker">O que observar</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
                  <p className="type-body-sm text-white">Agenda integrada</p>
                  <p className="type-body mt-2 text-ink-secondary">
                    O calendário agora nasce da camada de dados da V2, permitindo próximos jogos,
                    retrospecto recente e atualização automática.
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
                  <p className="type-body-sm text-white">Escudos e adversários</p>
                  <p className="type-body mt-2 text-ink-secondary">
                    O portal resolve clubes e escudos via backend, sem depender de lookup direto no
                    frontend.
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
                  <p className="type-body-sm text-white">Cobertura contínua</p>
                  <p className="type-body mt-2 text-ink-secondary">
                    A home usa o próximo jogo como bloco editorial vivo, integrado à página dedicada de
                    partidas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="ultimas" className="border-b border-white/8 bg-app scroll-mt-28">
        <Container className="py-14 md:py-16">
          <SectionHeading eyebrow="Leitura rápida" title="Últimas notícias" />

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {latestStories.map((story) => (
              <NewsCard key={story.id} story={story} layout="vertical" />
            ))}
          </div>
        </Container>
      </section>

      <section id="categorias" className="border-b border-white/8 bg-surface scroll-mt-28">
        <Container className="py-14 md:py-16">
          <SectionHeading
            eyebrow="Cobertura escalável"
            title="Categorias em evidência"
            action={
              <Link href="/categorias/profissional" className={buttonStyles({ variant: "ghost" })}>
                Abrir editorias
                <ArrowRightIcon className="size-4" />
              </Link>
            }
          />

          <div className="mt-8">
            <CategoryTabs categories={newsCategories} itemsByCategory={newsByCategory} />
          </div>
        </Container>
      </section>

      <section id="destaques" className="bg-app scroll-mt-28">
        <Container className="py-14 md:py-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_0.92fr]">
            <div>
              <SectionHeading eyebrow="Editoriais de apoio" title="Mais lidas" />
              <div className="mt-8 space-y-5">
                {mostReadStories.map((story) => (
                  <NewsCard key={story.id} story={story} layout="horizontal" />
                ))}
              </div>
            </div>

            <div className="rounded-[calc(var(--radius-xl)+6px)] border border-white/8 bg-card/72 p-5 shadow-[var(--shadow-card)]">
              <SectionHeading
                eyebrow="Em destaque"
                title="Radar editorial"
                description="Temas que sustentam continuidade de cobertura e ajudam a distribuir atenção entre campo, gestão e arquibancada."
              />
              <div className="mt-8 space-y-4">
                {spotlightStories.map((story) => (
                  <NewsCard key={story.id} story={story} layout="compact" />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
