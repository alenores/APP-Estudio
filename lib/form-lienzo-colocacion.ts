import type {
  FormLienzoColocacionState,
} from "@/lib/form-lienzo-colocacion-types";

export function hasFormLienzoColocacionInput(
  state: FormLienzoColocacionState,
): boolean {
  return (
    state.etapa.trim() !== "" ||
    state.carril.trim() !== "" ||
    state.enlacePadreId.trim() !== ""
  );
}

export function parseFormLienzoEtapaCarril(state: FormLienzoColocacionState): {
  etapa: number | undefined;
  carril: number | undefined;
} {
  const etapaRaw = state.etapa.trim();
  const carrilRaw = state.carril.trim();
  return {
    etapa: etapaRaw === "" ? undefined : Number(etapaRaw),
    carril: carrilRaw === "" ? undefined : Number(carrilRaw),
  };
}

export function parseFormLienzoEnlacePadreId(
  state: FormLienzoColocacionState,
): number | undefined {
  const raw = state.enlacePadreId.trim();
  if (raw === "") return undefined;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

/** Extras para insert de nodo macro si el usuario indicó etapa/carril. */
export function mapaNodoInsertExtrasFromLienzo(
  state: FormLienzoColocacionState,
): { etapa: number; carril: number } | undefined {
  const { etapa, carril } = parseFormLienzoEtapaCarril(state);
  if (etapa === undefined && carril === undefined) return undefined;
  return { etapa: etapa ?? 0, carril: carril ?? 0 };
}
