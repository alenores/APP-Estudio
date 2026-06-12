"use client";

import { DesarrollosDataProvider } from "@/app/hooks/useDesarrollosData";
import type { ReactNode } from "react";

/** Contexto paquete local tipología desarrollos (ADR 011). */
export function DesarrollosDataRoot({ children }: { children: ReactNode }) {
  return <DesarrollosDataProvider>{children}</DesarrollosDataProvider>;
}
