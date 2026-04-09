import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import { SportsDbClient } from "./sportsdb.client";
import { normalizeTeamName } from "./team-identity";

interface UpsertTeamInput {
  externalId?: string | null;
  name: string;
  shortName?: string | null;
  badgeUrl?: string | null;
  country?: string | null;
  sport?: string | null;
  alternateNames?: string[];
}

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sportsDbClient: SportsDbClient,
  ) {}

  async resolveTeam(name: string, externalId?: string | null) {
    const normalizedName = normalizeTeamName(name);
    const where = externalId ? [{ externalId }, { normalizedName }] : [{ normalizedName }];

    const existing = await this.prisma.team.findFirst({
      where: {
        OR: where,
      },
    });

    if (existing) {
      return existing;
    }

    const liveTeam = await this.sportsDbClient.searchTeam(name);

    if (liveTeam) {
      return this.upsertTeam({
        externalId: externalId ?? liveTeam.externalId,
        name: liveTeam.name,
        shortName: liveTeam.shortName,
        badgeUrl: liveTeam.badgeUrl,
        country: liveTeam.country,
        sport: liveTeam.sport,
        alternateNames: liveTeam.alternateNames,
      });
    }

    return this.upsertTeam({ externalId, name });
  }

  async upsertTeam(input: UpsertTeamInput) {
    const normalizedName = normalizeTeamName(input.name);
    const where = input.externalId
      ? [{ externalId: input.externalId }, { normalizedName }]
      : [{ normalizedName }];
    const existing = await this.prisma.team.findFirst({
      where: {
        OR: where,
      },
    });

    if (existing) {
      return this.prisma.team.update({
        where: { id: existing.id },
        data: {
          externalId: input.externalId ?? existing.externalId,
          name: input.name,
          normalizedName,
          shortName: input.shortName ?? existing.shortName,
          badgeUrl: input.badgeUrl ?? existing.badgeUrl,
          country: input.country ?? existing.country,
          sport: input.sport ?? existing.sport,
          alternateNames:
            input.alternateNames?.length
              ? input.alternateNames
              : Array.isArray(existing.alternateNames)
                ? existing.alternateNames
                : [],
          sourceUpdatedAt: new Date(),
        },
      });
    }

    return this.prisma.team.create({
      data: {
        externalId: input.externalId,
        name: input.name,
        normalizedName,
        shortName: input.shortName,
        badgeUrl: input.badgeUrl,
        country: input.country,
        sport: input.sport ?? "Soccer",
        alternateNames: input.alternateNames ?? [],
        sourceUpdatedAt: new Date(),
      },
    });
  }

  async refreshTrackedTeams() {
    const teams = await this.prisma.team.findMany();
    let processed = 0;

    for (const team of teams) {
      const refreshed = await this.sportsDbClient.searchTeam(team.name);

      if (!refreshed) {
        continue;
      }

      await this.upsertTeam({
        externalId: refreshed.externalId,
        name: refreshed.name,
        shortName: refreshed.shortName,
        badgeUrl: refreshed.badgeUrl,
        country: refreshed.country,
        sport: refreshed.sport,
        alternateNames: refreshed.alternateNames,
      });
      processed += 1;
    }

    return processed;
  }
}
