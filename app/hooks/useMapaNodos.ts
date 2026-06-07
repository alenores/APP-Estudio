"use client";

import { useMapaGrafo } from "@/app/hooks/useMapaGrafo";

/** @deprecated Prefer `useMapaGrafo('nodos')` — wrapper de compatibilidad. */
export function useMapaNodos() {
  const {
    nodos,
    enlacesNodos,
    objetivos,
    loading,
    error,
    reload,
    patchPosicion,
    addEnlaceNodo,
    removeEnlaceNodo,
  } = useMapaGrafo("nodos");

  return {
    nodos,
    enlaces: enlacesNodos,
    objetivos,
    loading,
    error,
    reload,
    patchPosicion,
    addEnlace: addEnlaceNodo,
    removeEnlace: removeEnlaceNodo,
  };
}
