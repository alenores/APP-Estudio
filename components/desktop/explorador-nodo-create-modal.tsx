"use client";

import { DesktopModal } from "@/components/desktop/desktop-modal";
import { MapaNodoCreateFlow } from "@/components/desktop/mapa/mapa-nodo-create-flow";
import { estudioFormWellClass } from "@/lib/estudio-shell-tone";

type ExploradorNodoCreateModalProps = {
  onClose: () => void;
  onCreated: (nodoId: number | null) => void;
};

export function ExploradorNodoCreateModal({
  onClose,
  onCreated,
}: ExploradorNodoCreateModalProps) {
  return (
    <DesktopModal
      open
      onClose={onClose}
      title="Nuevo ítem"
      subtitle="Nodos objetivo — elegí tipo"
      tone="tema"
    >
      <div className={estudioFormWellClass("tema")}>
        <MapaNodoCreateFlow
          onSuccess={(nodoId) => {
            onCreated(nodoId ?? null);
            onClose();
          }}
        />
      </div>
    </DesktopModal>
  );
}
