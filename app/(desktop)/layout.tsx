import type { ReactNode } from "react";

/** Variables de detalle compartidas; shell escritorio (ADR 008). */
export default function DesktopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="estudio-detalle-page tema-detalle-page min-h-full">{children}</div>
  );
}
