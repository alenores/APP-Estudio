/** SHA corto del deploy (Vercel o git local). Ver `next.config.ts`. */
export function DeployShaFooter() {
  const sha = process.env.NEXT_PUBLIC_DEPLOY_SHA ?? "dev";

  return (
    <p
      className="shrink-0 py-3 text-center font-mono text-[10px] leading-none text-slate-600"
      aria-label={`Versión desplegada ${sha}`}
    >
      {sha}
    </p>
  );
}
