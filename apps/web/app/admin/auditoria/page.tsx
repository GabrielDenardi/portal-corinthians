import { fetchAdminApi } from "@/lib/api/admin";

export default async function AdminAuditPage() {
  const [logs, providerHealth] = await Promise.all([
    fetchAdminApi<
      Array<{
        id: string;
        actorName: string;
        actorRole: string;
        action: string;
        entityType: string;
        entityId: string;
        createdAt: string;
        details?: string | null;
      }>
    >("/admin/audit"),
    fetchAdminApi<Array<{ provider: string; status: string; lastRunAt?: string | null; lastMessage?: string | null }>>(
      "/admin/provider-health",
    ),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
        <p className="editorial-kicker">Providers</p>
        <div className="mt-5 grid gap-4">
          {(providerHealth ?? []).map((entry) => (
            <article key={entry.provider} className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="type-h3 text-white">{entry.provider}</h3>
                <span className="editorial-kicker">{entry.status}</span>
              </div>
              <p className="type-body mt-2 text-ink-secondary">{entry.lastRunAt ?? "sem execução"}</p>
              {entry.lastMessage ? <p className="type-body mt-2 text-ink-secondary">{entry.lastMessage}</p> : null}
            </article>
          ))}
        </div>
      </div>
      <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
        <p className="editorial-kicker">Auditoria</p>
        <div className="mt-5 grid gap-4">
          {(logs ?? []).map((log) => (
            <article key={log.id} className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="type-h3 text-white">{log.action}</h3>
                <span className="editorial-kicker">{log.actorName}</span>
              </div>
              <p className="type-body mt-2 text-ink-secondary">
                {log.entityType} · {log.entityId}
              </p>
              {log.details ? <p className="type-body mt-2 text-ink-secondary">{log.details}</p> : null}
              <p className="type-body-sm mt-2 text-ink-secondary">{new Date(log.createdAt).toLocaleString("pt-BR")}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
