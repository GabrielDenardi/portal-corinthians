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
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="editorial-kicker text-white/52">{group.title}</p>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                        className="type-body text-ink-secondary transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-white/8 pt-6">
          <div className="flex flex-col gap-2 text-ink-secondary">
            <p className="type-body-sm">
              Desenvolvido por{" "}
              <a
                href="https://gabrieldenardi.com.br/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-white transition-colors hover:text-ink-secondary"
              >
                Gabriel Denardi
              </a>
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://gabrieldenardi.com.br/"
                target="_blank"
                rel="noreferrer"
                className="type-body-sm transition-colors hover:text-white"
              >
                gabrieldenardi.com.br
              </a>
              <a
                href="https://www.instagram.com/gabriel_denardi_/"
                target="_blank"
                rel="noreferrer"
                className="type-body-sm transition-colors hover:text-white"
              >
                Instagram
              </a>
            </div>
          </div>
          <p className="type-caption mt-4 text-ink-muted/80">
            © {new Date().getFullYear()} Portal Corinthians.
          </p>
        </div>
      </Container>
    </footer>
  );
}
