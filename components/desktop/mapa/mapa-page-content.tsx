"use client";

import { MapaNodosView } from "@/components/desktop/mapa/mapa-nodos-view";
import { MapaDesarrolloView } from "@/components/desktop/mapa/mapa-desarrollo-view";
import {
  readContentTypology,
  type ContentTypology,
} from "@/lib/content-typology";
import { useEffect, useState } from "react";

/**
 * Enruta /mapa según tipología activa (ADR 011 visibilidad A).
 * `academico_lite` comparte tablas con académico y no tiene mapa propio (ADR 012):
 * cae en la vista de nodos como cualquier tipología académica.
 */
export function MapaPageContent() {
  const [typology, setTypology] = useState<ContentTypology>("academico");

  useEffect(() => {
    setTypology(readContentTypology());
  }, []);

  if (typology === "desarrollos") {
    return <MapaDesarrolloView />;
  }

  return <MapaNodosView />;
}
