/** Rutas exclusivas del shell móvil (detalle en profundidad). */
export const MOBILE_SHELL_PREFIXES = [
  "/temas",
  "/cursos",
  "/clases",
  "/seguimientos",
] as const;

/** Prefijo del shell escritorio (explorador 3 columnas). */
export const DESKTOP_SHELL_PREFIX = "/explorador";

/** Rutas sin redirección por shell (auth, API, offline). */
export const SHELL_ROUTING_EXEMPT_PREFIXES = [
  "/login",
  "/auth",
  "/api",
  "/offline",
] as const;

export function isShellRoutingExempt(pathname: string): boolean {
  if (pathname === "/manifest.webmanifest") return true;
  return SHELL_ROUTING_EXEMPT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isMobileShellPath(pathname: string): boolean {
  return MOBILE_SHELL_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isDesktopShellPath(pathname: string): boolean {
  return (
    pathname === DESKTOP_SHELL_PREFIX ||
    pathname.startsWith(`${DESKTOP_SHELL_PREFIX}/`)
  );
}

/** Destino escritorio equivalente a una ruta móvil (query de selección). */
export function desktopUrlFromMobilePath(pathname: string): string {
  const temaMatch = /^\/temas\/(\d+)/.exec(pathname);
  if (temaMatch) {
    return `${DESKTOP_SHELL_PREFIX}?tema=${temaMatch[1]}`;
  }
  const cursoMatch = /^\/cursos\/(\d+)/.exec(pathname);
  if (cursoMatch) {
    return `${DESKTOP_SHELL_PREFIX}?curso=${cursoMatch[1]}`;
  }
  const claseMatch = /^\/clases\/(\d+)/.exec(pathname);
  if (claseMatch) {
    return `${DESKTOP_SHELL_PREFIX}?clase=${claseMatch[1]}`;
  }
  return DESKTOP_SHELL_PREFIX;
}

/** Home post-login según shell. */
export function defaultAppHome(shell: "mobile" | "desktop"): string {
  return shell === "mobile" ? "/temas" : DESKTOP_SHELL_PREFIX;
}
