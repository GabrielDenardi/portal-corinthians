export type CategorySlug = string;

export type BadgeVariant = "breaking" | "live" | "category" | "status";

export type NewsTone = "default" | "alert" | "success" | "warning";

export type MatchScope = "upcoming" | "recent" | "all";

export type UserRole = "admin" | "editor";

export type ArticleStatus = "draft" | "approved" | "published" | "archived";

export type IncomingStoryStatus = "pending" | "approved" | "rejected";

export type MatchCoveragePhase = "pre" | "live" | "post";

export type HomeSlotKey =
  | "featured"
  | "highlight-1"
  | "highlight-2"
  | "highlight-3"
  | "spotlight-1"
  | "spotlight-2"
  | "spotlight-3";

export interface CategoryDTO {
  id: string;
  slug: CategorySlug;
  label: string;
  description: string;
}

export interface BreadcrumbDTO {
  label: string;
  href: string;
}

export interface SourceContextDTO {
  sourceName: string;
  sourceUrl: string;
  originalTitle?: string | null;
  note: string;
}

export interface ShareMetadataDTO {
  title: string;
  description: string;
  url: string;
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
  breadcrumbs: BreadcrumbDTO[];
  sourceContext: SourceContextDTO;
  share: ShareMetadataDTO;
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

export interface MatchTimelineEventDTO {
  id: string;
  minute: string;
  type: string;
  teamSide: "home" | "away" | "neutral";
  title: string;
  description: string;
}

export interface MatchOfficialDTO {
  role: string;
  name: string;
}

export interface MatchLineupEntryDTO {
  id: string;
  teamSide: "home" | "away";
  section: "starting" | "bench";
  playerName: string;
  shirtNumber?: string | null;
  role?: string | null;
}

export interface MatchDetailDTO extends MatchDTO {
  coveragePhase: MatchCoveragePhase;
  scoreHome?: number | null;
  scoreAway?: number | null;
  stadium?: string | null;
  competitionStage?: string | null;
  officials: MatchOfficialDTO[];
  lineups: MatchLineupEntryDTO[];
  timeline: MatchTimelineEventDTO[];
  relatedArticles: ArticleListItemDTO[];
  breadcrumbs: BreadcrumbDTO[];
  share: ShareMetadataDTO;
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

export interface SessionDTO {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface AdminLoginDTO {
  email: string;
  password: string;
}

export interface UserListItemDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface IncomingStoryDTO {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  status: IncomingStoryStatus;
  suggestedCategory: CategoryDTO;
  matchedArticleId?: string | null;
  priority: number;
  relevance: number;
}

export interface AuditLogDTO {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  details?: string | null;
}

export interface ArticleEditorDTO {
  id: string;
  slug: string;
  title: string;
  dek: string;
  summary: string;
  body: string[];
  status: ArticleStatus;
  featuredRank: number;
  sortOrder: number;
  isPinnedHome: boolean;
  pinnedCategoryIds: string[];
  category: CategoryDTO;
  sourceName: string;
  sourceUrl: string;
  publishedAt?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  viewCount: number;
  badge?: BadgeVariant | null;
  badgeLabel?: string | null;
}

export interface HomeSlotAssignmentDTO {
  slot: HomeSlotKey;
  articleId?: string | null;
}

export interface ProviderHealthDTO {
  provider: string;
  status: "ok" | "degraded" | "failed";
  lastRunAt?: string | null;
  lastMessage?: string | null;
}
