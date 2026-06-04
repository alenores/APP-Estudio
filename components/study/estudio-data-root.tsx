"use client";

import { EstudioDataProvider } from "@/app/hooks/useEstudioData";
import type { ReactNode } from "react";

/** Envuelve la app para un solo contexto de paquete local entre /temas, /cursos y /clases. */
export function EstudioDataRoot({ children }: { children: ReactNode }) {
  return <EstudioDataProvider>{children}</EstudioDataProvider>;
}
