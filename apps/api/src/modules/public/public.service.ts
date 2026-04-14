import type { MatchScope } from "@portal-corinthians/contracts";
import { Injectable } from "@nestjs/common";

import { ArticlesService } from "../articles/articles.service";
import { MatchesService } from "../matches/matches.service";
import { ViewsService } from "../views/views.service";

@Injectable()
export class PublicService {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly matchesService: MatchesService,
    private readonly viewsService: ViewsService,
  ) {}

  async getHome() {
    const upcomingMatch = await this.matchesService.getUpcomingMatch();
    return this.articlesService.getHomeFeed(upcomingMatch);
  }

  async getArticle(slug: string) {
    return this.articlesService.getArticleBySlug(slug);
  }

  async getCategoryArticles(slug: string, page: number, limit: number) {
    return this.articlesService.getCategoryArticles(slug, page, limit);
  }

  async getMatches(scope: MatchScope) {
    return this.matchesService.getMatches(scope);
  }

  async getMatchDetail(id: string) {
    return this.matchesService.getMatchDetail(id);
  }

  async incrementArticleView(slug: string, clientKey?: string) {
    return this.viewsService.incrementArticleView(slug, clientKey);
  }
}
