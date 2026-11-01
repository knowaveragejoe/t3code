/** Accepts image URLs supplied by a trusted provider event. */
function explicitFaviconUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || rawUrl.length > 4096) return null;
  try {
    const url = new URL(rawUrl);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "data:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function toolActivityFaviconUrl(
  icon: {
    readonly pageUrl: string;
    readonly faviconUrl?: string | undefined;
    readonly faviconUrlDark?: string | undefined;
  },
  appearance: "light" | "dark",
  size = 32,
): string | null {
  // Local fork: no favicon lookups; only inline data: icons render.
  const explicit = explicitFaviconUrl(
    appearance === "dark" ? (icon.faviconUrlDark ?? icon.faviconUrl) : icon.faviconUrl,
  );
  void size;
  return explicit?.startsWith("data:") ? explicit : null;
}

export function faviconUrlForOrigin(rawUrl: string | null | undefined, size = 32): string | null {
  // Local fork: never ask Google (or the linked site) for a favicon.
  void rawUrl;
  void size;
  return null;
}
