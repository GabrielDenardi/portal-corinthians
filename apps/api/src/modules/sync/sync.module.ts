import { Module } from "@nestjs/common";

import { ArticlesModule } from "../articles/articles.module";
import { MatchesModule } from "../matches/matches.module";
import { TeamsModule } from "../teams/teams.module";
import { SyncSchedulerService } from "./sync.scheduler";
import { SyncService } from "./sync.service";

@Module({
  imports: [ArticlesModule, MatchesModule, TeamsModule],
  providers: [SyncService, SyncSchedulerService],
  exports: [SyncService],
})
export class SyncModule {}
