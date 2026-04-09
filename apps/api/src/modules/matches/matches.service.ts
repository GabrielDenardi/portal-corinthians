import type { MatchDTO, MatchScope, NewsTone } from "@portal-corinthians/contracts";
import { Injectable, Logger } from "@nestjs/common";
import { MatchStatusTone, Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { SportsDbClient } from "../teams/sportsdb.client";
import { TeamsService } from "../teams/teams.service";
import { getCorinthiansOpponent, isCorinthiansMatchup } from "../teams/team-identity";
import { EspnFixturesClient } from "./espn-fixtures.client";

type MatchRecord = Prisma.MatchGetPayload<{
  include: { homeTeam: true; awayTeam: true };
}>;

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly teamsService: TeamsService,
    private readonly espnFixturesClient: EspnFixturesClient,
    private readonly sportsDbClient: SportsDbClient,
  ) {}

  async syncSchedule() {
    const { events, source } = await this.fetchScheduleFromPrimarySource();
    const validEvents = events.filter((event) =>
      isCorinthiansMatchup(event.homeTeamName, event.awayTeamName),
    );
    const syncedExternalIds = new Set<string>();
    let processed = 0;

    for (const event of validEvents) {
      const [homeTeam, awayTeam] = await Promise.all([
        this.teamsService.upsertTeam({
          name: event.homeTeamName,
          shortName: event.homeTeamShortName,
          badgeUrl: event.homeTeamBadgeUrl,
        }),
        this.teamsService.upsertTeam({
          name: event.awayTeamName,
          shortName: event.awayTeamShortName,
          badgeUrl: event.awayTeamBadgeUrl,
        }),
      ]);

      await this.prisma.match.upsert({
        where: { externalId: event.externalId },
        update: {
          competition: event.competition,
          round: event.round,
          venue: event.venue,
          kickOff: event.kickOff,
          broadcast: buildBroadcastText(event.homeTeamName, event.awayTeamName),
          note: buildMatchNote(event.homeTeamName, event.awayTeamName),
          statusLabel: event.statusLabel,
          statusTone: toPrismaTone(event.statusTone),
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          syncedAt: new Date(),
        },
        create: {
          externalId: event.externalId,
          competition: event.competition,
          round: event.round,
          venue: event.venue,
          kickOff: event.kickOff,
          broadcast: buildBroadcastText(event.homeTeamName, event.awayTeamName),
          note: buildMatchNote(event.homeTeamName, event.awayTeamName),
          statusLabel: event.statusLabel,
          statusTone: toPrismaTone(event.statusTone),
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
        },
      });

      syncedExternalIds.add(event.externalId);
      processed += 1;
    }

    if (source === "espn") {
      await this.pruneStaleMatches(syncedExternalIds);
    }

    await this.pruneNonCorinthiansMatches();

    return processed;
  }

  async getUpcomingMatch() {
    const matches = await this.prisma.match.findMany({
      where: { kickOff: { gte: new Date() } },
      take: 12,
      orderBy: { kickOff: "asc" },
      include: { homeTeam: true, awayTeam: true },
    });

    const match = matches.find((item) => isCorinthiansMatchup(item.homeTeam.name, item.awayTeam.name));
    return match ? toMatchDTO(match) : null;
  }

  async getMatches(scope: MatchScope) {
    const now = new Date();
    const where =
      scope === "upcoming"
        ? { kickOff: { gte: now } }
        : scope === "recent"
          ? { kickOff: { lt: now } }
          : undefined;

    const matches = await this.prisma.match.findMany({
      where,
      take: scope === "all" ? 24 : 12,
      orderBy: {
        kickOff: scope === "recent" ? "desc" : "asc",
      },
      include: { homeTeam: true, awayTeam: true },
    });

    return matches
      .filter((match) => isCorinthiansMatchup(match.homeTeam.name, match.awayTeam.name))
      .slice(0, scope === "all" ? 12 : 6)
      .map(toMatchDTO);
  }

  private async fetchScheduleFromPrimarySource() {
    try {
      const espnEvents = await this.espnFixturesClient.fetchCorinthiansSchedule();

      if (espnEvents.length > 0) {
        return { source: "espn" as const, events: espnEvents };
      }

      this.logger.warn("ESPN returned no schedule data. Falling back to TheSportsDB.");
    } catch (error) {
      this.logger.warn(
        `ESPN schedule fetch failed. Falling back to TheSportsDB. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return {
      source: "sportsdb" as const,
      events: await this.sportsDbClient.fetchCorinthiansSchedule(),
    };
  }

  private async pruneStaleMatches(syncedExternalIds: Set<string>) {
    if (syncedExternalIds.size === 0) {
      return;
    }

    await this.prisma.match.deleteMany({
      where: {
        OR: [
          { externalId: null },
          {
            externalId: {
              notIn: [...syncedExternalIds],
            },
          },
        ],
      },
    });
  }

  private async pruneNonCorinthiansMatches() {
    const matches = await this.prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true },
    });

    const invalidMatchIds = matches
      .filter((match) => !isCorinthiansMatchup(match.homeTeam.name, match.awayTeam.name))
      .map((match) => match.id);

    if (invalidMatchIds.length === 0) {
      return;
    }

    await this.prisma.match.deleteMany({
      where: {
        id: {
          in: invalidMatchIds,
        },
      },
    });
  }
}

export function toMatchDTO(match: MatchRecord): MatchDTO {
  return {
    id: match.id,
    competition: match.competition,
    round: match.round,
    homeTeam: {
      id: match.homeTeam.id,
      name: match.homeTeam.name,
      shortName: match.homeTeam.shortName,
      badgeUrl: match.homeTeam.badgeUrl,
    },
    awayTeam: {
      id: match.awayTeam.id,
      name: match.awayTeam.name,
      shortName: match.awayTeam.shortName,
      badgeUrl: match.awayTeam.badgeUrl,
    },
    venue: match.venue,
    kickOff: formatKickOff(match.kickOff),
    broadcast: match.broadcast,
    note: match.note,
    statusLabel: match.statusLabel,
    statusTone: fromPrismaTone(match.statusTone),
  };
}

function formatKickOff(value: Date) {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(value);

  const [weekday, time] = formatted.split(", ");
  return `${capitalize(weekday)}, ${time.replace(":", "h")}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildMatchNote(homeTeam: string, awayTeam: string) {
  const opponent = getCorinthiansOpponent(homeTeam, awayTeam);
  return `A cobertura do confronto contra ${opponent} cruza momento esportivo, leitura tática e o peso do resultado na sequência do Corinthians.`;
}

function buildBroadcastText(homeTeam: string, awayTeam: string) {
  return `Cobertura em tempo real de ${homeTeam} x ${awayTeam} no portal, com contexto pré-jogo, atualização de agenda e leitura pós-partida.`;
}

function toPrismaTone(tone: NewsTone) {
  if (tone === "alert") return MatchStatusTone.alert;
  if (tone === "success") return MatchStatusTone.success;
  if (tone === "warning") return MatchStatusTone.warning;
  return MatchStatusTone.default;
}

function fromPrismaTone(tone: MatchStatusTone): NewsTone {
  if (tone === MatchStatusTone.alert) return "alert";
  if (tone === MatchStatusTone.success) return "success";
  if (tone === MatchStatusTone.warning) return "warning";
  return "default";
}
