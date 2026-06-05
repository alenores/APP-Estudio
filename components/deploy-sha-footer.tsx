/** SHA corto del deploy (Vercel o git local). Ver `next.config.ts`. */
export function DeployShaFooter() {
  const sha = process.env.NEXT_PUBLIC_DEPLOY_SHA ?? "dev";

  return (
    <p
      className="deploy-sha-footer shrink-0 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] text-center font-mono text-[10px] leading-none text-ink-muted/60"
      aria-label={`Versión desplegada ${sha}`}
    >
      {sha}
    </p>
  );
}
