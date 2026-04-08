import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const sourceLinks = [
  {
    label: "Site oficial do Sport Club Corinthians Paulista",
    href: "https://www.corinthians.com.br/",
    note: "Referência institucional do clube e origem de ativos públicos do ecossistema oficial.",
  },
  {
    label: "Agência Corinthians",
    href: "https://agencia.corinthians.com.br/",
    note: "Referência visual e ecossistema oficial de mídia e fotos do clube.",
  },
  {
    label: "TheSportsDB",
    href: "https://www.thesportsdb.com/",
    note: "Usado para resolver escudos de adversários dinamicamente a partir do nome do clube.",
  },
  {
    label: "Wikimedia Commons",
    href: "https://commons.wikimedia.org/",
    note: "Fonte complementar de referência pública para alguns escudos e ativos históricos.",
  },
  {
    label: "Internet / fontes públicas de referência",
    href: "https://www.google.com/",
    note: "Base geral de consulta quando necessário, sempre com preferência por fontes oficiais e bases esportivas reconhecidas.",
  },
];

export default function InstitucionalPage() {
  return (
    <main className="flex-1 bg-app">
      <section className="border-b border-white/8 bg-surface">
        <Container className="py-14 md:py-16">
          <p className="editorial-kicker">Institucional</p>
          <h1 className="type-display mt-5 max-w-4xl text-balance text-white">
            Critérios editoriais, fontes utilizadas e créditos do portal.
          </h1>
          <p className="type-body-lg mt-6 max-w-3xl text-ink-secondary">
            Esta página reúne as diretrizes editoriais do projeto, as fontes públicas utilizadas na
            base atual e os créditos de desenvolvimento do Portal Corinthians.
          </p>
        </Container>
      </section>

      <section id="politica-editorial" className="scroll-mt-28 border-b border-white/8 bg-app">
        <Container className="py-14 md:py-16">
          <SectionHeading
            eyebrow="Política editorial"
            title="Como o portal organiza a cobertura"
            description="A estrutura editorial prioriza leitura rápida, contexto claro e hierarquia visual consistente."
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <article className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-5 shadow-[var(--shadow-card)]">
              <h2 className="type-h3 text-white">Critério de destaque</h2>
              <p className="type-body mt-3 text-ink-secondary">
                A home privilegia manchete principal, próximo jogo, atualizações relevantes e blocos
                editoriais com leitura objetiva.
              </p>
            </article>

            <article className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-5 shadow-[var(--shadow-card)]">
              <h2 className="type-h3 text-white">Tom de interface</h2>
              <p className="type-body mt-3 text-ink-secondary">
                O texto do portal busca ser direto, esportivo e confiável, sem exagero gráfico ou
                linguagem promocional desnecessária.
              </p>
            </article>

            <article className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-5 shadow-[var(--shadow-card)]">
              <h2 className="type-h3 text-white">Atualização e revisão</h2>
              <p className="type-body mt-3 text-ink-secondary">
                Manchetes, resumos e blocos de apoio podem ser atualizados conforme surgem novas
                informações, preservando coerência editorial e clareza de leitura.
              </p>
            </article>
          </div>
        </Container>
      </section>

      <section id="fontes-e-creditos" className="scroll-mt-28 bg-surface">
        <Container className="py-14 md:py-16">
          <SectionHeading
            eyebrow="Fontes e créditos"
            title="De onde vêm as informações e os ativos"
            description="Lista objetiva das referências públicas e técnicas utilizadas no portal nesta etapa."
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
            <div className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
              <h2 className="type-h3 text-white">Fontes atuais do projeto</h2>
              <ul className="mt-5 space-y-4">
                {sourceLinks.map((source) => (
                  <li key={source.label} className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="type-body-sm font-semibold text-white transition-colors hover:text-ink-secondary"
                    >
                      {source.label}
                    </a>
                    <p className="type-body mt-2 text-ink-secondary">{source.note}</p>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="rounded-[var(--radius-xl)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
              <p className="editorial-kicker">Assinatura</p>
              <h2 className="type-h2 mt-4 text-white">Gabriel Denardi</h2>
              <p className="type-body mt-4 text-ink-secondary">
                Concepção, desenvolvimento e direção do projeto Portal Corinthians, incluindo estrutura
                do produto, identidade visual, frontend, integrações, dados e evolução técnica da plataforma.
              </p>

              <div className="mt-6 grid gap-3">
                <a
                  href="https://gabrieldenardi.com.br/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-app/55"
                >
                  gabrieldenardi.com.br
                </a>
                <a
                  href="https://www.instagram.com/gabriel_denardi_/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-app/55"
                >
                  Instagram
                </a>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
