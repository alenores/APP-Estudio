import { DesktopShell } from "@/components/desktop/desktop-shell";
import { MapaNodosView } from "@/components/desktop/mapa/mapa-nodos-view";

/** Mapa de conocimiento — exclusivo shell escritorio (ADR 009). */
export default function MapaPage() {
  return (
    <DesktopShell
      title="Mapa de conocimiento"
      mainClassName="flex min-h-0 w-full flex-1 flex-col max-w-none px-0 pt-0 pb-0"
    >
      <MapaNodosView />
    </DesktopShell>
  );
}
