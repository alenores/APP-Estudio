import type {
  FormLienzoColocacionConfig,
  FormLienzoColocacionState,
  FormLienzoCreatedEntity,
} from "@/lib/form-lienzo-colocacion-types";
import { insertEnlaceHijoNodo } from "@/lib/mapa-detalle-enlace-queries";
import { upsertLienzoHijoPosicion } from "@/lib/mapa-detalle-posicion-queries";
import { mapaDetallePosicionDesdeEtapaCarril } from "@/lib/mapa-detalle-layout";
import { posicionDesdeEtapaCarril } from "@/lib/mapa-layout";
import { insertMapaEnlace } from "@/lib/mapa-queries";
import { insertEnlaceTema, updateTemaLienzoLayout } from "@/lib/temas-lienzo-queries";
import {
  hasFormLienzoColocacionInput,
  parseFormLienzoEnlacePadreId,
  parseFormLienzoEtapaCarril,
} from "@/lib/form-lienzo-colocacion";

/** Tras crear un ítem: posición en lienzo y flecha desde padre (si el usuario completó la sección). */
export async function applyFormLienzoColocacion(
  userId: string,
  config: FormLienzoColocacionConfig,
  state: FormLienzoColocacionState,
  created: FormLienzoCreatedEntity,
): Promise<{ error: string | null }> {
  if (!hasFormLienzoColocacionInput(state)) {
    return { error: null };
  }

  const { etapa, carril } = parseFormLienzoEtapaCarril(state);
  const padreId = parseFormLienzoEnlacePadreId(state);
  const etapaNum = etapa ?? 0;
  const carrilNum = carril ?? 0;
  const tieneLayout = etapa !== undefined || carril !== undefined;

  if (config.mode === "macro-nodos" && created.layer === "macro-nodo") {
    if (padreId != null && padreId !== created.id) {
      const { error } = await insertMapaEnlace(userId, padreId, created.id);
      if (error && !error.includes("origen_destino")) return { error };
    }
    return { error: null };
  }

  if (config.mode === "macro-temas" && created.layer === "macro-tema") {
    if (tieneLayout) {
      const pos = posicionDesdeEtapaCarril(etapaNum, carrilNum);
      const { error } = await updateTemaLienzoLayout(created.id, {
        etapa: etapaNum,
        carril: carrilNum,
        pos_x: pos.x,
        pos_y: pos.y,
      });
      if (error) return { error };
    }
    if (padreId != null && padreId !== created.id) {
      const { error } = await insertEnlaceTema(userId, padreId, created.id);
      if (error && !error.includes("origen_destino")) return { error };
    }
    return { error: null };
  }

  if (config.mode === "detalle" && created.layer === "detalle") {
    if (tieneLayout) {
      const pos = mapaDetallePosicionDesdeEtapaCarril(etapaNum, carrilNum);
      const { error } = await upsertLienzoHijoPosicion(
        userId,
        config.scope,
        { kind: created.kind, id: created.id },
        pos.x,
        pos.y,
      );
      if (error) return { error };
    }
    if (padreId != null) {
      const padreKind = state.enlacePadreKind;
      const { error } = await insertEnlaceHijoNodo(
        userId,
        config.scope,
        { kind: padreKind, id: padreId },
        { kind: created.kind, id: created.id },
      );
      if (error && !error.includes("origen_destino")) return { error };
    }
    return { error: null };
  }

  return { error: null };
}
