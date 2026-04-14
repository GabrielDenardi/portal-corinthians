import Link from "next/link";

import { logoutAction } from "@/app/actions/admin";
import { Container } from "@/components/ui/container";
import { requireAdminSession } from "@/lib/auth";

const adminLinks = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/materias", label: "Matérias" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/home", label: "Home" },
  { href: "/admin/partidas", label: "Partidas" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/auditoria", label: "Auditoria" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession(["admin", "editor"]);

  return (
    <main className="flex-1 bg-app">
      <Container className="py-10 md:py-12">
        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-5 shadow-[var(--shadow-card)]">
            <p className="editorial-kicker">Admin</p>
            <h1 className="type-h2 mt-3 text-white">Portal Corinthians</h1>
            <p className="type-body mt-3 text-ink-secondary">
              {session.user.name} · {session.user.role}
            </p>
            <nav className="mt-6 flex flex-col gap-2">
              {adminLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[var(--radius-lg)] border border-white/8 bg-white/4 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/86"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <form action={logoutAction} className="mt-6">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-white/12 bg-white/6 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white"
              >
                Sair
              </button>
            </form>
          </aside>

          <section className="min-w-0">{children}</section>
        </div>
      </Container>
    </main>
  );
}
