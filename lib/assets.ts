import { cache } from "react";

export const CORINTHIANS_CREST_URL =
  "https://static.corinthians.com.br/img/escudo-corinthians-2023.svg";

export const PALMEIRAS_CREST_URL =
  "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg";

const CLUB_CREST_FALLBACKS: Record<string, string> = {
  corinthians: CORINTHIANS_CREST_URL,
  palmeiras: PALMEIRAS_CREST_URL,
};

const CLUB_NAME_ALIASES: Record<string, string> = {
  "sport club corinthians paulista": "corinthians",
  "sccp": "corinthians",
  "sociedade esportiva palmeiras": "palmeiras",
  "se palmeiras": "palmeiras",
  "palmeiras-sp": "palmeiras",
  "atletico mineiro": "atlético mineiro",
  "atletico-mg": "atlético mineiro",
  "atletico mg": "atlético mineiro",
  "atletico paranaense": "athletico paranaense",
  "atletico-pr": "athletico paranaense",
  "atletico pr": "athletico paranaense",
  "sao paulo": "são paulo",
};

type SportsDbTeam = {
  strTeam?: string | null;
  strTeamAlternate?: string | null;
  strSport?: string | null;
  strCountry?: string | null;
  strBadge?: string | null;
};

type SportsDbResponse = {
  teams?: SportsDbTeam[] | null;
};

function normalizeClubName(clubName: string) {
  return clubName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function resolveLookupName(clubName: string) {
  const normalized = normalizeClubName(clubName);
  return CLUB_NAME_ALIASES[normalized] ?? clubName.trim();
}

function getFallbackCrestUrl(clubName: string) {
  return CLUB_CREST_FALLBACKS[normalizeClubName(clubName)] ?? null;
}

function isLikelyTeamMatch(team: SportsDbTeam, clubName: string) {
  const normalizedClubName = normalizeClubName(clubName);
  const teamNames = [team.strTeam, team.strTeamAlternate]
    .filter(Boolean)
    .map((value) => normalizeClubName(value!));

  return teamNames.some(
    (teamName) =>
      teamName === normalizedClubName ||
      teamName.includes(normalizedClubName) ||
      normalizedClubName.includes(teamName),
  );
}

export const getClubCrestUrl = cache(async (clubName: string) => {
  const fallback = getFallbackCrestUrl(clubName);

  try {
    const lookupName = resolveLookupName(clubName);
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(lookupName)}`,
      {
        next: { revalidate: 60 * 60 * 24 },
      },
    );

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as SportsDbResponse;
    const soccerTeams =
      data.teams?.filter((team) => team.strSport === "Soccer" && Boolean(team.strBadge)) ?? [];

    const matchedTeam =
      soccerTeams.find((team) => isLikelyTeamMatch(team, clubName)) ??
      soccerTeams.find((team) => team.strCountry === "Brazil") ??
      soccerTeams[0];

    return matchedTeam?.strBadge ?? fallback;
  } catch {
    return fallback;
  }
});
