import type { Metadata } from "next";

import { loginAction } from "@/app/actions/admin";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Login",
  description: "Acesso ao painel editorial do Portal Corinthians.",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex-1 bg-app">
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-lg rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/80 p-8 shadow-[var(--shadow-card)]">
          <p className="editorial-kicker">Painel editorial</p>
          <h1 className="type-display mt-4 text-balance text-white">Entrar no admin</h1>
          <p className="type-body mt-4 text-ink-secondary">
            Use as credenciais internas para operar inbox, matérias, home e cobertura de jogo.
          </p>
          {error ? (
            <p className="type-body mt-4 rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/10 p-3 text-red-200">
              Credenciais inválidas ou limite de tentativas atingido.
            </p>
          ) : null}
          <form action={loginAction} className="mt-8 space-y-4">
            <label className="block">
              <span className="editorial-kicker">E-mail</span>
              <input
                name="email"
                type="email"
                required
                className="mt-2 h-12 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white"
              />
            </label>
            <label className="block">
              <span className="editorial-kicker">Senha</span>
              <input
                name="password"
                type="password"
                required
                className="mt-2 h-12 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-full)] border border-white bg-white px-6 text-sm font-semibold uppercase tracking-[0.18em] text-app"
            >
              Entrar
            </button>
          </form>
        </div>
      </Container>
    </main>
  );
}
