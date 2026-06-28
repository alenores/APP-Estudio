"use client";

import { DesktopModal } from "@/components/desktop/desktop-modal";
import { ContenidoMarkdownPlayer } from "@/components/mobile/detalle/contenido-markdown-player";

type ExploradorContenidoModalProps = {
  clase: { id: number; nombre: string; contenido_markdown: string };
  onClose: () => void;
};

export function ExploradorContenidoModal({
  clase,
  onClose,
}: ExploradorContenidoModalProps) {
  return (
    <DesktopModal
      open
      onClose={onClose}
      title="Contenido"
      subtitle={`Clase · ${clase.nombre}`}
      size="wide"
    >
      <ContenidoMarkdownPlayer contenido={clase.contenido_markdown} />
    </DesktopModal>
  );
}
