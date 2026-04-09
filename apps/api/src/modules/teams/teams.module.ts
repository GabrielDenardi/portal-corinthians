import { Module } from "@nestjs/common";

import { TeamsService } from "./teams.service";
import { SportsDbClient } from "./sportsdb.client";

@Module({
  providers: [TeamsService, SportsDbClient],
  exports: [TeamsService, SportsDbClient],
})
export class TeamsModule {}
