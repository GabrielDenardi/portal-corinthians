import { Module } from "@nestjs/common";

import { TeamsModule } from "../teams/teams.module";
import { MatchesService } from "./matches.service";

@Module({
  imports: [TeamsModule],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
