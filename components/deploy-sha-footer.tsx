/**
 * SHA corto del deploy (Vercel o git local). Ver `next.config.ts`.
 *
 * Fijo en pantalla (no al final del flujo) para poder chequear la versión
 * sin scrollear, aunque el contenido de la pantalla sea largo. Esquina
 * inferior izquierda: los FAB de acción usan la derecha.
 */
export function DeployShaFooter() {
  const sha = process.env.NEXT_PUBLIC_DEPLOY_SHA ?? "dev";

  return (
    <p
      className="deploy-sha-footer pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+0.25rem)] left-1.5 z-40 select-none font-mono text-[10px] font-semibold leading-none text-ink-muted/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
      aria-label={`Versión desplegada ${sha}`}
    >
      {sha}
    </p>
  );
}
