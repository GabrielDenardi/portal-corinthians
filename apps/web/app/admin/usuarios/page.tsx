import { saveUserAction } from "@/app/actions/admin";
import { requireAdminSession } from "@/lib/auth";
import { fetchAdminApi } from "@/lib/api/admin";

export default async function AdminUsersPage() {
  await requireAdminSession(["admin"]);
  const users = await fetchAdminApi<Array<{ id: string; name: string; email: string; role: string }>>("/admin/users");

  return (
    <div className="space-y-6">
      <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
        <p className="editorial-kicker">Usuários</p>
        <h2 className="type-display mt-4 text-white">Perfis de acesso</h2>
        <div className="mt-6 grid gap-3">
          {(users ?? []).map((user) => (
            <article key={user.id} className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
              <h3 className="type-h3 text-white">{user.name}</h3>
              <p className="type-body mt-2 text-ink-secondary">
                {user.email} · {user.role}
              </p>
            </article>
          ))}
        </div>
      </div>
      <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
        <p className="editorial-kicker">Novo usuário</p>
        <form action={saveUserAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <input name="name" placeholder="Nome" className="h-12 rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white" />
          <input name="email" type="email" placeholder="Email" className="h-12 rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white" />
          <select name="role" className="h-12 rounded-[var(--radius-lg)] border border-line bg-app px-4 text-white">
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <input
            name="password"
            type="password"
            placeholder="Senha inicial"
            className="h-12 rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white"
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-[var(--radius-full)] border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.18em] text-app"
          >
            Salvar usuário
          </button>
        </form>
      </div>
    </div>
  );
}
