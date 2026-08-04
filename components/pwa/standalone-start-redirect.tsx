"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isStandaloneMode } from "@/lib/pwa-platform";

/**
 * Desde el ícono de inicio, la home `/` redirige a Académico Lite.
 * Cubre installs viejos cuyo start_url seguía en `/`.
 */
export function StandaloneStartRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname !== "/") return;
    if (!isStandaloneMode()) return;
    router.replace("/lite");
  }, [pathname, router]);

  return null;
}
