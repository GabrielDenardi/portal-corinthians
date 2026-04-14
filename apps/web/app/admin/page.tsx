import Link from "next/link";

import { fetchAdminApi } from "@/lib/api/admin";

export default async function AdminDashboardPage() {
  const [inbox, articles, matches, providerHealth] = await Promise.all([
    fetchAdminApi<Array<{ id: string }>>("/admin/inbox"),
    fetchAdminApi<Array<{ id: string }>>("/admin/articles"),
    fetchAdminApi<Array<{ id: string }>>("/admin/matches"),
    fetchAdminApi<Array<{ provider: string; status: string; lastRunAt?: string | null; lastMessage?: string | null }>>(
      "/admin/provider-health",
    ),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
        <p className="editorial-kicker">Visão geral</p>
        <h2 className="type-display mt-4 text-white">Operação editorial</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Inbox" value={`${inbox?.length ?? 0}`} href="/admin/inbox" />
          <StatCard label="Matérias" value={`${articles?.length ?? 0}`} href="/admin/materias" />
          <StatCard label="Partidas" value={`${matches?.length ?? 0}`} href="/admin/partidas" />
          <StatCard label="Providers" value={`${providerHealth?.length ?? 0}`} href="/admin/auditoria" />
        </div>
      </div>

      <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
        <p className="editorial-kicker">Saúde operacional</p>
        <div className="mt-5 grid gap-4">
          {(providerHealth ?? []).map((entry) => (
            <article key={entry.provider} className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="type-h3 text-white">{entry.provider}</h3>
                <span className="editorial-kicker">{entry.status}</span>
              </div>
              <p className="type-body mt-2 text-ink-secondary">
                Última execução: {entry.lastRunAt ?? "sem registro"}
              </p>
              {entry.lastMessage ? <p className="type-body mt-2 text-ink-secondary">{entry.lastMessage}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4 transition-colors hover:border-white/20"
    >
      <p className="editorial-kicker">{label}</p>
      <p className="mt-3 font-display text-4xl text-white">{value}</p>
    </Link>
  );
}
