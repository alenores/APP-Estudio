/**
 * Paleta de objetivos (roadmap ERP) — independiente de temas/cursos/clases/estado.
 * Usar en mapa (`lib/mapa-objetivo.ts`) y explorador (dot en cards de curso).
 */

import type { ObjetivoId } from "@/app/types/objetivo";

export type { ObjetivoId };

/** Colores representativos (teal / ámbar / fucsia — fuera de navy, salvia y carriles). */
export const OBJETIVO_COLOR: Record<ObjetivoId, string> = {
  1: "#0F766E",
  2: "#B45309",
  3: "#A21CAF",
};

export const OBJETIVO_SHORT: Record<ObjetivoId, string> = {
  1: "BaaS",
  2: "Infra propia",
  3: "SaaS",
};

/** Nombres del catálogo (fallback si no se lee BD). */
export const OBJETIVO_NOMBRE: Record<ObjetivoId, string> = {
  1: "ERP funcional con BaaS",
  2: "ERP con infraestructura propia",
  3: "ERP SaaS a escala",
};

export function parseObjetivoId(
  id: number | null | undefined,
): ObjetivoId | null {
  if (id === 1 || id === 2 || id === 3) return id;
  return null;
}

export function objetivoColor(id: ObjetivoId): string {
  return OBJETIVO_COLOR[id];
}

export function objetivoShortLabel(id: ObjetivoId): string {
  return OBJETIVO_SHORT[id];
}

/** aria-label / title del indicador en cards. */
export function objetivoIndicatorTitle(
  id: ObjetivoId,
  nombre?: string | null,
): string {
  const base = nombre?.trim() || OBJETIVO_NOMBRE[id];
  return `${base} (${objetivoShortLabel(id)})`;
}
