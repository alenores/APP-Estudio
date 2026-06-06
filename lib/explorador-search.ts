export function normalizeSearchQuery(query: string): string {
  return query.trim().toLocaleLowerCase("es");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type HighlightPart = {
  text: string;
  match: boolean;
};

/** Partes de texto para resaltar coincidencias (case-insensitive, locale es). */
export function highlightMatchParts(
  text: string,
  query: string,
): HighlightPart[] {
  const q = normalizeSearchQuery(query);
  if (!q || !text) return [{ text, match: false }];

  const re = new RegExp(escapeRegExp(q), "gi");
  const parts: HighlightPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), match: false });
    }
    parts.push({ text: match[0], match: true });
    lastIndex = match.index + match[0].length;
    if (match[0].length === 0) break;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), match: false });
  }

  return parts.length > 0 ? parts : [{ text, match: false }];
}

function consecutiveMatchBonus(haystack: string, needle: string): number {
  const idx = haystack.indexOf(needle);
  if (idx === -1) return 0;
  return Math.min(needle.length * 2, 24);
}

/** Mayor puntaje = mejor coincidencia (nombre priorizado sobre descripción). */
export function scoreEntitySearch(
  nombre: string,
  descripcion: string | null | undefined,
  query: string,
): number {
  const q = normalizeSearchQuery(query);
  if (!q) return 0;

  const n = nombre.toLocaleLowerCase("es");
  const d = (descripcion ?? "").toLocaleLowerCase("es");
  let score = 0;

  if (n.startsWith(q)) score += 100;
  else if (n.includes(q)) score += 80;
  else {
    const words = q.split(/\s+/).filter(Boolean);
    if (words.some((w) => n.includes(w))) score += 55;
  }

  if (d.includes(q)) score += 28;
  else {
    const words = q.split(/\s+/).filter(Boolean);
    if (words.some((w) => d.includes(w))) score += 18;
  }

  score += consecutiveMatchBonus(n, q);
  if (!n.includes(q)) score += consecutiveMatchBonus(d, q) * 0.45;

  return score;
}

export type RankedSearchRow<T> = {
  item: T;
  score: number;
};

export function rankSearchResults<T>(
  items: T[],
  query: string,
  readFields: (item: T) => { nombre: string; descripcion: string | null | undefined },
): RankedSearchRow<T>[] {
  const q = normalizeSearchQuery(query);
  if (!q) return [];

  return items
    .map((item) => {
      const { nombre, descripcion } = readFields(item);
      return { item, score: scoreEntitySearch(nombre, descripcion, q) };
    })
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        readFields(a.item).nombre.localeCompare(
          readFields(b.item).nombre,
          "es",
          { sensitivity: "base" },
        ),
    );
}
