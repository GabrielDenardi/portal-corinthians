import { saveArticleAction } from "@/app/actions/admin";
import { requireAdminSession } from "@/lib/auth";
import { fetchAdminApi } from "@/lib/api/admin";

interface AdminArticleEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminArticleEditorPage({ params }: AdminArticleEditorPageProps) {
  const session = await requireAdminSession(["admin", "editor"]);
  const { id } = await params;
  const [article, categories] = await Promise.all([
    fetchAdminApi<{
      id: string;
      title: string;
      dek: string;
      summary: string;
      body: string[];
      status: string;
      isPinnedHome: boolean;
      pinnedCategoryIds: string[];
      category: { id: string; label: string };
      featuredRank: number;
      sortOrder?: number;
    }>(`/admin/articles/${id}`),
    fetchAdminApi<Array<{ id: string; label: string; slug: string }>>("/admin/categories"),
  ]);

  if (!article) {
    return null;
  }

  return (
    <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
      <p className="editorial-kicker">Matéria</p>
      <h2 className="type-display mt-4 text-white">Editor de matéria</h2>
      <form action={saveArticleAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={article.id} />
        <label className="block">
          <span className="editorial-kicker">Headline</span>
          <input
            name="title"
            defaultValue={article.title}
            className="mt-2 h-12 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white"
          />
        </label>
        <label className="block">
          <span className="editorial-kicker">Dek</span>
          <textarea
            name="dek"
            defaultValue={article.dek}
            rows={3}
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 py-3 text-white"
          />
        </label>
        <label className="block">
          <span className="editorial-kicker">Resumo</span>
          <textarea
            name="summary"
            defaultValue={article.summary}
            rows={3}
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 py-3 text-white"
          />
        </label>
        <label className="block">
          <span className="editorial-kicker">Corpo</span>
          <textarea
            name="body"
            defaultValue={article.body.join("\n\n")}
            rows={12}
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 py-3 text-white"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="editorial-kicker">Categoria</span>
            <select
              name="categoryId"
              defaultValue={article.category.id}
              className="mt-2 h-12 w-full rounded-[var(--radius-lg)] border border-line bg-app px-4 text-white"
            >
              {(categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="editorial-kicker">Featured rank</span>
            <input
              name="featuredRank"
              type="number"
              defaultValue={article.featuredRank}
              className="mt-2 h-12 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white"
            />
          </label>
          <label className="mt-8 flex items-center gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-app/35 px-4 py-3 text-white">
            <input type="checkbox" name="isPinnedHome" defaultChecked={article.isPinnedHome} />
            Fixar na home
          </label>
        </div>
        <fieldset className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
          <legend className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Fixar em categorias
          </legend>
          <div className="mt-3 flex flex-wrap gap-4">
            {(categories ?? []).map((category) => (
              <label key={category.id} className="inline-flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  name="pinnedCategoryIds"
                  value={category.id}
                  defaultChecked={article.pinnedCategoryIds.includes(category.id)}
                />
                {category.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            name="actionType"
            value="save"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-white/12 bg-white/6 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white"
          >
            Salvar
          </button>
          <button
            type="submit"
            name="actionType"
            value="approve"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-white/12 bg-white/6 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white"
          >
            Aprovar
          </button>
          {session.user.role === "admin" ? (
            <>
              <button
                type="submit"
                name="actionType"
                value="publish"
                className="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.18em] text-app"
              >
                Publicar
              </button>
              <button
                type="submit"
                name="actionType"
                value="unpublish"
                className="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-white/12 bg-white/6 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white"
              >
                Despublicar
              </button>
            </>
          ) : null}
        </div>
      </form>
    </div>
  );
}
