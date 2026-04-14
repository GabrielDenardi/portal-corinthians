import { approveIncomingStoryAction, rejectIncomingStoryAction } from "@/app/actions/admin";
import { fetchAdminApi } from "@/lib/api/admin";

export default async function AdminInboxPage() {
  const inbox = await fetchAdminApi<
    Array<{
      id: string;
      title: string;
      summary: string;
      sourceName: string;
      publishedAt: string;
      status: string;
      suggestedCategory: { label: string };
    }>
  >("/admin/inbox");

  return (
    <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
      <p className="editorial-kicker">Inbox</p>
      <h2 className="type-display mt-4 text-white">Fila editorial</h2>
      <div className="mt-6 grid gap-4">
        {(inbox ?? []).map((item) => (
          <article key={item.id} className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="editorial-kicker">{item.suggestedCategory.label}</p>
                <h3 className="type-h3 mt-3 text-white">{item.title}</h3>
              </div>
              <span className="editorial-kicker">{item.status}</span>
            </div>
            <p className="type-body mt-3 text-ink-secondary">{item.summary}</p>
            <p className="type-body-sm mt-3 text-ink-secondary">
              {item.sourceName} · {new Date(item.publishedAt).toLocaleString("pt-BR")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <form action={approveIncomingStoryAction}>
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.18em] text-app"
                >
                  Aprovar
                </button>
              </form>
              <form action={rejectIncomingStoryAction}>
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-white/12 bg-white/6 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white"
                >
                  Rejeitar
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
