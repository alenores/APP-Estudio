import type { HijosProgressStats } from "@/lib/hijos-progress-stats";

export function combinarHijosStats(
  a: HijosProgressStats | undefined,
  b: HijosProgressStats | undefined,
): HijosProgressStats | undefined {
  if (!a && !b) return undefined;
  const total = (a?.total ?? 0) + (b?.total ?? 0);
  const terminadas = (a?.terminadas ?? 0) + (b?.terminadas ?? 0);
  return { total, terminadas };
}
