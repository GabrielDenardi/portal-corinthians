import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { withRetries } from "../../common/with-retries";
import type { ScheduleMatchRecord } from "./match-source.types";

type EspnTeam = {
  id?: string;
  abbrev?: string;
  displayName?: string;
  shortDisplayName?: string;
  logo?: string;
  isHome?: boolean;
};

type EspnEvent = {
  id?: string;
  date?: string;
  completed?: boolean;
  league?: string;
  note?: string;
  notes?: string;
  leg?: {
    displayValue?: string;
  };
  status?: {
    state?: string;
  };
  venue?: {
    fullName?: string;
  };
  teams?: EspnTeam[];
  competitors?: EspnTeam[];
};

type EspnFittState = {
  page?: {
    content?: {
      fixtures?: { events?: EspnEvent[] };
      results?: { events?: EspnEvent[] };
    };
  };
};

const ESPN_SOURCE = "espn";
const ESPN_DEFAULT_BASE_URL = "https://www.espn.com";
const ESPN_DEFAULT_CORINTHIANS_TEAM_ID = "874";
const ESPN_BROWSER_HEADERS = {
  "accept-language": "en-US,en;q=0.9",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
};

@Injectable()
export class EspnFixturesClient {
  private readonly logger = new Logger(EspnFixturesClient.name);
  private readonly baseUrl: string;
  private readonly corinthiansTeamId: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get("ESPN_BASE_URL") ?? ESPN_DEFAULT_BASE_URL;
    this.corinthiansTeamId =
      this.configService.get("ESPN_CORINTHIANS_TEAM_ID") ?? ESPN_DEFAULT_CORINTHIANS_TEAM_ID;
  }

  async fetchCorinthiansSchedule() {
    const [fixturesHtml, resultsHtml] = await Promise.all([
      this.fetchPage(`/soccer/team/fixtures/_/id/${this.corinthiansTeamId}`),
      this.fetchPage(`/soccer/team/results/_/id/${this.corinthiansTeamId}`),
    ]);

    const fixtureEvents = extractEspnEvents(fixturesHtml, "fixtures");
    const resultEvents = extractEspnEvents(resultsHtml, "results");
    const eventMap = new Map<string, ScheduleMatchRecord>();

    for (const event of [...fixtureEvents, ...resultEvents]) {
      const normalized = mapEspnEvent(event);

      if (!normalized) {
        continue;
      }

      eventMap.set(normalized.externalId, normalized);
    }

    if (eventMap.size === 0) {
      this.logger.warn("ESPN did not return any valid Corinthians events.");
    }

    return [...eventMap.values()].sort((left, right) => left.kickOff.getTime() - right.kickOff.getTime());
  }

  private async fetchPage(path: string) {
    const response = await withRetries(
      () =>
        fetch(`${this.baseUrl}${path}`, {
          headers: ESPN_BROWSER_HEADERS,
        }),
      {
        onRetry: (attempt, error) => {
          this.logger.warn(`Retrying ESPN request (${attempt}). ${error instanceof Error ? error.message : String(error)}`);
        },
      },
    );

    if (!response.ok) {
      throw new Error(`ESPN request failed with status ${response.status}`);
    }

    return response.text();
  }
}

export function extractEspnEvents(html: string, section: "fixtures" | "results") {
  const match = html.match(/window\['__espnfitt__'\]=(.*?);<\/script>/s);

  if (!match?.[1]) {
    throw new Error("Could not locate ESPN page state.");
  }

  const state = JSON.parse(match[1]) as EspnFittState;
  const events = state.page?.content?.[section]?.events;
  return Array.isArray(events) ? events : [];
}

export function mapEspnEvent(event: EspnEvent): ScheduleMatchRecord | null {
  if (!event.id || !event.date) {
    return null;
  }

  const competitors = Array.isArray(event.teams) && event.teams.length > 0 ? event.teams : event.competitors;

  if (!Array.isArray(competitors) || competitors.length < 2) {
    return null;
  }

  const homeTeam = competitors.find((team) => team.isHome === true) ?? competitors[0];
  const awayTeam = competitors.find((team) => team.isHome === false) ?? competitors[1];
  const kickOff = new Date(event.date);

  if (!homeTeam?.displayName || !awayTeam?.displayName || Number.isNaN(kickOff.getTime())) {
    return null;
  }

  const status = mapEspnStatus(event.status?.state, Boolean(event.completed), kickOff);

  return {
    externalId: `${ESPN_SOURCE}:${event.id}`,
    competition: localizeCompetitionName(event.league),
    round: localizeRoundLabel(event.leg?.displayValue ?? event.note ?? event.notes, event.league),
    venue: event.venue?.fullName ?? "Local em atualização",
    kickOff,
    statusLabel: status.label,
    statusTone: status.tone,
    homeTeamName: homeTeam.displayName,
    homeTeamShortName: homeTeam.abbrev ?? homeTeam.shortDisplayName ?? null,
    homeTeamBadgeUrl: homeTeam.logo ?? null,
    awayTeamName: awayTeam.displayName,
    awayTeamShortName: awayTeam.abbrev ?? awayTeam.shortDisplayName ?? null,
    awayTeamBadgeUrl: awayTeam.logo ?? null,
  };
}

function mapEspnStatus(state: string | undefined, completed: boolean, kickOff: Date) {
  if (state === "in" || state === "live") {
    return { label: "Ao vivo", tone: "success" as const };
  }

  if (state === "post" || completed) {
    return { label: "Encerrado", tone: "warning" as const };
  }

  if (kickOff.getTime() > Date.now()) {
    return { label: "Pré-jogo", tone: "alert" as const };
  }

  return { label: "Resultado", tone: "warning" as const };
}

function localizeCompetitionName(value?: string) {
  if (!value) {
    return "Partida oficial";
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "brazilian serie a") return "Brasileirão";
  if (normalized === "conmebol libertadores") return "Libertadores";
  if (normalized === "copa do brasil") return "Copa do Brasil";
  if (normalized === "brazilian campeonato paulista") return "Paulistão";
  if (normalized === "brazilian supercopa rei") return "Supercopa Rei";

  return value;
}

function localizeRoundLabel(value: string | undefined, competition?: string) {
  if (value) {
    const normalized = value.trim().toLowerCase();

    if (normalized === "1st leg") return "Jogo de ida";
    if (normalized === "2nd leg") return "Jogo de volta";
    if (normalized === "group stage") return "Fase de grupos";

    return value;
  }

  const normalizedCompetition = competition?.trim().toLowerCase();

  if (normalizedCompetition === "conmebol libertadores") return "Fase de grupos";
  if (normalizedCompetition === "brazilian serie a") return "Rodada oficial";
  if (normalizedCompetition === "copa do brasil") return "Mata-mata";

  return "Partida oficial";
}
