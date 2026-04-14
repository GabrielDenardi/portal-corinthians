import type { MatchDTO, MatchDetailDTO, MatchScope, NewsTone } from "@portal-corinthians/contracts";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CoveragePhase, MatchStatusTone, Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { toArticleListItemDTO } from "../articles/article.helpers";
import { SportsDbClient } from "../teams/sportsdb.client";
import { TeamsService } from "../teams/teams.service";
import { getCorinthiansOpponent, isCorinthiansMatchup } from "../teams/team-identity";
import { EspnFixturesClient } from "./espn-fixtures.client";

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
          externalId: event.homeTeamExternalId ?? null,
          name: event.homeTeamName,
          shortName: event.homeTeamShortName,
          badgeUrl: event.homeTeamBadgeUrl,
        }),
        this.teamsService.upsertTeam({
          externalId: event.awayTeamExternalId ?? null,
          name: event.awayTeamName,
          shortName: event.awayTeamShortName,
          badgeUrl: event.awayTeamBadgeUrl,
        }),
      ]);

      const match = await this.prisma.match.upsert({
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

      await this.prisma.matchCoverage.upsert({
        where: { matchId: match.id },
        update: {},
        create: {
          matchId: match.id,
          phase: CoveragePhase.pre,
          stadium: match.venue,
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

  async getMatchDetail(id: string): Promise<MatchDetailDTO> {
    const match = await this.findMatchForPublicRoute(id);

    if (!match) {
      throw new NotFoundException("Match not found");
    }

    const coverage = match.coverage;

    return {
      ...toMatchDTO(match),
      coveragePhase: coverage?.phase ?? "pre",
      scoreHome: coverage?.scoreHome ?? null,
      scoreAway: coverage?.scoreAway ?? null,
      stadium: coverage?.stadium ?? match.venue,
      competitionStage: coverage?.competitionStage ?? null,
      officials:
        coverage?.officials.map((official) => ({
          role: official.role,
          name: official.name,
        })) ?? [],
      lineups:
        coverage?.lineups.map((entry) => ({
          id: entry.id,
          teamSide: entry.teamSide === "neutral" ? "home" : entry.teamSide,
          section: entry.section,
          playerName: entry.playerName,
          shirtNumber: entry.shirtNumber,
          role: entry.role,
        })) ?? [],
      timeline:
        coverage?.timeline.map((event) => ({
          id: event.id,
          minute: event.minute,
          type: event.type,
          teamSide: event.teamSide,
          title: event.title,
          description: event.description,
        })) ?? [],
      relatedArticles: coverage?.relatedArticles.map(toArticleListItemDTO) ?? [],
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Jogos", href: "/jogos" },
        { label: `${match.homeTeam.name} x ${match.awayTeam.name}`, href: `/jogos/${toPublicMatchId(match)}` },
      ],
      share: {
        title: `${match.homeTeam.name} x ${match.awayTeam.name}`,
        description: match.note,
        url: `/jogos/${toPublicMatchId(match)}`,
      },
    };
  }

  async listManagedMatches() {
    return this.prisma.match.findMany({
      orderBy: { kickOff: "desc" },
      include: {
        homeTeam: true,
        awayTeam: true,
        coverage: {
          include: {
            timeline: { orderBy: { sortOrder: "asc" } },
            officials: { orderBy: { sortOrder: "asc" } },
            lineups: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });
  }

  async updateMatchCoverage(
    matchId: string,
    input: {
      phase: "pre" | "live" | "post";
      scoreHome?: number | null;
      scoreAway?: number | null;
      stadium?: string | null;
      competitionStage?: string | null;
      officials: Array<{ role: string; name: string }>;
      lineups: Array<{
        teamSide: "home" | "away";
        section: "starting" | "bench";
        playerName: string;
        shirtNumber?: string | null;
        role?: string | null;
      }>;
      timeline: Array<{
        minute: string;
        type: string;
        teamSide: "home" | "away" | "neutral";
        title: string;
        description: string;
      }>;
      relatedArticleIds?: string[];
    },
  ) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException("Match not found");
    }

    const coverage = await this.prisma.matchCoverage.upsert({
      where: { matchId },
      update: {
        phase: input.phase,
        scoreHome: input.scoreHome ?? null,
        scoreAway: input.scoreAway ?? null,
        stadium: input.stadium ?? match.venue,
        competitionStage: input.competitionStage ?? null,
      },
      create: {
        matchId,
        phase: input.phase,
        scoreHome: input.scoreHome ?? null,
        scoreAway: input.scoreAway ?? null,
        stadium: input.stadium ?? match.venue,
        competitionStage: input.competitionStage ?? null,
      },
    });

    await this.prisma.matchTimelineEvent.deleteMany({ where: { coverageId: coverage.id } });
    await this.prisma.matchOfficial.deleteMany({ where: { coverageId: coverage.id } });
    await this.prisma.matchLineup.deleteMany({ where: { coverageId: coverage.id } });

    for (const [index, official] of input.officials.entries()) {
      await this.prisma.matchOfficial.create({
        data: {
          coverageId: coverage.id,
          sortOrder: index,
          role: official.role,
          name: official.name,
        },
      });
    }

    for (const [index, lineup] of input.lineups.entries()) {
      await this.prisma.matchLineup.create({
        data: {
          coverageId: coverage.id,
          sortOrder: index,
          teamSide: lineup.teamSide,
          section: lineup.section,
          playerName: lineup.playerName,
          shirtNumber: lineup.shirtNumber,
          role: lineup.role,
        },
      });
    }

    for (const [index, event] of input.timeline.entries()) {
      await this.prisma.matchTimelineEvent.create({
        data: {
          coverageId: coverage.id,
          sortOrder: index,
          minute: event.minute,
          type: event.type,
          teamSide: event.teamSide,
          title: event.title,
          description: event.description,
        },
      });
    }

    if (input.relatedArticleIds) {
      await this.prisma.matchCoverage.update({
        where: { id: coverage.id },
        data: {
          relatedArticles: {
            set: input.relatedArticleIds.map((id) => ({ id })),
          },
        },
      });
    }

    return this.getMatchDetail(matchId);
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

  private async findMatchForPublicRoute(idOrSlug: string) {
    const byId = await this.prisma.match.findUnique({
      where: { id: idOrSlug },
      include: {
        homeTeam: true,
        awayTeam: true,
        coverage: {
          include: {
            timeline: { orderBy: { sortOrder: "asc" } },
            officials: { orderBy: { sortOrder: "asc" } },
            lineups: { orderBy: { sortOrder: "asc" } },
            relatedArticles: {
              where: { status: "published" },
              include: { source: true, category: true },
            },
          },
        },
      },
    });

    if (byId) {
      return byId;
    }

    const matches = await this.prisma.match.findMany({
      take: 200,
      orderBy: { kickOff: "desc" },
      include: {
        homeTeam: true,
        awayTeam: true,
        coverage: {
          include: {
            timeline: { orderBy: { sortOrder: "asc" } },
            officials: { orderBy: { sortOrder: "asc" } },
            lineups: { orderBy: { sortOrder: "asc" } },
            relatedArticles: {
              where: { status: "published" },
              include: { source: true, category: true },
            },
          },
        },
      },
    });

    return matches.find((match) => toPublicMatchId(match) === idOrSlug) ?? null;
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

export function toMatchDTO(
  match: Prisma.MatchGetPayload<{
    include: { homeTeam: true; awayTeam: true };
  }>,
): MatchDTO {
  return {
    id: toPublicMatchId(match),
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

function toPublicMatchId(
  match: Prisma.MatchGetPayload<{
    include: { homeTeam: true; awayTeam: true };
  }>,
) {
  const date = match.kickOff.toISOString().slice(0, 10);
  return `${date}-${slugify(match.homeTeam.name)}-vs-${slugify(match.awayTeam.name)}`;
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
