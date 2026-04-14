import { saveCategoryAction } from "@/app/actions/admin";
import { requireAdminSession } from "@/lib/auth";
import { fetchAdminApi } from "@/lib/api/admin";

export default async function AdminCategoriesPage() {
  await requireAdminSession(["admin"]);
  const categories = await fetchAdminApi<
    Array<{ id: string; slug: string; label: string; description: string }>
  >("/admin/categories");

  return (
    <div className="space-y-6">
      <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
        <p className="editorial-kicker">Categorias</p>
        <h2 className="type-display mt-4 text-white">Editorias</h2>
        <div className="mt-6 grid gap-4">
          {(categories ?? []).map((category) => (
            <form key={category.id} action={saveCategoryAction} className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
              <input type="hidden" name="id" value={category.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="label"
                  defaultValue={category.label}
                  className="h-11 rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white"
                />
                <input
                  name="slug"
                  defaultValue={category.slug}
                  className="h-11 rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white"
                />
              </div>
              <textarea
                name="description"
                defaultValue={category.description}
                rows={3}
                className="mt-3 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 py-3 text-white"
              />
              <button
                type="submit"
                className="mt-3 inline-flex h-10 items-center justify-center rounded-[var(--radius-full)] border border-white/12 bg-white/6 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white"
              >
                Salvar categoria
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
