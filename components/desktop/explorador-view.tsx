"use client";

import {
  explorerHref,
  parseExplorerSelection,
  useEstudioExplorer,
} from "@/app/hooks/useEstudioExplorer";
import { EstudioSyncBanner } from "@/components/study/estudio-sync-banner";
import { AlertText, LoadingText } from "@/components/study/form-field";
import {
  ExploradorColumn,
  ExploradorColumnCard,
} from "@/components/desktop/explorador-columns";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function ExploradorView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawSelection = useMemo(
    () => parseExplorerSelection(searchParams),
    [searchParams],
  );
  const { temas, cursos, clases, selection, loading, error, packReady } =
    useEstudioExplorer(rawSelection);

  function go(href: string) {
    router.replace(href);
  }

  return (
    <div className="desktop-explorador flex min-h-0 flex-1 flex-col">
      <EstudioSyncBanner />
      {loading ? (
        <LoadingText>Cargando datos del estudio…</LoadingText>
      ) : null}
      {error ? <AlertText>{error}</AlertText> : null}
      {!loading && packReady ? (
        <div className="mt-3 flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[var(--td-line)] bg-[var(--td-zone)] shadow-[var(--td-shadow)]">
          <ExploradorColumn
            label="Temas"
            count={temas.length}
            emptyMessage="No hay temas. Creá el primero desde la app en el celular o en /temas/nuevo."
          >
            {temas.map((t) => (
              <ExploradorColumnCard
                key={t.id}
                title={t.nombre}
                subtitle={t.descripcion}
                estado={t.derivados.etiqueta_estado}
                selected={selection.temaId === t.id}
                onClick={() =>
                  go(explorerHref({ temaId: t.id, cursoId: null, claseId: null }))
                }
              />
            ))}
          </ExploradorColumn>

          <ExploradorColumn
            label="Cursos"
            count={cursos.length}
            emptyMessage={
              selection.temaId == null
                ? "Elegí un tema para ver sus cursos."
                : "Este tema no tiene cursos."
            }
          >
            {cursos.map((c) => (
              <ExploradorColumnCard
                key={c.id}
                title={c.nombre}
                subtitle={c.descripcion}
                estado={c.derivados.etiqueta_estado}
                selected={selection.cursoId === c.id}
                onClick={() =>
                  go(
                    explorerHref({
                      temaId: selection.temaId,
                      cursoId: c.id,
                      claseId: null,
                    }),
                  )
                }
              />
            ))}
          </ExploradorColumn>

          <ExploradorColumn
            label="Clases"
            count={clases.length}
            emptyMessage={
              selection.cursoId == null
                ? "Elegí un curso para ver sus clases."
                : "Este curso no tiene clases."
            }
          >
            {clases.map((cl) => (
              <ExploradorColumnCard
                key={cl.id}
                title={cl.nombre}
                subtitle={cl.descripcion}
                estado={cl.derivados.etiqueta_estado}
                selected={selection.claseId === cl.id}
                onClick={() =>
                  go(
                    explorerHref({
                      temaId: selection.temaId,
                      cursoId: selection.cursoId,
                      claseId: cl.id,
                    }),
                  )
                }
                footer={
                  cl.dificultad ? `Dificultad: ${cl.dificultad}` : undefined
                }
              />
            ))}
          </ExploradorColumn>
        </div>
      ) : null}
    </div>
  );
}
