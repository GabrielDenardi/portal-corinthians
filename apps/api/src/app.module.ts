import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

import { ArticlesModule } from "./modules/articles/articles.module";
import { MatchesModule } from "./modules/matches/matches.module";
import { PublicModule } from "./modules/public/public.module";
import { SyncModule } from "./modules/sync/sync.module";
import { TeamsModule } from "./modules/teams/teams.module";
import { ViewsModule } from "./modules/views/views.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    ArticlesModule,
    TeamsModule,
    MatchesModule,
    ViewsModule,
    PublicModule,
    SyncModule,
  ],
})
export class AppModule {}
