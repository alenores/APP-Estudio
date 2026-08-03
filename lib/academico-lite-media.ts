/**
 * Medio de consumo de un ítem lite (ADR 012).
 *
 * Único dato "duro" que la card del listado muestra además del estado y el tipo
 * de estudio: si el material es un video (YouTube / Platzi), otro link externo o
 * un documento markdown propio.
 */

import { platformFromLink } from "@/lib/platform-from-link";
import type { LiteItem } from "@/lib/academico-lite-read";

export type LiteMediaKind = "youtube" | "platzi" | "link" | "markdown";

export type LiteMedia = {
  kind: LiteMediaKind;
  label: string;
  /** Presente solo cuando el medio se abre fuera de la app. */
  href: string | null;
};

function mediaFromLink(link: string | null): LiteMedia | null {
  const plataforma = platformFromLink(link);
  if (!plataforma || !link) return null;

  if (plataforma.label === "YouTube") {
    return { kind: "youtube", label: "YouTube", href: link };
  }
  if (plataforma.label === "Platzi") {
    return { kind: "platzi", label: "Platzi", href: link };
  }
  return { kind: "link", label: plataforma.label, href: link };
}

/**
 * Medios del ítem, en orden de relevancia: primero el video/link externo,
 * después el documento markdown propio. Máximo dos entradas.
 */
export function liteMedios(item: LiteItem): LiteMedia[] {
  const medios: LiteMedia[] = [];
  const externo = mediaFromLink(item.link);
  if (externo) medios.push(externo);
  if (item.contenido?.trim()) {
    medios.push({ kind: "markdown", label: "Documento", href: null });
  }
  return medios;
}

/** Filtro por medio en el listado (chips de la barra de filtros). */
export function liteTieneMedio(item: LiteItem, kind: LiteMediaKind): boolean {
  return liteMedios(item).some((m) => m.kind === kind);
}
