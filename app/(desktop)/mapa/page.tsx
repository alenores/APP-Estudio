import { DesktopShell } from "@/components/desktop/desktop-shell";
import { MapaPageContent } from "@/components/desktop/mapa/mapa-page-content";

/** Mapa de conocimiento — exclusivo shell escritorio (ADR 009). */
export default function MapaPage() {
  return (
    <DesktopShell
      title="Mapa de conocimiento"
      mainClassName="desktop-main-inset flex min-h-0 w-full max-w-none flex-1 flex-col"
    >
      <MapaPageContent />
    </DesktopShell>
  );
}
