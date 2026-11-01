import { describe, expect, it } from "@effect/vitest";

import { faviconUrlForOrigin, toolActivityFaviconUrl } from "./favicon.ts";

// Local fork: favicons never trigger a network lookup.
describe("favicon lookups", () => {
  it("never builds a remote favicon URL for an origin", () => {
    expect(faviconUrlForOrigin("https://github.com/pingdotgg/t3code", 64)).toBeNull();
  });

  it("keeps only inline data: icons for tool activity", () => {
    expect(toolActivityFaviconUrl({ pageUrl: "https://example.com/docs" }, "light")).toBeNull();
    expect(
      toolActivityFaviconUrl(
        { pageUrl: "https://example.com", faviconUrl: "https://example.com/icon.png" },
        "light",
      ),
    ).toBeNull();
    const inline = "data:image/png;base64,AAAA";
    expect(
      toolActivityFaviconUrl({ pageUrl: "https://example.com", faviconUrl: inline }, "dark"),
    ).toBe(inline);
  });
});
