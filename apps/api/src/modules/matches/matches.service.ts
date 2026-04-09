import type { MatchDTO, MatchScope, NewsTone } from "@portal-corinthians/contracts";
import { Injectable } from "@nestjs/common";
import { MatchStatusTone, Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { SportsDbClient } from "../teams/sportsdb.client";
import { TeamsService } from "../teams/teams.service";

type MatchRecord = Prisma.MatchGetPayload<{
  include: { homeTeam: true; awayTeam: true };
}>;

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamsService: TeamsService,
    private readonly sportsDbClient: SportsDbClient,
  ) {}

  async syncSchedule() {
    const events = await this.sportsDbClient.fetchCorinthiansSchedule();
    let processed = 0;

    for (const event of events) {
      const [homeTeam, awayTeam] = await Promise.all([
        this.teamsService.resolveTeam(event.homeTeamName, event.homeTeamExternalId),
        this.teamsService.resolveTeam(event.awayTeamName, event.awayTeamExternalId),
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

      processed += 1;
    }

    return processed;
  }

  async getUpcomingMatch() {
    const match = await this.prisma.match.findFirst({
      where: { kickOff: { gte: new Date() } },
      orderBy: { kickOff: "asc" },
      include: { homeTeam: true, awayTeam: true },
    });

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
      take: scope === "all" ? 12 : 6,
      orderBy: {
        kickOff: scope === "recent" ? "desc" : "asc",
      },
      include: { homeTeam: true, awayTeam: true },
    });

    return matches.map(toMatchDTO);
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
  const opponent = homeTeam === "Corinthians" ? awayTeam : homeTeam;
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
