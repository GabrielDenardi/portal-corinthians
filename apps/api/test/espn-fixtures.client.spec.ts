import { describe, expect, it, vi } from "vitest";

import { extractEspnEvents, mapEspnEvent } from "../src/modules/matches/espn-fixtures.client";

describe("ESPN fixtures client helpers", () => {
  it("extracts events from the espnfitt page state", () => {
    const html = `<script>window['__espnfitt__']=${JSON.stringify({
      page: {
        content: {
          fixtures: {
            events: [
              {
                id: "401865474",
                date: "2026-04-10T00:00Z",
                league: "CONMEBOL Libertadores",
                status: { state: "pre" },
                venue: { fullName: "Ciudad de Vicente López" },
                teams: [
                  { displayName: "Platense", abbrev: "PLA", isHome: true },
                  { displayName: "Corinthians", abbrev: "COR", isHome: false },
                ],
              },
            ],
          },
        },
      },
    })};</script>`;

    const events = extractEspnEvents(html, "fixtures");

    expect(events).toHaveLength(1);
    expect(events[0]?.id).toBe("401865474");
  });

  it("maps an ESPN event into the portal schedule shape", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-09T12:00:00-03:00"));

    const mapped = mapEspnEvent({
      id: "401865474",
      date: "2026-04-10T00:00:00Z",
      league: "CONMEBOL Libertadores",
      status: { state: "pre" },
      venue: { fullName: "Ciudad de Vicente López" },
      teams: [
        {
          id: "7764",
          displayName: "Platense",
          abbrev: "PLA",
          logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7764.png",
          isHome: true,
        },
        {
          id: "874",
          displayName: "Corinthians",
          abbrev: "COR",
          logo: "https://a.espncdn.com/i/teamlogos/soccer/500/874.png",
          isHome: false,
        },
      ],
    });

    expect(mapped).toEqual({
      externalId: "espn:401865474",
      competition: "Libertadores",
      round: "Fase de grupos",
      venue: "Ciudad de Vicente López",
      kickOff: new Date("2026-04-10T00:00:00Z"),
      statusLabel: "Pré-jogo",
      statusTone: "alert",
      homeTeamName: "Platense",
      homeTeamShortName: "PLA",
      homeTeamBadgeUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/7764.png",
      awayTeamName: "Corinthians",
      awayTeamShortName: "COR",
      awayTeamBadgeUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/874.png",
    });

    vi.useRealTimers();
  });
});
