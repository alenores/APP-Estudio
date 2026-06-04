import type { Seguimiento } from "@/app/types/estudio";
import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";

/** Suma de `tiempo_consumido` en todos los seguimientos del tema. */
export function sumaTiempoConsumidoTema(seguimientos: Seguimiento[]): number {
  return seguimientos.reduce((acc, s) => acc + (s.tiempo_consumido ?? 0), 0);
}

/**
 * Restante estimado: del seguimiento con mayor `fecha_registro` (último registro),
 * no sumatorio — alineado a ADR 002 / derivados.
 */
export function tiempoRestanteUltimoSeguimiento(
  seguimientos: Seguimiento[],
): number | null {
  const { tiempo_faltante_estimado } = derivarDesdeSeguimientos(seguimientos);
  return tiempo_faltante_estimado;
}
