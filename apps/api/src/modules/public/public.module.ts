import { Module } from "@nestjs/common";

import { ArticlesModule } from "../articles/articles.module";
import { MatchesModule } from "../matches/matches.module";
import { ViewsModule } from "../views/views.module";
import { PublicController } from "./public.controller";
import { PublicService } from "./public.service";

@Module({
  imports: [ArticlesModule, MatchesModule, ViewsModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
