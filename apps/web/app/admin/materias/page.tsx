import Link from "next/link";

import { fetchAdminApi } from "@/lib/api/admin";

export default async function AdminArticlesPage() {
  const articles = await fetchAdminApi<
    Array<{
      id: string;
      title: string;
      status: string;
      category: { label: string };
      publishedAt?: string | null;
    }>
  >("/admin/articles");

  return (
    <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
      <p className="editorial-kicker">Matérias</p>
      <h2 className="type-display mt-4 text-white">Edição e publicação</h2>
      <div className="mt-6 grid gap-4">
        {(articles ?? []).map((article) => (
          <Link
            key={article.id}
            href={`/admin/materias/${article.id}`}
            className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-5 transition-colors hover:border-white/20"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="editorial-kicker">{article.category.label}</p>
                <h3 className="type-h3 mt-3 text-white">{article.title}</h3>
              </div>
              <span className="editorial-kicker">{article.status}</span>
            </div>
            <p className="type-body-sm mt-3 text-ink-secondary">
              {article.publishedAt ? new Date(article.publishedAt).toLocaleString("pt-BR") : "Ainda não publicada"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
