"use client";

import type {
  ClaseConDerivados,
  CursoConDerivados,
} from "@/app/types/estudio";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { EstudioProgressCard } from "@/components/shared/cards/estudio-progress-card";
import type { EstudioOfflineCacheData } from "@/lib/estudio-offline-cache";
import {
  listAllClasesConDerivadosFromCache,
  listAllCursosConDerivadosFromCache,
} from "@/lib/estudio-offline-read";
import { fechaParentesisCurso } from "@/lib/curso-card-fecha";
import { rankSearchResults } from "@/lib/explorador-search";
import { useMemo, useRef, useEffect, useState } from "react";

export type ExploradorSearchKind = "curso" | "clase";

type ExploradorSearchModalProps = {
  kind: ExploradorSearchKind;
  cacheData: EstudioOfflineCacheData;
  onClose: () => void;
  onSelectCurso: (curso: CursoConDerivados) => void;
  onSelectClase: (clase: ClaseConDerivados) => void;
};

export function ExploradorSearchModal({
  kind,
  cacheData,
  onClose,
  onSelectCurso,
  onSelectClase,
}: ExploradorSearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const temaNombreById = useMemo(() => {
    const map = new Map<number, string>();
    for (const t of cacheData.temas) map.set(t.id, t.nombre);
    return map;
  }, [cacheData.temas]);

  const cursoById = useMemo(() => {
    const map = new Map<number, (typeof cacheData.cursos)[number]>();
    for (const c of cacheData.cursos) map.set(c.id, c);
    return map;
  }, [cacheData.cursos]);

  const cursoResults = useMemo(() => {
    if (kind !== "curso") return [];
    const all = listAllCursosConDerivadosFromCache(cacheData);
    return rankSearchResults(all, query, (c) => ({
      nombre: c.nombre,
      descripcion: c.descripcion,
    }));
  }, [kind, cacheData, query]);

  const claseResults = useMemo(() => {
    if (kind !== "clase") return [];
    const all = listAllClasesConDerivadosFromCache(cacheData);
    return rankSearchResults(all, query, (cl) => ({
      nombre: cl.nombre,
      descripcion: cl.descripcion,
    }));
  }, [kind, cacheData, query]);

  const trimmed = query.trim();
  const results = kind === "curso" ? cursoResults : claseResults;
  const title = kind === "curso" ? "Buscar cursos" : "Buscar clases";
  const subtitle =
    kind === "curso"
      ? "Nombre y descripción en todos los temas"
      : "Nombre y descripción en todos los cursos";

  return (
    <DesktopModal
      open
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      subtitleClassName="text-xs font-normal italic text-[var(--td-ink-soft)]/75"
      tone={kind}
      wide
    >
      <div className="flex flex-col gap-3">
        <label className="block">
          <span className="sr-only">Texto de búsqueda</span>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--td-line)] bg-white px-3 py-2 shadow-sm focus-within:border-[var(--td-navy)]/40">
            <IconSearch />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                kind === "curso"
                  ? "Ej. álgebra, fechas, enlace…"
                  : "Ej. clase 3, dificultad, link…"
              }
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--td-ink)] outline-none placeholder:text-[var(--td-faint)]"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </label>

        <div className="max-h-[min(52vh,520px)] overflow-y-auto pr-0.5">
          {trimmed.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--td-line)] px-4 py-10 text-center text-sm text-[var(--td-faint)]">
              Escribí al menos un carácter para buscar.
            </p>
          ) : results.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--td-line)] px-4 py-10 text-center text-sm text-[var(--td-faint)]">
              Sin coincidencias para «{trimmed}».
            </p>
          ) : (
            <ul className="estudio-progress-cards flex flex-col gap-2.5 pb-1">
              {kind === "curso"
                ? cursoResults.map(({ item: c }) => (
                    <li key={c.id}>
                      <EstudioProgressCard
                        kind="curso"
                        nombre={c.nombre}
                        derivados={c.derivados}
                        selected={false}
                        descripcion={c.descripcion}
                        fechaParen={fechaParentesisCurso(c)}
                        highlightQuery={query}
                        searchContextLine={`Tema · ${temaNombreById.get(c.tema_id) ?? "—"}`}
                        searchShowDescripcion
                        onSelect={() => onSelectCurso(c)}
                      />
                    </li>
                  ))
                : claseResults.map(({ item: cl }) => {
                    const curso = cursoById.get(cl.curso_id);
                    const temaNombre =
                      curso != null
                        ? temaNombreById.get(curso.tema_id)
                        : undefined;
                    const context =
                      curso != null
                        ? `Curso · ${curso.nombre}${temaNombre ? ` · Tema · ${temaNombre}` : ""}`
                        : "Curso · —";
                    return (
                      <li key={cl.id}>
                        <EstudioProgressCard
                          kind="clase"
                          nombre={cl.nombre}
                          derivados={cl.derivados}
                          selected={false}
                          descripcion={cl.descripcion}
                          link={cl.link}
                          dificultad={cl.dificultad}
                          orden={cl.orden}
                          highlightQuery={query}
                          searchContextLine={context}
                          searchShowDescripcion
                          onSelect={() => onSelectClase(cl)}
                        />
                      </li>
                    );
                  })}
            </ul>
          )}
        </div>
      </div>
    </DesktopModal>
  );
}

function IconSearch() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="shrink-0 text-[var(--td-faint)]"
    >
      <circle cx="8.75" cy="8.75" r="5.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M13.5 13.5L17.25 17.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
