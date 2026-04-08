import type { MatchInfo } from "@/content/home";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CalendarIcon, ShieldIcon, TrophyIcon } from "@/components/ui/icons";

interface MatchCardProps {
  match: MatchInfo;
}

const statusVariant = {
  default: "category",
  alert: "breaking",
  success: "live",
  warning: "status",
} as const;

export function MatchCard({ match }: MatchCardProps) {
  return (
    <article className="overflow-hidden rounded-[calc(var(--radius-xl)+4px)] border border-white/10 bg-card shadow-[var(--shadow-feature)]">
      <div className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.18),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="editorial-kicker">Radar da rodada</p>
              <h3 className="type-h2 mt-3 text-white">Próximo jogo</h3>
            </div>
            <Badge variant={statusVariant[match.statusTone]}>{match.statusLabel}</Badge>
          </div>

          <div className="mt-8 grid gap-6">
            <div className="grid gap-4 rounded-[var(--radius-lg)] border border-white/8 bg-app/45 p-5">
              <div className="flex flex-wrap items-center gap-3 text-sm text-ink-secondary">
                <span className="inline-flex items-center gap-2">
                  <TrophyIcon className="size-4" />
                  {match.competition}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarIcon className="size-4" />
                  {match.round}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="editorial-kicker">Data</p>
                  <p className="type-body-lg mt-2 text-white">{match.kickOff}</p>
                </div>
                <div>
                  <p className="editorial-kicker">Local</p>
                  <p className="type-body-lg mt-2 text-white">{match.venue}</p>
                </div>
              </div>
              <p className="type-body text-ink-secondary">{match.note}</p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-white/8 bg-white/4 p-5">
                <div className="grid size-16 shrink-0 place-items-center rounded-[var(--radius-lg)] border border-white/10 bg-white/6 lg:size-18">
                  <ShieldIcon className="size-8 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="editorial-kicker">Mandante</p>
                  <p className="font-display text-[clamp(1.4rem,3.6vw,2.4rem)] uppercase leading-none tracking-[0.02em] text-white">
                    {match.homeTeam}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-white/8 bg-white/4 p-5 xl:flex-row-reverse">
                <div className="grid size-16 shrink-0 place-items-center rounded-[var(--radius-lg)] border border-white/10 bg-white/6 lg:size-18">
                  <ShieldIcon className="size-8 text-white/72" />
                </div>
                <div className="min-w-0 xl:text-right">
                  <p className="editorial-kicker">Visitante</p>
                  <p className="font-display text-[clamp(1.4rem,3.6vw,2.4rem)] uppercase leading-none tracking-[0.02em] text-white">
                    {match.awayTeam}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-5">
            <p className="type-body-sm max-w-xl text-ink-secondary">{match.broadcast}</p>
            <Button variant="secondary">
              Acompanhar cobertura
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
