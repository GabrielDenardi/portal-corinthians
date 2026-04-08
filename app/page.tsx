import { CategoryTabs } from "@/components/news/category-tabs";
import { FeaturedNewsCard } from "@/components/news/featured-news-card";
import { MatchCard } from "@/components/news/match-card";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  featuredStory,
  latestStories,
  mostReadStories,
  newsByCategory,
  newsCategories,
  secondaryHighlights,
  spotlightStories,
  upcomingMatch,
} from "@/content/home";

export default function Home() {
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
                  Mercado em observação, Neo Química em alta procura e o time principal ajustando o
                  ritmo sem bola para chegar mais agressivo ao clássico.
                </p>
              </div>

              {secondaryHighlights.map((story) => (
                <NewsCard key={story.id} story={story} layout="compact" />
              ))}
            </aside>
          </div>
        </Container>
      </section>

      <section
        id="proximo-jogo"
        className="border-b border-white/8 bg-surface scroll-mt-28"
      >
        <Container className="py-14 md:py-16">
          <SectionHeading
            eyebrow="Agenda em evidência"
            title="Próximo jogo"
            action={
              <Button variant="ghost">
                Ver cobertura
                <ArrowRightIcon className="size-4" />
              </Button>
            }
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_0.8fr]">
            <MatchCard match={upcomingMatch} />

            <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-5 shadow-[var(--shadow-card)]">
              <p className="editorial-kicker">O que observar</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
                  <p className="type-body-sm text-white">Pressão inicial</p>
                  <p className="type-body mt-2 text-ink-secondary">
                    O Corinthians quer os primeiros 20 minutos em bloco alto, com recuperação curta e
                    aceleração imediata para ocupar área.
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
                  <p className="type-body-sm text-white">Corredor esquerdo</p>
                  <p className="type-body mt-2 text-ink-secondary">
                    A semana indicou mais profundidade naquele lado, explorando amplitude e cruzamento
                    atrasado como saída.
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
                  <p className="type-body-sm text-white">Arquibancada</p>
                  <p className="type-body mt-2 text-ink-secondary">
                    A atmosfera do estádio deve ser componente ativo da partida, e o portal acompanha o
                    ambiente desde a abertura dos portões.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="ultimas" className="border-b border-white/8 bg-app scroll-mt-28">
        <Container className="py-14 md:py-16">
          <SectionHeading
            eyebrow="Leitura rápida"
            title="Últimas notícias"
          />

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
              <SectionHeading
                eyebrow="Editoriais de apoio"
                title="Mais lidas"
              />
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
