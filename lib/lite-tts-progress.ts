/**
 * Avance TTS de Académico lite: estimado de duración + persistencia local
 * por ítem (nunca global). Claves: contenido / conceptos + kind + id.
 */

const STORAGE_PREFIX = "app-estudio-lite-tts-v1";

/** ~150 palabras/min en español (orientativo; no es preciso). */
const WORDS_PER_MINUTE = 150;

export type LiteTtsProgressSaved = {
  v: 1;
  fingerprint: string;
  /** Índice de unidad (trozo de contenido, o concepto en la lista). */
  index: number;
  /** Trozo dentro del concepto actual (solo conceptos). */
  chunkIndex?: number;
};

export function liteTtsProgressKey(
  kind: "contenido" | "conceptos",
  entityKind: string,
  entityId: number,
): string {
  return `${STORAGE_PREFIX}:${kind}:${entityKind}:${entityId}`;
}

/** Huella corta para invalidar el avance si cambió el texto. */
export function liteTtsFingerprint(text: string): string {
  const t = text.trim();
  return `${t.length}:${t.slice(0, 48)}`;
}

export function estimateSpeechSeconds(text: string): number {
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (words === 0) return 0;
  return Math.max(1, Math.round((words / WORDS_PER_MINUTE) * 60));
}

export function formatSpeechDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `~${m}:${r.toString().padStart(2, "0")}`;
}

export function readLiteTtsProgress(
  key: string,
  fingerprint: string,
): LiteTtsProgressSaved | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LiteTtsProgressSaved;
    if (parsed?.v !== 1 || typeof parsed.index !== "number") return null;
    if (parsed.fingerprint !== fingerprint) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeLiteTtsProgress(
  key: string,
  data: Omit<LiteTtsProgressSaved, "v">,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: LiteTtsProgressSaved = { v: 1, ...data };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Quota / modo privado: el play sigue sin persistencia.
  }
}

export function clearLiteTtsProgress(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Progreso 0–1 según caracteres ya “pasados” + fracción del trozo actual. */
export function progressFromChars(
  parts: string[],
  index: number,
  fractionInUnit = 0,
): number {
  if (parts.length === 0) return 0;
  const total = parts.reduce((n, p) => n + p.length, 0);
  if (total === 0) return 0;
  let done = 0;
  for (let i = 0; i < index && i < parts.length; i++) {
    done += parts[i].length;
  }
  if (index < parts.length) {
    done += parts[index].length * Math.min(1, Math.max(0, fractionInUnit));
  } else {
    return 1;
  }
  return Math.min(1, done / total);
}
