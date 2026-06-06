import {
  claseConDerivados,
  cursoConDerivados,
  temaConDerivados,
} from "@/lib/estudio-queries";
import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";
import type {
  Clase,
  ClaseConDerivados,
  Concepto,
  Curso,
  CursoConDerivados,
  Seguimiento,
  Tema,
  TemaConDerivados,
} from "@/app/types/estudio";
import type { EstudioOfflineCacheData } from "@/lib/estudio-offline-cache";

function sortTemas(temas: Tema[]): Tema[] {
  return [...temas].sort(
    (a, b) =>
      a.orden - b.orden ||
      a.jerarquia - b.jerarquia ||
      a.nombre.localeCompare(b.nombre, "es"),
  );
}

function sortCursos(cursos: Curso[]): Curso[] {
  return [...cursos].sort(
    (a, b) =>
      a.orden - b.orden ||
      a.jerarquia - b.jerarquia ||
      a.nombre.localeCompare(b.nombre, "es"),
  );
}

function sortClases(clases: Clase[]): Clase[] {
  return [...clases].sort(
    (a, b) =>
      a.orden - b.orden ||
      a.jerarquia - b.jerarquia ||
      a.nombre.localeCompare(b.nombre, "es"),
  );
}

function seguimientosPorTema(cache: EstudioOfflineCacheData, temaId: number): Seguimiento[] {
  return cache.seguimientos
    .filter((s) => s.tema_id === temaId)
    .sort((a, b) => (b.fecha_registro ?? "").localeCompare(a.fecha_registro ?? ""));
}

function seguimientosPorCurso(cache: EstudioOfflineCacheData, cursoId: number): Seguimiento[] {
  return cache.seguimientos
    .filter((s) => s.curso_id === cursoId)
    .sort((a, b) => (b.fecha_registro ?? "").localeCompare(a.fecha_registro ?? ""));
}

function seguimientosPorClase(cache: EstudioOfflineCacheData, claseId: number): Seguimiento[] {
  return cache.seguimientos
    .filter((s) => s.clase_id === claseId)
    .sort((a, b) => (b.fecha_registro ?? "").localeCompare(a.fecha_registro ?? ""));
}

function conceptosPorTema(cache: EstudioOfflineCacheData, temaId: number): Concepto[] {
  return cache.conceptos
    .filter((c) => c.tema_id === temaId)
    .sort((a, b) => (b.fecha_registro ?? "").localeCompare(a.fecha_registro ?? ""));
}

function conceptosPorCurso(cache: EstudioOfflineCacheData, cursoId: number): Concepto[] {
  return cache.conceptos
    .filter((c) => c.curso_id === cursoId)
    .sort((a, b) => (b.fecha_registro ?? "").localeCompare(a.fecha_registro ?? ""));
}

function conceptosPorClase(cache: EstudioOfflineCacheData, claseId: number): Concepto[] {
  return cache.conceptos
    .filter((c) => c.clase_id === claseId)
    .sort((a, b) => (b.fecha_registro ?? "").localeCompare(a.fecha_registro ?? ""));
}

export function listTemasConDerivadosFromCache(
  cache: EstudioOfflineCacheData,
): TemaConDerivados[] {
  return sortTemas(cache.temas).map((t) =>
    temaConDerivados(t, seguimientosPorTema(cache, t.id)),
  );
}

/** Todos los cursos del paquete local (explorador PC — buscador). */
export function listAllCursosConDerivadosFromCache(
  cache: EstudioOfflineCacheData,
): CursoConDerivados[] {
  return attachDerivadosToCursosFromCache(cache, sortCursos(cache.cursos));
}

/** Todas las clases del paquete local (explorador PC — buscador). */
export function listAllClasesConDerivadosFromCache(
  cache: EstudioOfflineCacheData,
): ClaseConDerivados[] {
  return attachDerivadosToClasesFromCache(cache, sortClases(cache.clases));
}

export function getTemaDetalleFromCache(
  cache: EstudioOfflineCacheData,
  temaId: number,
): {
  tema: TemaConDerivados | null;
  cursos: CursoConDerivados[];
  seguimientos: Seguimiento[];
  conceptos: Concepto[];
} {
  const tema = cache.temas.find((t) => t.id === temaId) ?? null;
  if (!tema) {
    return { tema: null, cursos: [], seguimientos: [], conceptos: [] };
  }

  const segs = seguimientosPorTema(cache, temaId);
  const cursosRaw = sortCursos(cache.cursos.filter((c) => c.tema_id === temaId));
  const cursos = attachDerivadosToCursosFromCache(cache, cursosRaw);

  return {
    tema: temaConDerivados(tema, segs),
    cursos,
    seguimientos: segs,
    conceptos: conceptosPorTema(cache, temaId),
  };
}

function attachDerivadosToCursosFromCache(
  cache: EstudioOfflineCacheData,
  cursos: Curso[],
): CursoConDerivados[] {
  return cursos.map((c) => ({
    ...c,
    derivados: derivarDesdeSeguimientos(seguimientosPorCurso(cache, c.id)),
  }));
}

function attachDerivadosToClasesFromCache(
  cache: EstudioOfflineCacheData,
  clases: Clase[],
): ClaseConDerivados[] {
  return clases.map((c) => ({
    ...c,
    derivados: derivarDesdeSeguimientos(seguimientosPorClase(cache, c.id)),
  }));
}

export function getCursoDetalleFromCache(
  cache: EstudioOfflineCacheData,
  cursoId: number,
): {
  curso: CursoConDerivados | null;
  clases: ClaseConDerivados[];
  seguimientos: Seguimiento[];
  conceptos: Concepto[];
} {
  const curso = cache.cursos.find((c) => c.id === cursoId) ?? null;
  if (!curso) {
    return { curso: null, clases: [], seguimientos: [], conceptos: [] };
  }

  const segs = seguimientosPorCurso(cache, cursoId);
  const clasesRaw = sortClases(cache.clases.filter((cl) => cl.curso_id === cursoId));

  return {
    curso: cursoConDerivados(curso, segs),
    clases: attachDerivadosToClasesFromCache(cache, clasesRaw),
    seguimientos: segs,
    conceptos: conceptosPorCurso(cache, cursoId),
  };
}

export function getClaseDetalleFromCache(
  cache: EstudioOfflineCacheData,
  claseId: number,
): {
  clase: ClaseConDerivados | null;
  seguimientos: Seguimiento[];
  conceptos: Concepto[];
} {
  const clase = cache.clases.find((c) => c.id === claseId) ?? null;
  if (!clase) {
    return { clase: null, seguimientos: [], conceptos: [] };
  }

  const segs = seguimientosPorClase(cache, claseId);
  return {
    clase: claseConDerivados(clase, segs),
    seguimientos: segs,
    conceptos: conceptosPorClase(cache, claseId),
  };
}
