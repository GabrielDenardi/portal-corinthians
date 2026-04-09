import { MatchCard } from "@/components/news/match-card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMatchesPageContent } from "@/lib/api/content";

export default async function JogosPage() {
  const { matches, upcomingMatch } = await getMatchesPageContent();
  const recentMatches = matches.slice(upcomingMatch ? 1 : 0);

  return (
    <main className="flex-1 bg-app">
      <section className="border-b border-white/8 bg-surface">
        <Container className="py-14 md:py-16">
          <p className="editorial-kicker">Jogos</p>
          <h1 className="type-display mt-5 max-w-4xl text-balance text-white">
            Agenda do Corinthians com próximos compromissos e partidas recentes.
          </h1>
          <p className="type-body-lg mt-6 max-w-3xl text-ink-secondary">
            A V2 concentra a agenda em uma página dedicada, com escudos, contexto editorial e atualização
            a partir da camada de dados do portal.
          </p>
        </Container>
      </section>

      <section className="border-b border-white/8 bg-app">
        <Container className="py-12 md:py-14">
          <SectionHeading eyebrow="Agenda principal" title="Próximo jogo" />
          <div className="mt-8">{upcomingMatch ? <MatchCard match={upcomingMatch} /> : null}</div>
        </Container>
      </section>

      <section className="bg-surface">
        <Container className="py-12 md:py-14">
          <SectionHeading
            eyebrow="Sequência"
            title="Demais partidas"
            description="Lista resumida para leitura rápida, com a mesma linguagem visual da home."
          />

          <div className="mt-8 grid gap-4">
            {recentMatches.map((match) => (
              <article
                key={`${match.homeTeam}-${match.awayTeam}-${match.kickOff}`}
                className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="editorial-kicker">{match.competition}</p>
                    <h2 className="type-h3 mt-3 text-white">
                      {match.homeTeam} x {match.awayTeam}
                    </h2>
                    <p className="type-body mt-2 text-ink-secondary">
                      {match.round} · {match.kickOff} · {match.venue}
                    </p>
                  </div>
                  <div className="max-w-xl">
                    <p className="type-body text-ink-secondary">{match.note}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
