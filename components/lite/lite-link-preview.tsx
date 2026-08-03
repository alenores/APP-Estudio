"use client";

import { ExternalLink, Play } from "lucide-react";
import { useEffect, useReducer, useState, type ReactNode } from "react";
import { LiteMediaIcon } from "@/components/lite/lite-media-icon";
import {
  descartarLitePreview,
  litePreviewSync,
  resolveLitePreview,
} from "@/lib/academico-lite-preview";
import type { LiteMedia } from "@/lib/academico-lite-media";

type LiteLinkPreviewProps = {
  media: LiteMedia;
  /** `hero` = detalle a todo el ancho; `thumb` = miniatura de la card. */
  variant: "hero" | "thumb";
  /** Qué mostrar si no hay portada. Por defecto, el botón (hero) o el ícono (thumb). */
  fallback?: ReactNode;
};

/**
 * Portada del material externo (ADR 012).
 *
 * Sin portada —sin conexión, dominio que no expone `og:image`, imagen rota—
 * cae al botón de siempre: la pantalla nunca pierde el acceso al video.
 *
 * Aparece instantánea, sin animación de montaje (ADR 006).
 */
export function LiteLinkPreview({ media, variant, fallback }: LiteLinkPreviewProps) {
  const href = media.href;
  // La caché del módulo es la fuente de verdad; el estado local solo repinta.
  const [, refrescar] = useReducer((n: number) => n + 1, 0);
  /**
   * Link ya intentado. Un fallo de red (offline, abort, DNS) no escribe en la
   * caché a propósito, para poder reintentar en el próximo montaje; sin esta
   * marca el componente se quedaría con el skeleton girando para siempre.
   */
  const [intentado, setIntentado] = useState<string | null>(null);
  const estado = litePreviewSync(href);

  useEffect(() => {
    if (!href || estado.resuelto) return;
    let cancelado = false;
    void resolveLitePreview(href).then(() => {
      if (!cancelado) setIntentado(href);
    });
    return () => {
      cancelado = true;
    };
  }, [href, estado.resuelto]);

  const hero = variant === "hero";
  const resolviendo = !!href && !estado.resuelto && intentado !== href;

  if (href && estado.portada) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir en ${media.label}`}
        className={hero ? "lite-preview lite-preview--hero" : "lite-preview lite-preview--thumb"}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- portada externa de dominio variable */}
        <img
          src={estado.portada}
          alt=""
          className="lite-preview-img"
          loading="lazy"
          decoding="async"
          onError={() => {
            descartarLitePreview(href);
            refrescar();
          }}
        />
        <span className="lite-preview-scrim" aria-hidden />
        <span className="lite-preview-play" aria-hidden>
          <Play
            className={hero ? "h-5 w-5" : "h-3 w-3"}
            strokeWidth={2}
            fill="currentColor"
          />
        </span>
        {hero ? (
          <span className="lite-preview-label" aria-hidden>
            Abrir en {media.label}
          </span>
        ) : null}
      </a>
    );
  }

  // Resolviendo una portada remota: reservar el espacio para que no salte el layout.
  if (resolviendo) {
    return (
      <span
        className={`lite-skeleton block ${hero ? "aspect-video w-full rounded-[18px]" : "lite-preview--thumb"}`}
        aria-hidden
      />
    );
  }

  if (fallback !== undefined) return <>{fallback}</>;

  if (hero && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="lite-cta w-full"
      >
        <ExternalLink className="h-[17px] w-[17px]" strokeWidth={2.2} aria-hidden />
        Abrir en {media.label}
      </a>
    );
  }

  return <LiteMediaIcon media={media} size={hero ? "md" : "sm"} />;
}
