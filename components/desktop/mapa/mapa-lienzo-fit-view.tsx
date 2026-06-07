"use client";

import type { MapaLienzoContentRect } from "@/lib/mapa-lienzo-fit-bounds";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";

type MapaLienzoFitViewProps = {
  contentRect: MapaLienzoContentRect | null;
  /** Cambia cuando datos u orientación cambian — fuerza re-encuadre. */
  fitKey: string;
};

/** Encuadra el viewport al rectángulo de contenido (grid + nodos). */
export function MapaLienzoFitView({ contentRect, fitKey }: MapaLienzoFitViewProps) {
  const { fitBounds } = useReactFlow();

  useEffect(() => {
    if (!contentRect || contentRect.width <= 0 || contentRect.height <= 0) {
      return;
    }

    const run = () => {
      void fitBounds(contentRect, { padding: 0.06, duration: 180 });
    };

    const t = window.setTimeout(run, 40);
    const t2 = window.setTimeout(run, 220);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [contentRect, fitKey, fitBounds]);

  return null;
}
