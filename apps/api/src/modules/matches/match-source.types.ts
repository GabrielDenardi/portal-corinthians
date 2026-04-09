import type { NewsTone } from "@portal-corinthians/contracts";

export interface ScheduleMatchRecord {
  externalId: string;
  competition: string;
  round: string;
  venue: string;
  kickOff: Date;
  statusLabel: string;
  statusTone: NewsTone;
  homeTeamName: string;
  homeTeamExternalId?: string;
  homeTeamShortName?: string | null;
  homeTeamBadgeUrl?: string | null;
  awayTeamName: string;
  awayTeamExternalId?: string;
  awayTeamShortName?: string | null;
  awayTeamBadgeUrl?: string | null;
}
