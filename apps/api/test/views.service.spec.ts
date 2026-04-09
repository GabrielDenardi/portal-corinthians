import { describe, expect, it, vi } from "vitest";

import { computeViewWindowBucket } from "../src/modules/views/views.service";

describe("views service helpers", () => {
  it("groups timestamps into 6 hour windows", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T13:10:00.000Z"));

    expect(computeViewWindowBucket()).toBe("2026-04-08:2");

    vi.useRealTimers();
  });
});
