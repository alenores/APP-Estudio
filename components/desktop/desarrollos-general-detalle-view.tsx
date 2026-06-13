"use client";

import { desarrollosExplorerHref } from "@/app/hooks/useDesarrollosExplorer";
import { DesarrollosDetalleNav } from "@/components/desktop/desarrollos-detalle-nav";
import { DesarrollosGeneralDetalleBlock } from "@/components/desktop/desarrollos-general-detalle-block";
import { AlertText } from "@/components/ui";
import { parseEntityId } from "@/lib/parse-entity-id";
import { useParams } from "next/navigation";

/** Ficha definición general — solo PC (explorador desarrollos). */
export function DesarrollosGeneralDetalleView() {
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);

  if (id == null) {
    return <AlertText>Identificador inválido</AlertText>;
  }

  const explorerHref = desarrollosExplorerHref({
    generalId: id,
    especificaId: null,
    accionId: null,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 pb-8">
      <DesarrollosDetalleNav explorerHref={explorerHref} />
      <DesarrollosGeneralDetalleBlock generalId={id} />
    </div>
  );
}
