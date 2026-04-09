import { Module } from "@nestjs/common";

import { TeamsModule } from "../teams/teams.module";
import { EspnFixturesClient } from "./espn-fixtures.client";
import { MatchesService } from "./matches.service";

@Module({
  imports: [TeamsModule],
  providers: [MatchesService, EspnFixturesClient],
  exports: [MatchesService],
})
export class MatchesModule {}
