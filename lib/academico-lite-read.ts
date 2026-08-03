/**
 * Lectura del paquete local para la tipología **académico lite** (ADR 012).
 *
 * Mismas tablas que académico (ADR 002) leídas desde el snapshot `localStorage`
 * (ADR 001), pero proyectadas a un ítem plano con lo único que la UI lite muestra:
 * nombre, estado derivado, tipo de estudio y medio (video / documento).
 *
 * No calcula métricas de seguimiento (tiempos, porcentajes, niveles): la pantalla
 * lite es de consumo, no de gestión.
 */

import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";
import { normalizarEstado, type EstadoSeguimiento } from "@/lib/estado-ui";
import { parseTipoEstudio, type TipoEstudio } from "@/lib/tipo-estudio";
import type { EstudioOfflineCacheData } from "@/lib/estudio-offline-cache";
import type {
  Clase,
  Concepto,
  Curso,
  Seguimiento,
  Tema,
} from "@/app/types/estudio";

export type LiteEntityKind = "tema" | "curso" | "clase";

/** Referencia mínima a una entidad — clave de la pila de detalle. */
export type LiteEntityRef = {
  kind: LiteEntityKind;
  id: number;
};

export type LiteItem = {
  kind: LiteEntityKind;
  id: number;
  nombre: string;
  descripcion: string | null;
  /** Estado derivado del último seguimiento (ADR 002). */
  estado: EstadoSeguimiento | null;
  tipoEstudio: TipoEstudio | null;
  /** Link externo (YouTube, Platzi, …). */
  link: string | null;
  /** Documento markdown propio de la clase. */
  contenido: string | null;
  /** Nombre del padre para el breadcrumb de la card (curso → tema, clase → curso). */
  parentNombre: string | null;
  parent: LiteEntityRef | null;
  hijosTotal: number;
  hijosTerminados: number;
};

function ordenar<T extends { orden: number; jerarquia: number; nombre: string }>(
  filas: T[],
): T[] {
  return [...filas].sort(
    (a, b) =>
      a.orden - b.orden ||
      a.jerarquia - b.jerarquia ||
      a.nombre.localeCompare(b.nombre, "es"),
  );
}

function estadoDe(seguimientos: Seguimiento[]): EstadoSeguimiento | null {
  return normalizarEstado(derivarDesdeSeguimientos(seguimientos).etiqueta_estado);
}

/** Índices por dimensión — evita recorrer `seguimientos` una vez por fila. */
type LiteIndex = {
  segPorTema: Map<number, Seguimiento[]>;
  segPorCurso: Map<number, Seguimiento[]>;
  segPorClase: Map<number, Seguimiento[]>;
  cursosPorTema: Map<number, Curso[]>;
  clasesPorCurso: Map<number, Clase[]>;
  temaPorId: Map<number, Tema>;
  cursoPorId: Map<number, Curso>;
};

function pushEn<T>(mapa: Map<number, T[]>, clave: number, valor: T): void {
  const actual = mapa.get(clave);
  if (actual) actual.push(valor);
  else mapa.set(clave, [valor]);
}

function buildIndex(cache: EstudioOfflineCacheData): LiteIndex {
  const index: LiteIndex = {
    segPorTema: new Map(),
    segPorCurso: new Map(),
    segPorClase: new Map(),
    cursosPorTema: new Map(),
    clasesPorCurso: new Map(),
    temaPorId: new Map(),
    cursoPorId: new Map(),
  };

  for (const s of cache.seguimientos) {
    if (s.tema_id != null) pushEn(index.segPorTema, s.tema_id, s);
    else if (s.curso_id != null) pushEn(index.segPorCurso, s.curso_id, s);
    else if (s.clase_id != null) pushEn(index.segPorClase, s.clase_id, s);
  }

  const ordenarPorFecha = (lista: Seguimiento[]) =>
    lista.sort((a, b) => (b.fecha_registro ?? "").localeCompare(a.fecha_registro ?? ""));
  index.segPorTema.forEach(ordenarPorFecha);
  index.segPorCurso.forEach(ordenarPorFecha);
  index.segPorClase.forEach(ordenarPorFecha);

  for (const t of cache.temas) index.temaPorId.set(t.id, t);
  for (const c of cache.cursos) {
    index.cursoPorId.set(c.id, c);
    pushEn(index.cursosPorTema, c.tema_id, c);
  }
  for (const cl of cache.clases) pushEn(index.clasesPorCurso, cl.curso_id, cl);

  return index;
}

function statsHijos(
  hijos: { id: number }[],
  segPorHijo: Map<number, Seguimiento[]>,
): { total: number; terminados: number } {
  let terminados = 0;
  for (const hijo of hijos) {
    if (estadoDe(segPorHijo.get(hijo.id) ?? []) === "terminado") terminados += 1;
  }
  return { total: hijos.length, terminados };
}

function temaToItem(tema: Tema, index: LiteIndex): LiteItem {
  const cursos = index.cursosPorTema.get(tema.id) ?? [];
  const { total, terminados } = statsHijos(cursos, index.segPorCurso);
  return {
    kind: "tema",
    id: tema.id,
    nombre: tema.nombre,
    descripcion: tema.descripcion,
    estado: estadoDe(index.segPorTema.get(tema.id) ?? []),
    tipoEstudio: null,
    link: null,
    contenido: null,
    parentNombre: null,
    parent: null,
    hijosTotal: total,
    hijosTerminados: terminados,
  };
}

function cursoToItem(curso: Curso, index: LiteIndex): LiteItem {
  const clases = index.clasesPorCurso.get(curso.id) ?? [];
  const { total, terminados } = statsHijos(clases, index.segPorClase);
  const tema = index.temaPorId.get(curso.tema_id) ?? null;
  return {
    kind: "curso",
    id: curso.id,
    nombre: curso.nombre,
    descripcion: curso.descripcion,
    estado: estadoDe(index.segPorCurso.get(curso.id) ?? []),
    tipoEstudio: parseTipoEstudio(curso.tipo_estudio),
    link: curso.link,
    contenido: null,
    parentNombre: tema?.nombre ?? null,
    parent: tema ? { kind: "tema", id: tema.id } : null,
    hijosTotal: total,
    hijosTerminados: terminados,
  };
}

function claseToItem(clase: Clase, index: LiteIndex): LiteItem {
  const curso = index.cursoPorId.get(clase.curso_id) ?? null;
  return {
    kind: "clase",
    id: clase.id,
    nombre: clase.nombre,
    descripcion: clase.descripcion,
    estado: estadoDe(index.segPorClase.get(clase.id) ?? []),
    tipoEstudio: parseTipoEstudio(clase.tipo_estudio),
    link: clase.link,
    contenido: clase.contenido_markdown,
    parentNombre: curso?.nombre ?? null,
    parent: curso ? { kind: "curso", id: curso.id } : null,
    hijosTotal: 0,
    hijosTerminados: 0,
  };
}

/** Proyección completa del snapshot — se calcula una vez por cambio de cache. */
export type LiteSnapshot = {
  temas: LiteItem[];
  cursos: LiteItem[];
  clases: LiteItem[];
  porClave: Map<string, LiteItem>;
  hijosPorClave: Map<string, LiteItem[]>;
  conceptosPorClave: Map<string, Concepto[]>;
};

export function liteKey(kind: LiteEntityKind, id: number): string {
  return `${kind}:${id}`;
}

export const EMPTY_LITE_SNAPSHOT: LiteSnapshot = {
  temas: [],
  cursos: [],
  clases: [],
  porClave: new Map(),
  hijosPorClave: new Map(),
  conceptosPorClave: new Map(),
};

export function buildLiteSnapshot(
  cache: EstudioOfflineCacheData | null,
): LiteSnapshot {
  if (!cache) return EMPTY_LITE_SNAPSHOT;

  const index = buildIndex(cache);

  const temas = ordenar(cache.temas).map((t) => temaToItem(t, index));
  const cursos = ordenar(cache.cursos).map((c) => cursoToItem(c, index));
  const clases = ordenar(cache.clases).map((cl) => claseToItem(cl, index));

  const porClave = new Map<string, LiteItem>();
  for (const item of [...temas, ...cursos, ...clases]) {
    porClave.set(liteKey(item.kind, item.id), item);
  }

  const hijosPorClave = new Map<string, LiteItem[]>();
  for (const curso of cursos) {
    if (curso.parent) pushEn2(hijosPorClave, liteKey("tema", curso.parent.id), curso);
  }
  for (const clase of clases) {
    if (clase.parent) pushEn2(hijosPorClave, liteKey("curso", clase.parent.id), clase);
  }

  const conceptosPorClave = new Map<string, Concepto[]>();
  for (const concepto of cache.conceptos) {
    const clave =
      concepto.tema_id != null
        ? liteKey("tema", concepto.tema_id)
        : concepto.curso_id != null
          ? liteKey("curso", concepto.curso_id)
          : concepto.clase_id != null
            ? liteKey("clase", concepto.clase_id)
            : null;
    if (clave) pushEn2(conceptosPorClave, clave, concepto);
  }
  conceptosPorClave.forEach((lista) =>
    lista.sort(
      (a, b) =>
        a.jerarquia - b.jerarquia ||
        (b.fecha_registro ?? "").localeCompare(a.fecha_registro ?? ""),
    ),
  );

  return { temas, cursos, clases, porClave, hijosPorClave, conceptosPorClave };
}

function pushEn2<T>(mapa: Map<string, T[]>, clave: string, valor: T): void {
  const actual = mapa.get(clave);
  if (actual) actual.push(valor);
  else mapa.set(clave, [valor]);
}

export function liteHijosLabel(kind: LiteEntityKind): string {
  return kind === "tema" ? "Cursos" : "Clases";
}
