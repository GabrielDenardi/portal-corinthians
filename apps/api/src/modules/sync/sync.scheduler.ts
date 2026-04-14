import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { ArticlesService } from "../articles/articles.service";
import { MatchesService } from "../matches/matches.service";
import { TeamsService } from "../teams/teams.service";
import { SyncService } from "./sync.service";

@Injectable()
export class SyncSchedulerService {
  constructor(
    private readonly syncService: SyncService,
    private readonly articlesService: ArticlesService,
    private readonly matchesService: MatchesService,
    private readonly teamsService: TeamsService,
  ) {}

  @Cron("*/15 * * * *")
  async syncArticlesJob() {
    await this.syncService.runJob("articles", "gnews", () => this.articlesService.syncLatestArticles());
  }

  @Cron("*/30 * * * *")
  async syncMatchesJob() {
    await this.syncService.runJob("matches", "schedule", () => this.matchesService.syncSchedule());
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncTeamsJob() {
    await this.syncService.runJob("teams", "sportsdb", () => this.teamsService.refreshTrackedTeams());
  }
}
