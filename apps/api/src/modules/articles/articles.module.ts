import { Module } from "@nestjs/common";

import { ArticlesService } from "./articles.service";
import { GNewsClient } from "./gnews.client";

@Module({
  providers: [ArticlesService, GNewsClient],
  exports: [ArticlesService],
})
export class ArticlesModule {}
