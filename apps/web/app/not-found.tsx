import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <main className="flex-1 bg-app">
      <Container className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl rounded-[calc(var(--radius-xl)+6px)] border border-white/8 bg-card/72 p-10 text-center shadow-[var(--shadow-card)]">
          <p className="editorial-kicker">404</p>
          <h1 className="type-display mt-5 text-balance text-white">Página não encontrada</h1>
          <p className="type-body-lg mt-6 text-ink-secondary">
            O link pode ter saído do ar, mudado de rota ou ainda não ter sido publicado na operação editorial.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className={buttonStyles({ variant: "secondary", size: "lg" })}>
              Voltar para home
            </Link>
            <Link href="/jogos" className={buttonStyles({ variant: "ghost", size: "lg" })}>
              Ver jogos
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
