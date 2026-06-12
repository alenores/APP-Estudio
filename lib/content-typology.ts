/** Tipología de contenido activa — ADR 011. */

export type ContentTypology = "academico" | "desarrollos";

export const CONTENT_TYPOLOGY_STORAGE_KEY = "app-estudio-tipologia-v1";

const DEFAULT_TYPOLOGY: ContentTypology = "academico";

export function isContentTypology(value: string | null | undefined): value is ContentTypology {
  return value === "academico" || value === "desarrollos";
}

export function readContentTypology(): ContentTypology {
  if (typeof window === "undefined") return DEFAULT_TYPOLOGY;
  try {
    const raw = window.localStorage.getItem(CONTENT_TYPOLOGY_STORAGE_KEY);
    return isContentTypology(raw) ? raw : DEFAULT_TYPOLOGY;
  } catch {
    return DEFAULT_TYPOLOGY;
  }
}

export function writeContentTypology(typology: ContentTypology): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONTENT_TYPOLOGY_STORAGE_KEY, typology);
  } catch {
    /* ignore */
  }
}

export function parseContentTypologyFromSearchParams(
  params: URLSearchParams,
): ContentTypology | null {
  const raw = params.get("tipologia");
  return isContentTypology(raw) ? raw : null;
}

export function typologyEntryPath(
  typology: ContentTypology,
  shell: "mobile" | "desktop",
): string {
  if (typology === "desarrollos") {
    return shell === "mobile" ? "/desarrollos" : "/explorador-desarrollos";
  }
  return shell === "mobile" ? "/temas" : "/explorador";
}
