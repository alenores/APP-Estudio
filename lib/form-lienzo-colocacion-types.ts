import type { MapaDetalleHijo, MapaDetalleScope } from "@/lib/mapa-detalle-types";
import type { MapaDetalleHijoKind } from "@/lib/mapa-detalle-types";

/** Contexto para la sección opcional de colocación / enlace en formularios. */
export type FormLienzoColocacionConfig =
  | { mode: "macro-nodos" }
  | { mode: "macro-temas" }
  | {
      mode: "detalle";
      scope: MapaDetalleScope;
      hijos: MapaDetalleHijo[];
    };

export type FormLienzoColocacionState = {
  etapa: string;
  carril: string;
  /** Padre del enlace (origen → ítem nuevo). Vacío = sin flecha. */
  enlacePadreId: string;
  /** Solo detalle mixto: filtrar padres curso vs logro. */
  enlacePadreKind: MapaDetalleHijoKind;
};

export const EMPTY_FORM_LIENZO_COLOCACION: FormLienzoColocacionState = {
  etapa: "",
  carril: "",
  enlacePadreId: "",
  enlacePadreKind: "curso",
};

export function formLienzoColocacionDesdePadreMacro(
  padreId: number,
): FormLienzoColocacionState {
  return {
    ...EMPTY_FORM_LIENZO_COLOCACION,
    enlacePadreId: String(padreId),
  };
}

export function formLienzoColocacionDesdePadreDetalle(
  padre: { kind: MapaDetalleHijoKind; id: number },
): FormLienzoColocacionState {
  return {
    ...EMPTY_FORM_LIENZO_COLOCACION,
    enlacePadreId: String(padre.id),
    enlacePadreKind: padre.kind,
  };
}

export type FormLienzoCreatedEntity =
  | { layer: "macro-nodo"; id: number }
  | { layer: "macro-tema"; id: number }
  | { layer: "detalle"; kind: MapaDetalleHijoKind; id: number };
