import { DesktopShell } from "@/components/desktop/desktop-shell";
import { MapaNodosView } from "@/components/desktop/mapa/mapa-nodos-view";

/** Mapa de conocimiento — exclusivo shell escritorio (ADR 009). */
export default function MapaPage() {
  return (
    <DesktopShell title="Mapa de conocimiento">
      <div className="flex min-h-0 flex-1 flex-col">
        <MapaNodosView />
      </div>
    </DesktopShell>
  );
}
