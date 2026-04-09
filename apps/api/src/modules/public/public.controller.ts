import type { HealthDTO, MatchScope } from "@portal-corinthians/contracts";
import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Query } from "@nestjs/common";

import { IncrementArticleViewBodyDto } from "./dto/increment-article-view.dto";
import { PublicService } from "./public.service";

@Controller()
export class PublicController {
  constructor(@Inject(PublicService) private readonly publicService: PublicService) {}

  @Get("public/home")
  getHome() {
    return this.publicService.getHome();
  }

  @Get("public/articles/:slug")
  getArticle(@Param("slug") slug: string) {
    return this.publicService.getArticle(slug);
  }

  @Get("public/categories/:slug/articles")
  getCategoryArticles(
    @Param("slug") slug: string,
    @Query("page", new ParseIntPipe({ optional: true })) page = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 12,
  ) {
    return this.publicService.getCategoryArticles(slug, page, limit);
  }

  @Get("public/matches")
  getMatches(@Query("scope") scope: MatchScope = "upcoming") {
    return this.publicService.getMatches(scope);
  }

  @Post("public/articles/:slug/view")
  incrementArticleView(
    @Param("slug") slug: string,
    @Body() body: IncrementArticleViewBodyDto,
  ) {
    return this.publicService.incrementArticleView(slug, body.clientKey);
  }

  @Get("health")
  getHealth(): HealthDTO {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
