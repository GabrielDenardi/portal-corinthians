import { describe, expect, it } from "vitest";

import {
  getCorinthiansOpponent,
  isCorinthiansMatchup,
  isCorinthiansTeamName,
  normalizeTeamName,
} from "../src/modules/teams/team-identity";

describe("team identity helpers", () => {
  it("recognizes Corinthians aliases", () => {
    expect(isCorinthiansTeamName("Corinthians")).toBe(true);
    expect(isCorinthiansTeamName("Sport Club Corinthians Paulista")).toBe(true);
    expect(isCorinthiansTeamName("SCCP")).toBe(true);
    expect(isCorinthiansTeamName("Cardiff City")).toBe(false);
  });

  it("filters matchups to Corinthians only", () => {
    expect(isCorinthiansMatchup("Corinthians", "Palmeiras")).toBe(true);
    expect(isCorinthiansMatchup("Sao Paulo", "Sport Club Corinthians Paulista")).toBe(true);
    expect(isCorinthiansMatchup("Cardiff City", "Bolton Wanderers")).toBe(false);
  });

  it("picks the correct opponent", () => {
    expect(getCorinthiansOpponent("Corinthians", "Palmeiras")).toBe("Palmeiras");
    expect(getCorinthiansOpponent("Sao Paulo", "Sport Club Corinthians Paulista")).toBe("Sao Paulo");
  });

  it("normalizes team names consistently", () => {
    expect(normalizeTeamName("São Paulo")).toBe("sao-paulo");
  });
});
