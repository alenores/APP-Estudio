/**
 * Filtros del listado lite (ADR 012) — funciones puras sobre `LiteItem[]`.
 *
 * Se filtra libremente combinando texto, estado, tipo de estudio y medio; todos
 * los criterios se aplican en AND y cada uno acepta varios valores en OR.
 */

import { liteTieneMedio, type LiteMediaKind } from "@/lib/academico-lite-media";
import { ESTADOS_SEGUIMIENTO, type EstadoSeguimiento } from "@/lib/estado-ui";
import { TIPO_ESTUDIO_VALUES, type TipoEstudio } from "@/lib/tipo-estudio";
import type { LiteItem } from "@/lib/academico-lite-read";

/** `"sin_estado"` agrupa los ítems sin ningún seguimiento cargado. */
export type LiteEstadoFiltro = EstadoSeguimiento | "sin_estado";

export type LiteFiltros = {
  texto: string;
  estados: LiteEstadoFiltro[];
  tipos: TipoEstudio[];
  medios: LiteMediaKind[];
};

export const LITE_FILTROS_VACIOS: LiteFiltros = {
  texto: "",
  estados: [],
  tipos: [],
  medios: [],
};

export const LITE_ESTADO_FILTROS: LiteEstadoFiltro[] = [
  ...ESTADOS_SEGUIMIENTO,
  "sin_estado",
];

export const LITE_TIPO_FILTROS: TipoEstudio[] = [...TIPO_ESTUDIO_VALUES];

export const LITE_MEDIO_FILTROS: LiteMediaKind[] = [
  "youtube",
  "platzi",
  "markdown",
  "link",
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function coincideTexto(item: LiteItem, consulta: string): boolean {
  if (!consulta) return true;
  const campos = [item.nombre, item.descripcion ?? "", item.parentNombre ?? ""];
  const objetivo = normalizar(campos.join(" "));
  return normalizar(consulta)
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => objetivo.includes(token));
}

function coincideEstado(item: LiteItem, estados: LiteEstadoFiltro[]): boolean {
  if (estados.length === 0) return true;
  return estados.some((e) =>
    e === "sin_estado" ? item.estado == null : item.estado === e,
  );
}

function coincideTipo(item: LiteItem, tipos: TipoEstudio[]): boolean {
  if (tipos.length === 0) return true;
  return item.tipoEstudio != null && tipos.includes(item.tipoEstudio);
}

function coincideMedio(item: LiteItem, medios: LiteMediaKind[]): boolean {
  if (medios.length === 0) return true;
  return medios.some((m) => liteTieneMedio(item, m));
}

export function aplicarLiteFiltros(
  items: LiteItem[],
  filtros: LiteFiltros,
): LiteItem[] {
  const texto = filtros.texto.trim();
  if (
    !texto &&
    filtros.estados.length === 0 &&
    filtros.tipos.length === 0 &&
    filtros.medios.length === 0
  ) {
    return items;
  }

  return items.filter(
    (item) =>
      coincideTexto(item, texto) &&
      coincideEstado(item, filtros.estados) &&
      coincideTipo(item, filtros.tipos) &&
      coincideMedio(item, filtros.medios),
  );
}

export function contarLiteFiltrosActivos(filtros: LiteFiltros): number {
  return (
    filtros.estados.length + filtros.tipos.length + filtros.medios.length
  );
}

/** Alterna un valor dentro de una lista de filtros (chips multiselección). */
export function toggleFiltro<T>(actuales: T[], valor: T): T[] {
  return actuales.includes(valor)
    ? actuales.filter((v) => v !== valor)
    : [...actuales, valor];
}

export function liteEstadoFiltroLabel(estado: LiteEstadoFiltro): string {
  switch (estado) {
    case "sin empezar":
      return "Sin empezar";
    case "en curso":
      return "En curso";
    case "pausado":
      return "Pausado";
    case "terminado":
      return "Terminado";
    case "sin_estado":
      return "Sin registro";
  }
}

export function liteMedioLabel(medio: LiteMediaKind): string {
  switch (medio) {
    case "youtube":
      return "YouTube";
    case "platzi":
      return "Platzi";
    case "markdown":
      return "Documento";
    case "link":
      return "Otro link";
  }
}
