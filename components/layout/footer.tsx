import Link from "next/link";

import type { FooterGroup } from "@/content/home";

import { Container } from "@/components/ui/container";

interface FooterProps {
  groups: FooterGroup[];
}

export function Footer({ groups }: FooterProps) {
  return (
    <footer id="footer" className="border-t border-white/8 bg-surface">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.1fr)_1fr]">
          <div className="max-w-xl">
            <p className="editorial-kicker">Portal Corinthians</p>
            <h2 className="type-h2 mt-4 text-white">
              Cobertura direta, leitura rápida e identidade forte para acompanhar o clube todos os dias.
            </h2>
            <p className="type-body mt-4 text-ink-secondary">
              O conteúdo desta primeira versão é editorial e demonstrativo. A arquitetura foi pensada
              para crescer com páginas de notícia, widgets de jogos, módulos administrativos e novos
              blocos responsivos sem perder consistência.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="editorial-kicker text-white/52">{group.title}</p>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="type-body text-ink-secondary transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-white/8 pt-6">
          <p className="type-body-sm max-w-4xl text-ink-muted">
            Conteúdo agregado e curado com foco em notícias, bastidores, próximos jogos e destaques do
            Corinthians. Fontes, créditos e integrações definitivas serão conectados nas próximas
            etapas do produto.
          </p>
          <p className="type-caption mt-4 text-ink-muted/80">
            © {new Date().getFullYear()} Portal Corinthians. Base visual e estrutural em evolução.
          </p>
        </div>
      </Container>
    </footer>
  );
}
