import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type SportsDbTeam = {
  idTeam?: string;
  strTeam?: string;
  strAlternate?: string;
  strTeamShort?: string;
  strSport?: string;
  strCountry?: string;
  strBadge?: string;
};

type SportsDbEvent = {
  idEvent?: string;
  strEvent?: string;
  strLeague?: string;
  intRound?: string;
  dateEvent?: string;
  strTime?: string;
  strVenue?: string;
  strStatus?: string;
  idHomeTeam?: string;
  idAwayTeam?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
};

type SportsDbTeamResponse = {
  teams?: SportsDbTeam[] | null;
};

type SportsDbEventResponse = {
  events?: SportsDbEvent[] | null;
};

export interface SportsDbTeamRecord {
  externalId?: string;
  name: string;
  shortName?: string | null;
  country?: string | null;
  sport?: string | null;
  badgeUrl?: string | null;
  alternateNames: string[];
}

export interface SportsDbMatchRecord {
  externalId: string;
  competition: string;
  round: string;
  venue: string;
  kickOff: Date;
  statusLabel: string;
  statusTone: "default" | "alert" | "success" | "warning";
  homeTeamName: string;
  homeTeamExternalId?: string;
  awayTeamName: string;
  awayTeamExternalId?: string;
}

@Injectable()
export class SportsDbClient {
  private readonly logger = new Logger(SportsDbClient.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get("THESPORTSDB_API_KEY") ?? "3";
    this.baseUrl = `https://www.thesportsdb.com/api/v1/json/${this.apiKey}`;
  }

  private async fetchJson<T>(path: string) {
    const response = await fetch(`${this.baseUrl}${path}`);

    if (!response.ok) {
      throw new Error(`TheSportsDB request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async searchTeam(name: string) {
    const data = await this.fetchJson<SportsDbTeamResponse>(`/searchteams.php?t=${encodeURIComponent(name)}`);
    const team = (data.teams ?? []).find((item) => item.strSport === "Soccer");

    if (!team?.strTeam) {
      return null;
    }

    return {
      externalId: team.idTeam,
      name: team.strTeam,
      shortName: team.strTeamShort ?? null,
      country: team.strCountry ?? null,
      sport: team.strSport ?? null,
      badgeUrl: team.strBadge ?? null,
      alternateNames: [team.strAlternate].filter(Boolean) as string[],
    } satisfies SportsDbTeamRecord;
  }

  async fetchCorinthiansSchedule() {
    const corinthians = await this.searchTeam("Corinthians");

    if (!corinthians?.externalId) {
      this.logger.warn("Could not resolve Corinthians in TheSportsDB.");
      return [] as SportsDbMatchRecord[];
    }

    const [next, recent] = await Promise.all([
      this.fetchJson<SportsDbEventResponse>(`/eventsnext.php?id=${corinthians.externalId}`),
      this.fetchJson<SportsDbEventResponse>(`/eventslast.php?id=${corinthians.externalId}`),
    ]);

    return [...(next.events ?? []), ...(recent.events ?? [])]
      .filter((event): event is Required<Pick<SportsDbEvent, "idEvent" | "strHomeTeam" | "strAwayTeam">> & SportsDbEvent =>
        Boolean(event.idEvent && event.strHomeTeam && event.strAwayTeam),
      )
      .map((event) => {
        const kickOff = toSportsDbDate(event.dateEvent, event.strTime);
        const status = mapSportsDbStatus(event.strStatus, kickOff);

        return {
          externalId: event.idEvent!,
          competition: event.strLeague ?? "Partida em atualização",
          round: event.intRound ? `${event.intRound}ª rodada` : "Rodada em atualização",
          venue: event.strVenue ?? "Local em atualização",
          kickOff,
          statusLabel: status.label,
          statusTone: status.tone,
          homeTeamName: event.strHomeTeam!,
          homeTeamExternalId: event.idHomeTeam,
          awayTeamName: event.strAwayTeam!,
          awayTeamExternalId: event.idAwayTeam,
        } satisfies SportsDbMatchRecord;
      });
  }
}

function toSportsDbDate(dateEvent?: string, time?: string) {
  if (!dateEvent) {
    return new Date();
  }

  const baseTime = time ? `${time.replace("Z", "")}` : "00:00:00";
  return new Date(`${dateEvent}T${baseTime}Z`);
}

function mapSportsDbStatus(status: string | undefined, kickOff: Date) {
  if (status?.toLowerCase() === "match finished") {
    return { label: "Encerrado", tone: "warning" as const };
  }

  if (status?.toLowerCase() === "live") {
    return { label: "Ao vivo", tone: "success" as const };
  }

  if (kickOff.getTime() > Date.now()) {
    return { label: "Pré-jogo", tone: "alert" as const };
  }

  return { label: "Resultado", tone: "warning" as const };
}
