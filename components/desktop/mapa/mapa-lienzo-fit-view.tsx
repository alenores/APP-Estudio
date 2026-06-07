"use client";

import type { MapaLienzoContentRect } from "@/lib/mapa-lienzo-fit-bounds";
import { useReactFlow } from "@xyflow/react";
import { useEffect, useRef } from "react";

type MapaLienzoFitViewProps = {
  contentRect: MapaLienzoContentRect | null;
  /** Solo cambia en carga, alta/baja de ítems, orientación o scope — no al arrastrar. */
  fitKey: string;
};

/** Encuadra el viewport al rectángulo de contenido (grid + nodos). */
export function MapaLienzoFitView({ contentRect, fitKey }: MapaLienzoFitViewProps) {
  const { fitBounds } = useReactFlow();
  const contentRectRef = useRef(contentRect);
  contentRectRef.current = contentRect;

  const lastFitKeyRef = useRef<string | null>(null);
  const fittedForKeyRef = useRef(false);

  useEffect(() => {
    const rect = contentRectRef.current;
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      fittedForKeyRef.current = false;
      return;
    }

    if (lastFitKeyRef.current !== fitKey) {
      lastFitKeyRef.current = fitKey;
      fittedForKeyRef.current = false;
    }

    if (fittedForKeyRef.current) return;
    fittedForKeyRef.current = true;

    const run = () => {
      const latest = contentRectRef.current;
      if (!latest || latest.width <= 0 || latest.height <= 0) return;
      void fitBounds(latest, { padding: 0.06, duration: 180 });
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
