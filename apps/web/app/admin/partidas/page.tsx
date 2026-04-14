import Link from "next/link";

import { fetchAdminApi } from "@/lib/api/admin";

export default async function AdminMatchesPage() {
  const matches = await fetchAdminApi<
    Array<{
      id: string;
      competition: string;
      round: string;
      kickOff: string;
      homeTeam: { name: string };
      awayTeam: { name: string };
    }>
  >("/admin/matches");

  return (
    <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
      <p className="editorial-kicker">Partidas</p>
      <h2 className="type-display mt-4 text-white">Cobertura manual</h2>
      <div className="mt-6 grid gap-4">
        {(matches ?? []).map((match) => (
          <Link
            key={match.id}
            href={`/admin/partidas/${match.id}`}
            className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-5 transition-colors hover:border-white/20"
          >
            <p className="editorial-kicker">{match.competition}</p>
            <h3 className="type-h3 mt-3 text-white">
              {match.homeTeam.name} x {match.awayTeam.name}
            </h3>
            <p className="type-body mt-2 text-ink-secondary">
              {match.round} · {new Date(match.kickOff).toLocaleString("pt-BR")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
