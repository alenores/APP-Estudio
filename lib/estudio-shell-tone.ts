/** Tono del contenedor móvil (AppShell) y cabecera de columna PC. */
export type EstudioEntityTone = "tema" | "curso" | "clase";

/** Colores pastel del panel móvil (mismos que --estudio-shell-* en globals.css). */
export const ESTUDIO_ENTITY_SHELL_BG: Record<EstudioEntityTone, string> = {
  tema: "#d4f0eb",
  curso: "#dceefb",
  clase: "#fde8e4",
};

/** Tono de registros hijos (seguimientos, etc.). */
export type EstudioRecordTone = "seguimiento";

export type EstudioShellTone = EstudioEntityTone | EstudioRecordTone | "neutral";

/** Superficies con color de entidad o registro (sheet, modal, tiles). */
export type EstudioSurfaceTone = EstudioEntityTone | EstudioRecordTone;

export function isEstudioEntityTone(
  tone: EstudioShellTone,
): tone is EstudioEntityTone {
  return tone === "tema" || tone === "curso" || tone === "clase";
}

/**
 * Tono de la card madre móvil (panel AppShell) según profundidad de navegación:
 * - Listado de temas → verde (tema)
 * - Detalle de tema (cursos hijos) → celeste (curso)
 * - Detalle de curso o clase (clases / ficha clase) → salmón (clase)
 */
export function shellToneFromPath(pathname: string): EstudioShellTone {
  const path = pathname.replace(/\/$/, "") || "/";

  if (path.startsWith("/clases/")) return "clase";
  if (path.startsWith("/cursos/")) return "clase";
  if (path === "/temas" || path === "/temas/nuevo") return "tema";
  if (path.startsWith("/temas/")) return "curso";

  return "neutral";
}

export function estudioEntityShellBgVar(tone: EstudioEntityTone): string {
  return `var(--estudio-shell-${tone})`;
}

export function estudioEntityShellBgHex(tone: EstudioEntityTone): string {
  return ESTUDIO_ENTITY_SHELL_BG[tone];
}

export function mobileShellToneClass(tone: EstudioShellTone): string {
  return `mobile-shell-tone-${tone}`;
}

export function explorerColumnHeaderClass(kind: EstudioEntityTone): string {
  return `explorer-column-header explorer-column-header--${kind}`;
}

export function studySheetToneClass(tone?: EstudioSurfaceTone): string {
  return tone ? `study-sheet-tone-${tone}` : "";
}

export function desktopModalToneClass(tone?: EstudioSurfaceTone): string {
  return tone ? `desktop-modal-tone-${tone}` : "";
}

export function estudioFormWellClass(tone: EstudioSurfaceTone): string {
  return `estudio-form-well estudio-form-well--${tone}`;
}

export function recordActionTileClass(tone: EstudioRecordTone): string {
  return `explorer-record-tile explorer-record-tile--${tone}`;
}

export function seguimientoListItemClass(): string {
  return "td-item td-item-seguimiento";
}
