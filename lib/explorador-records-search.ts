import {
  normalizeSearchQuery,
  scoreEntitySearch,
  type RankedSearchRow,
} from "@/lib/explorador-search";
import type { RecordEntityContext } from "@/lib/explorador-tema-records";

function scoreTextField(text: string, q: string, weight: number): number {
  const hay = text.toLocaleLowerCase("es");
  if (!hay || !q) return 0;
  if (hay.startsWith(q)) return weight;
  if (hay.includes(q)) return weight * 0.82;
  const words = q.split(/\s+/).filter(Boolean);
  if (words.some((w) => hay.includes(w))) return weight * 0.55;
  return 0;
}

export function scoreConceptoRecordSearch(
  titulo: string,
  descripcion: string,
  ctx: RecordEntityContext,
  query: string,
): number {
  const q = normalizeSearchQuery(query);
  if (!q) return 0;

  let score = scoreEntitySearch(titulo, descripcion, query);
  score += scoreTextField(ctx.temaNombre ?? "", q, 36);
  score += scoreTextField(ctx.cursoNombre ?? "", q, 44);
  score += scoreTextField(ctx.claseNombre ?? "", q, 40);
  score += scoreTextField(descripcion, q, 52);
  return score;
}

export function scoreSeguimientoRecordSearch(
  comentario: string | null | undefined,
  etiqueta: string | null | undefined,
  ctx: RecordEntityContext,
  query: string,
): number {
  const q = normalizeSearchQuery(query);
  if (!q) return 0;

  let score = 0;
  score += scoreTextField(comentario ?? "", q, 50);
  score += scoreTextField(etiqueta ?? "", q, 38);
  score += scoreTextField(ctx.temaNombre ?? "", q, 32);
  score += scoreTextField(ctx.cursoNombre ?? "", q, 40);
  score += scoreTextField(ctx.claseNombre ?? "", q, 36);
  return score;
}

export function rankConceptoRecords<T extends { titulo: string; descripcion: string }>(
  items: T[],
  query: string,
  readContext: (item: T) => RecordEntityContext,
): RankedSearchRow<T>[] {
  const q = normalizeSearchQuery(query);
  if (!q) return items.map((item) => ({ item, score: 0 }));

  return items
    .map((item) => ({
      item,
      score: scoreConceptoRecordSearch(
        item.titulo,
        item.descripcion,
        readContext(item),
        query,
      ),
    }))
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.item.titulo.localeCompare(b.item.titulo, "es", { sensitivity: "base" }),
    );
}

export function rankSeguimientoRecords<
  T extends {
    comentario: string | null;
    etiqueta_estado: string | null;
    fecha_registro: string;
  },
>(
  items: T[],
  query: string,
  readContext: (item: T) => RecordEntityContext,
): RankedSearchRow<T>[] {
  const q = normalizeSearchQuery(query);
  if (!q) return items.map((item) => ({ item, score: 0 }));

  return items
    .map((item) => ({
      item,
      score: scoreSeguimientoRecordSearch(
        item.comentario,
        item.etiqueta_estado,
        readContext(item),
        query,
      ),
    }))
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.item.fecha_registro ?? "").localeCompare(a.item.fecha_registro ?? ""),
    );
}
