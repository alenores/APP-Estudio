"use client";

import { usePathname, useParams } from "next/navigation";
import { entityIdFromPathname } from "@/lib/pwa-offline-shell";
import { parseEntityId } from "@/lib/parse-entity-id";

/**
 * Id de la entidad de la ruta de detalle (ADR 013).
 *
 * Sin conexión el service worker puede servir la shell cacheada de otro id de
 * la misma familia (`/temas/7` responde a `/temas/12`), así que los params del
 * documento no son confiables: manda la URL del navegador. En servidor y en
 * hidratación inicial se usa el param, que es lo único disponible.
 */
export function useRouteEntityId(): number | null {
  const params = useParams();
  const fromParams = parseEntityId(
    typeof params?.id === "string" ? params.id : undefined,
  );

  // Suscribe el componente a la navegación cliente; el valor sale de location.
  const pathname = usePathname();

  if (typeof window === "undefined") return fromParams;
  return entityIdFromPathname(window.location.pathname ?? pathname) ?? fromParams;
}
