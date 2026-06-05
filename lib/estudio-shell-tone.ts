/** Tono del contenedor móvil (AppShell) y cabecera de columna PC. */
export type EstudioShellTone = "tema" | "curso" | "clase" | "neutral";

export function mobileShellToneClass(tone: EstudioShellTone): string {
  return `mobile-shell-tone-${tone}`;
}

export function explorerColumnHeaderClass(
  kind: "tema" | "curso" | "clase",
): string {
  return `explorer-column-header explorer-column-header--${kind}`;
}
