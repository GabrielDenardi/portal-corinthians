import { saveMatchAction } from "@/app/actions/admin";
import { fetchAdminApi } from "@/lib/api/admin";

interface AdminMatchEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminMatchEditorPage({ params }: AdminMatchEditorPageProps) {
  const { id } = await params;
  const [match, articles] = await Promise.all([
    fetchAdminApi<{
      id: string;
      homeTeam: { name: string };
      awayTeam: { name: string };
      coveragePhase: "pre" | "live" | "post";
      scoreHome?: number | null;
      scoreAway?: number | null;
      stadium?: string | null;
      competitionStage?: string | null;
      officials: Array<{ role: string; name: string }>;
      lineups: Array<{ teamSide: string; section: string; playerName: string; shirtNumber?: string | null; role?: string | null }>;
      timeline: Array<{ minute: string; type: string; teamSide: string; title: string; description: string }>;
      relatedArticles: Array<{ id: string; title: string }>;
    }>(`/admin/matches/${id}`),
    fetchAdminApi<Array<{ id: string; title: string }>>("/admin/articles"),
  ]);

  if (!match) {
    return null;
  }

  return (
    <div className="rounded-[calc(var(--radius-xl)+4px)] border border-white/8 bg-card/72 p-6 shadow-[var(--shadow-card)]">
      <p className="editorial-kicker">Partida</p>
      <h2 className="type-display mt-4 text-white">
        {match.homeTeam.name} x {match.awayTeam.name}
      </h2>
      <form action={saveMatchAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={id} />
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block">
            <span className="editorial-kicker">Fase</span>
            <select
              name="phase"
              defaultValue={match.coveragePhase}
              className="mt-2 h-12 w-full rounded-[var(--radius-lg)] border border-line bg-app px-4 text-white"
            >
              <option value="pre">Pré-jogo</option>
              <option value="live">Ao vivo</option>
              <option value="post">Pós-jogo</option>
            </select>
          </label>
          <label className="block">
            <span className="editorial-kicker">Placar casa</span>
            <input
              name="scoreHome"
              type="number"
              defaultValue={match.scoreHome ?? ""}
              className="mt-2 h-12 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white"
            />
          </label>
          <label className="block">
            <span className="editorial-kicker">Placar fora</span>
            <input
              name="scoreAway"
              type="number"
              defaultValue={match.scoreAway ?? ""}
              className="mt-2 h-12 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white"
            />
          </label>
          <label className="block">
            <span className="editorial-kicker">Estádio</span>
            <input
              name="stadium"
              defaultValue={match.stadium ?? ""}
              className="mt-2 h-12 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white"
            />
          </label>
        </div>
        <label className="block">
          <span className="editorial-kicker">Fase da competição</span>
          <input
            name="competitionStage"
            defaultValue={match.competitionStage ?? ""}
            className="mt-2 h-12 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 text-white"
          />
        </label>
        <label className="block">
          <span className="editorial-kicker">Oficiais</span>
          <textarea
            name="officials"
            defaultValue={match.officials.map((item) => `${item.role}: ${item.name}`).join("\n")}
            rows={4}
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 py-3 text-white"
          />
        </label>
        <label className="block">
          <span className="editorial-kicker">Escalação</span>
          <textarea
            name="lineups"
            defaultValue={match.lineups
              .map((item) => [item.teamSide, item.section, item.playerName, item.shirtNumber ?? "", item.role ?? ""].join("|"))
              .join("\n")}
            rows={8}
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 py-3 text-white"
          />
        </label>
        <label className="block">
          <span className="editorial-kicker">Timeline</span>
          <textarea
            name="timeline"
            defaultValue={match.timeline
              .map((item) => [item.minute, item.type, item.teamSide, item.title, item.description].join("|"))
              .join("\n")}
            rows={8}
            className="mt-2 w-full rounded-[var(--radius-lg)] border border-line bg-white/4 px-4 py-3 text-white"
          />
        </label>
        <fieldset className="rounded-[var(--radius-lg)] border border-white/8 bg-app/35 p-4">
          <legend className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Matérias relacionadas
          </legend>
          <div className="mt-3 flex flex-wrap gap-4">
            {(articles ?? []).map((article) => (
              <label key={article.id} className="inline-flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  name="relatedArticleIds"
                  value={article.id}
                  defaultChecked={match.relatedArticles.some((entry) => entry.id === article.id)}
                />
                {article.title}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.18em] text-app"
        >
          Salvar cobertura
        </button>
      </form>
    </div>
  );
}
