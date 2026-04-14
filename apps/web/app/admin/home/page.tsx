import { saveHomeSlotsAction } from "@/app/actions/admin";
import { requireAdminSession } from "@/lib/auth";
import { fetchAdminApi } from "@/lib/api/admin";

const slotLabels = {
  featured: "Destaque principal",
  "highlight-1": "Highlight 1",
  "highlight-2": "Highlight 2",
  "highlight-3": "Highlight 3",
  "spotlight-1": "Spotlight 1",
  "spotlight-2": "Spotlight 2",
  "spotlight-3": "Spotlight 3",
} as const;

export default async function AdminHomeSlotsPage() {
  await requireAdminSession(["admin"]);
  const [slots, articles] = await Promise.all([
    fetchAdminApi<Array<{ slot: keyof typeof slotLabels; articleId?: string | null }>>("/admin/home-slots"),
    fetchAdminApi<Array<{ id: string; title: string }>>("/admin/articles"),
  ]);

  const valueBySlot = new Map((slots ?? []).map((slot) => [slot.slot, slot.articleId ?? ""]));

  return (
    <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
      <p className="editorial-kicker">Home</p>
      <h2 className="type-display mt-4 text-white">Blocos fixos</h2>
      <form action={saveHomeSlotsAction} className="mt-6 grid gap-4">
        {Object.entries(slotLabels).map(([slot, label]) => (
          <label key={slot} className="block rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
            <span className="editorial-kicker">{label}</span>
            <select
              name={slot}
              defaultValue={valueBySlot.get(slot as keyof typeof slotLabels) ?? ""}
              className="mt-3 h-12 w-full rounded-[var(--radius-lg)] border border-line bg-app px-4 text-white"
            >
              <option value="">Sem artigo</option>
              {(articles ?? []).map((article) => (
                <option key={article.id} value={article.id}>
                  {article.title}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.18em] text-app"
        >
          Salvar blocos
        </button>
      </form>
    </div>
  );
}
