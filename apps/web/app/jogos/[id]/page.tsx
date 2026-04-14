import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsCard } from "@/components/news/news-card";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getMatchPageContent } from "@/lib/api/content";

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getMatchPageContent(id);

  if (!content) {
    return {
      title: "Partida não encontrada",
    };
  }

  return {
    title: `${content.match.homeTeam} x ${content.match.awayTeam}`,
    description: content.match.note,
    openGraph: {
      title: `${content.match.homeTeam} x ${content.match.awayTeam}`,
      description: content.match.note,
      type: "article",
    },
  };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const content = await getMatchPageContent(id);

  if (!content) {
    notFound();
  }

  const { match } = content;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${match.homeTeam} x ${match.awayTeam}`,
    startDate: match.kickOff,
    location: {
      "@type": "Place",
      name: match.stadium ?? match.venue,
    },
    eventStatus: match.coveragePhase === "post" ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
    description: match.note,
  };

  return (
    <main className="flex-1 bg-app">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <section className="border-b border-white/8 bg-surface">
        <Container className="py-14 md:py-16">
          <nav className="flex flex-wrap gap-2 text-sm text-ink-secondary">
            {match.breadcrumbs.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Badge variant={match.coveragePhase === "live" ? "live" : match.coveragePhase === "post" ? "status" : "breaking"}>
              {match.statusLabel}
            </Badge>
            <p className="editorial-kicker">{match.competition}</p>
          </div>
          <h1 className="type-display mt-5 max-w-4xl text-balance text-white">
            {match.homeTeam} x {match.awayTeam}
          </h1>
          <p className="type-body-lg mt-6 max-w-3xl text-ink-secondary">{match.note}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <InfoCard label="Fase" value={match.round} />
            <InfoCard label="Placar" value={`${match.scoreHome ?? "-"} x ${match.scoreAway ?? "-"}`} />
            <InfoCard label="Estádio" value={match.stadium ?? match.venue} />
            <InfoCard label="Competição" value={match.competitionStage ?? match.competition} />
          </div>
        </Container>
      </section>

      <section className="border-b border-white/8 bg-app">
        <Container className="py-12 md:py-14">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_0.8fr]">
            <div className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
              <p className="editorial-kicker">Timeline</p>
              <div className="mt-5 space-y-4">
                {match.timeline.length ? (
                  match.timeline.map((event) => (
                    <article key={event.id} className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
                      <p className="editorial-kicker">{event.minute}</p>
                      <h2 className="type-h3 mt-3 text-white">{event.title}</h2>
                      <p className="type-body mt-2 text-ink-secondary">{event.description}</p>
                    </article>
                  ))
                ) : (
                  <p className="type-body text-ink-secondary">Timeline ainda sem eventos registrados.</p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
                <p className="editorial-kicker">Arbitragem</p>
                <div className="mt-4 space-y-3">
                  {match.officials.length ? (
                    match.officials.map((official) => (
                      <p key={`${official.role}-${official.name}`} className="type-body text-ink-secondary">
                        <span className="text-white">{official.role}:</span> {official.name}
                      </p>
                    ))
                  ) : (
                    <p className="type-body text-ink-secondary">Arbitragem ainda não informada.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
                <p className="editorial-kicker">Escalações</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <LineupBlock title={match.homeTeam} entries={match.lineups.filter((entry) => entry.teamSide === "home")} />
                  <LineupBlock title={match.awayTeam} entries={match.lineups.filter((entry) => entry.teamSide === "away")} />
                </div>
              </div>

              <div className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
                <p className="editorial-kicker">Compartilhamento</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(match.share.title)}&url=${encodeURIComponent(match.share.url)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonStyles({ variant: "secondary" })}
                  >
                    Compartilhar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface">
        <Container className="py-12 md:py-14">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="editorial-kicker">Relacionadas</p>
              <h2 className="type-h2 mt-3 text-white">Matérias do contexto</h2>
            </div>
            <Link href="/jogos" className={buttonStyles({ variant: "ghost" })}>
              Voltar para jogos
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {match.relatedArticles.map((story) => (
              <NewsCard key={story.id} story={story} layout="vertical" />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-white/8 bg-card/72 p-4 shadow-[var(--shadow-card)]">
      <p className="editorial-kicker">{label}</p>
      <p className="type-body-lg mt-3 text-white">{value}</p>
    </article>
  );
}

function LineupBlock({
  title,
  entries,
}: {
  title: string;
  entries: Array<{ id: string; playerName: string; shirtNumber?: string | null; role?: string | null }>;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
      <p className="editorial-kicker">{title}</p>
      <div className="mt-3 space-y-2">
        {entries.length ? (
          entries.map((entry) => (
            <p key={entry.id} className="type-body text-ink-secondary">
              <span className="text-white">{entry.playerName}</span>
              {entry.shirtNumber ? ` · ${entry.shirtNumber}` : ""}
              {entry.role ? ` · ${entry.role}` : ""}
            </p>
          ))
        ) : (
          <p className="type-body text-ink-secondary">Sem escalação registrada.</p>
        )}
      </div>
    </div>
  );
}
