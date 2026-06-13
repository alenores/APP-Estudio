/** Info de plataforma derivada del URL del curso (favicon + nombre para accesibilidad). */

export type PlatformInfo = {
  hostname: string;
  label: string;
  faviconUrl: string;
};

/** Dominios conocidos → nombre legible para aria-label. */
const KNOWN_PLATFORMS: Record<string, string> = {
  "platzi.com": "Platzi",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "udemy.com": "Udemy",
  "coursera.org": "Coursera",
  "edx.org": "edX",
  "linkedin.com": "LinkedIn Learning",
  "skillshare.com": "Skillshare",
  "chatgpt.com": "ChatGPT",
  "chat.openai.com": "ChatGPT",
  "openai.com": "ChatGPT",
  "claude.ai": "Claude",
  "gemini.google.com": "Gemini",
  "copilot.microsoft.com": "Copilot",
  "perplexity.ai": "Perplexity",
  "poe.com": "Poe",
  "grok.com": "Grok",
  "x.ai": "Grok",
};

function hostnameFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

/** Favicon por dominio (online-first; ver ADR 001). */
export function faviconUrlForHostname(hostname: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
}

/**
 * Extrae plataforma desde `link` del curso.
 * `plataforma` en Supabase queda opcional; la UI usa esto cuando hay URL.
 */
export function platformFromLink(url: string | null | undefined): PlatformInfo | null {
  if (!url?.trim()) return null;
  const hostname = hostnameFromUrl(url);
  if (!hostname) return null;

  const label =
    KNOWN_PLATFORMS[hostname] ??
    KNOWN_PLATFORMS[hostname.split(".").slice(-2).join(".")] ??
    hostname;

  return {
    hostname,
    label,
    faviconUrl: faviconUrlForHostname(hostname),
  };
}
