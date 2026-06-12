"use client";

import { MapaNodosView } from "@/components/desktop/mapa/mapa-nodos-view";
import { MapaDesarrolloView } from "@/components/desktop/mapa/mapa-desarrollo-view";
import { readContentTypology } from "@/lib/content-typology";
import { useEffect, useState } from "react";

/** Enruta /mapa según tipología activa (ADR 011 visibilidad A). */
export function MapaPageContent() {
  const [typology, setTypology] = useState<"academico" | "desarrollos">("academico");

  useEffect(() => {
    setTypology(readContentTypology());
  }, []);

  if (typology === "desarrollos") {
    return <MapaDesarrolloView />;
  }

  return <MapaNodosView />;
}
