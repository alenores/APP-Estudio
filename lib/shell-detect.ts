import type { NextRequest } from "next/server";

/** UA típico de teléfono / tablet en modo móvil. */
const MOBILE_UA_RE =
  /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

/**
 * Detección de shell en middleware (servidor).
 * Sin override manual: celular → móvil; PC → escritorio.
 * Usa `sec-ch-ua-mobile` cuando el navegador lo envía; si no, User-Agent.
 */
export function isMobileShellRequest(request: NextRequest): boolean {
  const chMobile = request.headers.get("sec-ch-ua-mobile");
  if (chMobile === "?1") return true;
  if (chMobile === "?0") return false;

  const ua = request.headers.get("user-agent") ?? "";
  return MOBILE_UA_RE.test(ua);
}

export type AppShellKind = "mobile" | "desktop";

export function shellKindFromRequest(request: NextRequest): AppShellKind {
  return isMobileShellRequest(request) ? "mobile" : "desktop";
}
