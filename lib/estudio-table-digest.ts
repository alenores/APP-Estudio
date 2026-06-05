/** Huella estable del contenido de una tabla (detección de altas, bajas y ediciones). */

export type TableContentSignature = {
  maxId: number;
  rowCount: number;
  digest: string;
};

export function emptyTableContentSignature(): TableContentSignature {
  return { maxId: 0, rowCount: 0, digest: "0" };
}

function maxEntityId(items: { id: number }[]): number {
  return items.length ? Math.max(...items.map((item) => item.id)) : 0;
}

/** djb2 xor — suficiente para detectar cambios, no criptográfico. */
export function hashStableString(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function canonicalRowJson(row: Record<string, unknown>): string {
  const keys = Object.keys(row).sort();
  const normalized: Record<string, unknown> = {};
  for (const key of keys) {
    normalized[key] = row[key];
  }
  return JSON.stringify(normalized);
}

/** Digest sobre filas ordenadas por `id` (todas las columnas del row). */
export function buildTableContentSignature(
  rows: { id: number }[],
): TableContentSignature {
  if (rows.length === 0) {
    return emptyTableContentSignature();
  }

  const sorted = [...rows].sort((a, b) => a.id - b.id);
  const payload = sorted
    .map((row) => canonicalRowJson(row as Record<string, unknown>))
    .join("\n");

  return {
    maxId: maxEntityId(rows),
    rowCount: rows.length,
    digest: hashStableString(payload),
  };
}

export function tableContentSignatureChanged(
  local: TableContentSignature,
  remote: TableContentSignature,
): boolean {
  return (
    local.maxId !== remote.maxId ||
    local.rowCount !== remote.rowCount ||
    local.digest !== remote.digest
  );
}
