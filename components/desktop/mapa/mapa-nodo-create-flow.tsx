"use client";

import { MapaLogroForm } from "@/components/shared/forms/mapa-logro-form";
import { MapaNodoSimpleForm } from "@/components/shared/forms/mapa-nodo-simple-form";
import { MapaNodoTipoPicker } from "@/components/shared/forms/mapa-nodo-tipo-picker";
import type { NodoObjetivoClasificacion } from "@/lib/mapa-nodo-tipo";
import type { FormLienzoColocacionConfig } from "@/lib/form-lienzo-colocacion-types";
import { useState } from "react";

type MapaNodoCreateFlowProps = {
  lienzoConfig?: FormLienzoColocacionConfig | null;
  onSuccess: (nodoId?: number) => void;
};

/** Alta en dos pasos: tipo → formulario según clasificación. */
export function MapaNodoCreateFlow({
  lienzoConfig,
  onSuccess,
}: MapaNodoCreateFlowProps) {
  const [tipo, setTipo] = useState<NodoObjetivoClasificacion | null>(null);

  if (tipo == null) {
    return <MapaNodoTipoPicker onSelect={setTipo} />;
  }

  if (tipo === "produccion") {
    return <MapaLogroForm lienzoConfig={lienzoConfig} onSuccess={onSuccess} />;
  }

  return <MapaNodoSimpleForm lienzoConfig={lienzoConfig} onSuccess={onSuccess} />;
}
