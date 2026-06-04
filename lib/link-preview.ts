/** Resolución de miniatura para link de curso (detalle). YouTube por URL; resto vía og:image. */

const FETCH_TIMEOUT_MS = 8_000;
const HTML_SNIPPET_MAX = 120_000;

export type LinkPreviewResult = {
  imageUrl: string | null;
  source: "youtube" | "opengraph" | null;
};

function isBlockedPreviewHost(hostname: string): boolean {
  const h = hostname.replace(/^www\./i, "").toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return true;
  if (/^127\.\d+\.\d+\.\d+$/.test(h) || h === "0.0.0.0") return true;
  if (/^10\.\d+\.\d+\.\d+$/.test(h)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(h)) return true;
  return false;
}

export function normalizeHttpUrl(raw: string): string | null {
  try {
    const parsed = new URL(raw.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (isBlockedPreviewHost(parsed.hostname)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

/** Id de video YouTube desde watch, youtu.be, embed o shorts. */
export function youtubeVideoIdFromUrl(url: string): string | null {
  const href = normalizeHttpUrl(url);
  if (!href) return null;

  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && /^[\w-]{11}$/.test(id) ? id : id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        const v = u.searchParams.get("v");
        return v && v.length > 0 ? v : null;
      }
      const embed = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (embed?.[1]) return embed[1];
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts?.[1]) return shorts[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

function resolveMaybeRelativeUrl(imageUrl: string, pageUrl: string): string | null {
  try {
    return new URL(imageUrl.trim(), pageUrl).href;
  } catch {
    return null;
  }
}

/** Extrae og:image o twitter:image del HTML (sin DOM; suficiente para meta en <head>). */
export function extractPreviewImageFromHtml(html: string, pageUrl: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:secure_url["']/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      const resolved = resolveMaybeRelativeUrl(m[1], pageUrl);
      if (resolved?.startsWith("http")) return resolved;
    }
  }

  return null;
}

export async function resolveLinkPreview(url: string): Promise<LinkPreviewResult> {
  const href = normalizeHttpUrl(url);
  if (!href) return { imageUrl: null, source: null };

  const videoId = youtubeVideoIdFromUrl(href);
  if (videoId) {
    return { imageUrl: youtubeThumbnailUrl(videoId), source: "youtube" };
  }

  try {
    const res = await fetch(href, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (compatible; APPEstudio/1.0; +https://github.com/alenores/APP-Estudio)",
      },
    });

    if (!res.ok) return { imageUrl: null, source: null };

    const reader = res.body?.getReader();
    if (!reader) return { imageUrl: null, source: null };

    const decoder = new TextDecoder();
    let html = "";
    while (html.length < HTML_SNIPPET_MAX) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      if (html.includes("</head>")) break;
    }
    reader.cancel().catch(() => {});

    const finalUrl = res.url || href;
    const imageUrl = extractPreviewImageFromHtml(html, finalUrl);
    return imageUrl
      ? { imageUrl, source: "opengraph" }
      : { imageUrl: null, source: null };
  } catch {
    return { imageUrl: null, source: null };
  }
}
