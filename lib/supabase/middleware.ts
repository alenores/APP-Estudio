import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { shellKindFromRequest } from "@/lib/shell-detect";
import {
  defaultAppHome,
  desktopUrlFromMobileDesarrollosPath,
  desktopUrlFromMobilePath,
  DESKTOP_DESARROLLOS_PREFIX,
  DESKTOP_MAPA_PREFIX,
  DESKTOP_SHELL_PREFIX,
  isDesktopShellPath,
  isDesarrollosDetailPath,
  isMobileDesarrollosPath,
  isMobileShellPath,
  isShellRoutingExempt,
} from "@/lib/shell-routes";

const PROTECTED_ACADEMICO_PREFIXES = [
  "/temas",
  "/cursos",
  "/clases",
  "/seguimientos",
  DESKTOP_SHELL_PREFIX,
  DESKTOP_MAPA_PREFIX,
];

const PROTECTED_DESARROLLOS_PREFIXES = [
  "/desarrollos",
  "/definicion-general",
  "/definicion-especifica",
  "/acciones",
  "/pendientes",
  DESKTOP_DESARROLLOS_PREFIX,
];

const PROTECTED_PREFIXES = [
  ...PROTECTED_ACADEMICO_PREFIXES,
  ...PROTECTED_DESARROLLOS_PREFIXES,
];

function applyShellRouting(request: NextRequest): NextResponse | null {
  const path = request.nextUrl.pathname;
  if (isShellRoutingExempt(path)) return null;

  const shell = shellKindFromRequest(request);

  if (shell === "mobile") {
    if (isDesktopShellPath(path)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return null;
  }

  if (isMobileShellPath(path)) {
    const url = request.nextUrl.clone();
    const target = desktopUrlFromMobilePath(path);
    const q = target.indexOf("?");
    url.pathname = q === -1 ? target : target.slice(0, q);
    url.search = q === -1 ? "" : target.slice(q);
    return NextResponse.redirect(url);
  }

  if (isMobileDesarrollosPath(path)) {
    if (isDesarrollosDetailPath(path)) return null;
    const url = request.nextUrl.clone();
    const target = desktopUrlFromMobileDesarrollosPath(path);
    const q = target.indexOf("?");
    url.pathname = q === -1 ? target : target.slice(0, q);
    url.search = q === -1 ? "" : target.slice(q);
    return NextResponse.redirect(url);
  }

  return null;
}

export async function updateSession(request: NextRequest) {
  const shellRedirect = applyShellRouting(request);
  if (shellRedirect) return shellRedirect;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
  const isLogin = path === "/login";
  const isAuthCallback = path.startsWith("/auth/");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (user && isLogin) {
    const url = request.nextUrl.clone();
    const shell = shellKindFromRequest(request);
    url.pathname = defaultAppHome(shell);
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!user && isAuthCallback) {
    return supabaseResponse;
  }

  return supabaseResponse;
}
