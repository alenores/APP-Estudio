/** Tono del contenedor móvil (AppShell) y cabecera de columna PC. */
export type EstudioEntityTone = "tema" | "curso" | "clase";

/** Tono de registros hijos (seguimientos, etc.). */
export type EstudioRecordTone = "seguimiento";

export type EstudioShellTone = EstudioEntityTone | EstudioRecordTone | "neutral";

/** Superficies con color de entidad o registro (sheet, modal, tiles). */
export type EstudioSurfaceTone = EstudioEntityTone | EstudioRecordTone;

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
