/** Rutas exclusivas del shell móvil (detalle en profundidad). */
export const MOBILE_SHELL_PREFIXES = [
  "/temas",
  "/cursos",
  "/clases",
  "/seguimientos",
] as const;

/** Rutas móvil tipología desarrollos (ADR 011). */
export const MOBILE_DESARROLLOS_PREFIXES = [
  "/desarrollos",
  "/definicion-general",
  "/definicion-especifica",
  "/acciones",
] as const;

/** Prefijo del shell escritorio (explorador 3 columnas). */
export const DESKTOP_SHELL_PREFIX = "/explorador";

/** Explorador desarrollos — exclusivo escritorio. */
export const DESKTOP_DESARROLLOS_PREFIX = "/explorador-desarrollos";

/** Mapa de conocimiento — exclusivo escritorio (ADR 009). Sin acceso móvil. */
export const DESKTOP_MAPA_PREFIX = "/mapa";

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

export function isMobileDesarrollosPath(pathname: string): boolean {
  return MOBILE_DESARROLLOS_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isDesktopShellPath(pathname: string): boolean {
  return (
    pathname === DESKTOP_SHELL_PREFIX ||
    pathname.startsWith(`${DESKTOP_SHELL_PREFIX}/`) ||
    pathname === DESKTOP_DESARROLLOS_PREFIX ||
    pathname.startsWith(`${DESKTOP_DESARROLLOS_PREFIX}/`) ||
    pathname === DESKTOP_MAPA_PREFIX ||
    pathname.startsWith(`${DESKTOP_MAPA_PREFIX}/`)
  );
}

/** Destino escritorio equivalente a una ruta móvil académica (query de selección). */
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

/** Destino escritorio equivalente a ruta móvil desarrollos. */
export function desktopUrlFromMobileDesarrollosPath(pathname: string): string {
  const generalMatch = /^\/definicion-general\/(\d+)/.exec(pathname);
  if (generalMatch) {
    return `${DESKTOP_DESARROLLOS_PREFIX}?general=${generalMatch[1]}`;
  }
  const especificaMatch = /^\/definicion-especifica\/(\d+)/.exec(pathname);
  if (especificaMatch) {
    return `${DESKTOP_DESARROLLOS_PREFIX}?especifica=${especificaMatch[1]}`;
  }
  const accionMatch = /^\/acciones\/(\d+)/.exec(pathname);
  if (accionMatch) {
    return `${DESKTOP_DESARROLLOS_PREFIX}?accion=${accionMatch[1]}`;
  }
  if (pathname === "/desarrollos" || pathname.startsWith("/desarrollos/")) {
    return DESKTOP_DESARROLLOS_PREFIX;
  }
  return DESKTOP_DESARROLLOS_PREFIX;
}

/** Home post-login según shell — selector de tipología en `/`. */
export function defaultAppHome(_shell: "mobile" | "desktop"): string {
  return "/";
}

export function desarrollosEntryPath(shell: "mobile" | "desktop"): string {
  return shell === "mobile" ? "/desarrollos" : DESKTOP_DESARROLLOS_PREFIX;
}

export function academicoEntryPath(shell: "mobile" | "desktop"): string {
  return shell === "mobile" ? "/temas" : DESKTOP_SHELL_PREFIX;
}
