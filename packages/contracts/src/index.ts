export type CategorySlug =
  | "profissional"
  | "feminino"
  | "base"
  | "mercado"
  | "torcida"
  | "clube";

export type BadgeVariant = "breaking" | "live" | "category" | "status";

export type NewsTone = "default" | "alert" | "success" | "warning";

export type MatchScope = "upcoming" | "recent" | "all";

export interface CategoryDTO {
  slug: CategorySlug;
  label: string;
  description: string;
}

export interface ArticleListItemDTO {
  id: string;
  slug: string;
  title: string;
  dek: string;
  summary: string;
  category: CategoryDTO;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  readTime: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  badge?: BadgeVariant | null;
  badgeLabel?: string | null;
  tone?: NewsTone | null;
  viewCount: number;
}

export interface ArticleDetailDTO extends ArticleListItemDTO {
  body: string[];
  canonicalUrl?: string | null;
  related: ArticleListItemDTO[];
}

export interface MatchTeamDTO {
  id: string;
  name: string;
  shortName?: string | null;
  badgeUrl?: string | null;
}

export interface MatchDTO {
  id: string;
  competition: string;
  round: string;
  homeTeam: MatchTeamDTO;
  awayTeam: MatchTeamDTO;
  venue: string;
  kickOff: string;
  broadcast: string;
  note: string;
  statusLabel: string;
  statusTone: NewsTone;
}

export interface PaginatedArticlesDTO {
  category: CategoryDTO;
  items: ArticleListItemDTO[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HomeCategoryFeedDTO {
  category: CategoryDTO;
  items: ArticleListItemDTO[];
}

export interface HomeFeedDTO {
  featured: ArticleListItemDTO | null;
  highlights: ArticleListItemDTO[];
  latest: ArticleListItemDTO[];
  mostRead: ArticleListItemDTO[];
  spotlight: ArticleListItemDTO[];
  categories: HomeCategoryFeedDTO[];
  upcomingMatch: MatchDTO | null;
  updatedAt: string;
}

export interface IncrementArticleViewDTO {
  viewCount: number;
}

export interface HealthDTO {
  status: "ok";
  timestamp: string;
}
