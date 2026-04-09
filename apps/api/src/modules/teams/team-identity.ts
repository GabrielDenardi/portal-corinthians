const CORINTHIANS_ALIASES = new Set([
  "corinthians",
  "sport-club-corinthians-paulista",
  "sccp",
]);

export function normalizeTeamName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isCorinthiansTeamName(value?: string | null) {
  if (!value) {
    return false;
  }

  return CORINTHIANS_ALIASES.has(normalizeTeamName(value));
}

export function isCorinthiansMatchup(homeTeam?: string | null, awayTeam?: string | null) {
  return isCorinthiansTeamName(homeTeam) || isCorinthiansTeamName(awayTeam);
}

export function getCorinthiansOpponent(homeTeam: string, awayTeam: string) {
  return isCorinthiansTeamName(homeTeam) ? awayTeam : homeTeam;
}
