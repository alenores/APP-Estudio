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
    <div
      className="relative flex items-stretch gap-0 overflow-hidden rounded-2xl border border-border bg-paper-elevated transition-all duration-200 active:scale-[0.985] hover:border-accent/30 hover:shadow-md"
      style={{
        boxShadow: "0 1px 4px rgba(26,35,50,0.07), 0 4px 16px -6px rgba(26,35,50,0.10)",
      }}
    >
      {/* Franja lateral de estado */}
      <span
        className={`shrink-0 w-[3px] self-stretch rounded-l-2xl ${estadoDotClass(etiqueta_estado).replace("rounded-full h-2.5 w-2.5", "")}`}
        style={{
          background: etiqueta_estado === "terminado"
            ? "var(--estado-terminado)"
            : etiqueta_estado === "en curso"
            ? "var(--estado-en-curso)"
            : etiqueta_estado === "pausado"
            ? "var(--estado-pausado)"
            : "var(--border-strong)",
        }}
        aria-hidden
      />
      <Link
        href={href}
        prefetch={false}
        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4"
        onClick={forwardTransition ? nav.onClick : undefined}
        onPointerDown={forwardTransition ? nav.onPointerDown : undefined}
        onPointerMove={forwardTransition ? nav.onPointerMove : undefined}
        onPointerUp={forwardTransition ? nav.onPointerUp : undefined}
        onPointerCancel={forwardTransition ? nav.onPointerCancel : undefined}
        style={forwardTransition ? { touchAction: "pan-y" } : undefined}
      >
        {/* Indicador de estado circular */}
        <span
          className={`mt-0.5 h-3 w-3 shrink-0 self-start rounded-full ring-2 ring-offset-2 ring-offset-paper-elevated ${estadoDotClass(etiqueta_estado)}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug text-ink">{nombre}</h3>
            {badge ? (
              <span className="shrink-0 rounded-full bg-border/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                {badge}
              </span>
            ) : null}
          </div>
          {subtitulo ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">{subtitulo}</p>
          ) : null}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {estadoTexto ? (
              <span className="text-xs font-medium text-ink-muted">{estadoTexto}</span>
            ) : null}
            {porcentaje_avance != null ? (
              <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-bold text-accent">
                {porcentaje_avance}%
              </span>
            ) : null}
          </div>
        </div>
        {!hasExternal ? (
          <ChevronRightIcon />
        ) : null}
      </Link>
      {hasExternal ? (
        <PlatformLinkIcon link={externalLink!} size="sm" className="mr-4 self-center mt-0.5" />
      ) : null}
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0 text-border-strong"
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
