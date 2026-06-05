"use client";

import Link from "next/link";
import type { SeguimientoDerivados } from "@/app/types/estudio";
import { PlatformLinkIcon } from "@/components/ui/platform-link-icon";
import { estadoDotClass, estadoLabel } from "@/lib/estado-ui";
import { useNavItemForwardSwipe } from "@/lib/use-nav-item-forward-swipe";
import { useRouter } from "next/navigation";

export type EntityCardProps = {
  href: string;
  nombre: string;
  /** Descripción u otro subtítulo (ya no se usa plataforma aquí). */
  subtitulo?: string | null;
  /** Link externo del curso → ícono de plataforma tocable. */
  externalLink?: string | null;
  derivados: SeguimientoDerivados;
  badge?: string | null;
  /** Tras long-press con menú contextual, evita abrir el detalle en el mismo tap. */
  blockNavigation?: boolean;
  onNavigateBlocked?: () => void;
  /** Tap o swipe ←: transición hacia detalle del hijo (paridad gestos móvil). */
  forwardTransition?: boolean;
  /** Cancela long-press del padre al detectar swipe horizontal. */
  onForwardSwipeStart?: () => void;
};

export function EntityCard({
  href,
  nombre,
  subtitulo,
  externalLink,
  derivados,
  badge,
  blockNavigation = false,
  forwardTransition = false,
  onForwardSwipeStart,
}: EntityCardProps) {
  const router = useRouter();
  const { etiqueta_estado, porcentaje_avance } = derivados;
  const estadoTexto = estadoLabel(etiqueta_estado);
  const hasExternal = Boolean(externalLink?.trim());

  const nav = useNavItemForwardSwipe({
    router,
    href,
    itemKey: href,
    enabled: forwardTransition,
    blockNavigation,
    onSwipeStarted: onForwardSwipeStart,
  });

  return (
    <div className="flex items-start gap-2 rounded-2xl border border-border bg-paper-elevated p-4 shadow-sm transition hover:border-accent/30 hover:shadow-md">
      <Link
        href={href}
        prefetch={false}
        className="flex min-w-0 flex-1 items-start gap-3"
        onClick={forwardTransition ? nav.onClick : undefined}
        onPointerDown={forwardTransition ? nav.onPointerDown : undefined}
        onPointerMove={forwardTransition ? nav.onPointerMove : undefined}
        onPointerUp={forwardTransition ? nav.onPointerUp : undefined}
        onPointerCancel={forwardTransition ? nav.onPointerCancel : undefined}
        style={forwardTransition ? { touchAction: "pan-y" } : undefined}
      >
        <span
          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${estadoDotClass(etiqueta_estado)}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-ink">{nombre}</h3>
            {badge ? (
              <span className="shrink-0 text-[10px] uppercase tracking-wide text-ink-muted">
                {badge}
              </span>
            ) : null}
          </div>
          {subtitulo ? (
            <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{subtitulo}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {estadoTexto ? (
              <span className="text-xs text-ink-muted">{estadoTexto}</span>
            ) : null}
            {porcentaje_avance != null ? (
              <span className="text-xs font-medium text-accent">
                {porcentaje_avance}%
              </span>
            ) : null}
          </div>
        </div>
        {!hasExternal ? (
          <span className="text-border-strong" aria-hidden>
            ›
          </span>
        ) : null}
      </Link>
      {hasExternal ? (
        <PlatformLinkIcon link={externalLink!} size="sm" className="mt-0.5" />
      ) : null}
    </div>
  );
}
