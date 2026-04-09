import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type GNewsArticle = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  source?: {
    name?: string;
    url?: string;
  };
};

type GNewsResponse = {
  articles?: GNewsArticle[];
};

export interface GNewsNormalizedArticle {
  title: string;
  description: string;
  url: string;
  canonicalUrl: string;
  imageUrl?: string;
  publishedAt: Date;
  sourceName: string;
  sourceUrl: string;
}

@Injectable()
export class GNewsClient {
  private readonly logger = new Logger(GNewsClient.name);
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>("GNEWS_API_KEY");
  }

  async fetchLatestCorinthiansArticles() {
    if (!this.apiKey) {
      this.logger.warn("GNEWS_API_KEY not configured, skipping live article sync.");
      return [] as GNewsNormalizedArticle[];
    }

    const query = encodeURIComponent('Corinthians OR "Sport Club Corinthians Paulista"');
    const url = `https://gnews.io/api/v4/search?q=${query}&lang=pt&country=br&max=25&sortby=publishedAt&apikey=${this.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`GNews request failed with status ${response.status}`);
    }

    const data = (await response.json()) as GNewsResponse;

    return (data.articles ?? [])
      .filter((article): article is Required<Pick<GNewsArticle, "title" | "url" | "publishedAt">> & GNewsArticle =>
        Boolean(article.title && article.url && article.publishedAt),
      )
      .map((article) => ({
        title: article.title!,
        description: article.description ?? article.title!,
        url: article.url!,
        canonicalUrl: article.url!,
        imageUrl: article.image,
        publishedAt: new Date(article.publishedAt!),
        sourceName: article.source?.name ?? "GNews",
        sourceUrl: article.source?.url ?? article.url!,
      }));
  }
}
