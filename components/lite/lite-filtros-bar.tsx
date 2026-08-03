"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { liteEstadoClass } from "@/components/lite/lite-badges";
import {
  LITE_ESTADO_FILTROS,
  LITE_MEDIO_FILTROS,
  LITE_TIPO_FILTROS,
  contarLiteFiltrosActivos,
  liteEstadoFiltroLabel,
  liteMedioLabel,
  toggleFiltro,
  type LiteFiltros,
} from "@/lib/academico-lite-filtros";
import { tipoEstudioLabel } from "@/lib/tipo-estudio";

type LiteFiltrosBarProps = {
  filtros: LiteFiltros;
  onChange: (filtros: LiteFiltros) => void;
  /** Oculta los chips de tipo de estudio cuando la lista es de temas. */
  mostrarTipo: boolean;
  resultados: number;
};

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="lite-chip active:scale-95"
      data-active={activo}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/**
 * Buscador siempre visible + panel de chips plegable. El panel se muestra u
 * oculta sin animación de montaje (ADR 006); el feedback vive en el botón.
 */
export function LiteFiltrosBar({
  filtros,
  onChange,
  mostrarTipo,
  resultados,
}: LiteFiltrosBarProps) {
  const [abierto, setAbierto] = useState(false);
  const activos = contarLiteFiltrosActivos(filtros);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="lite-search flex min-w-0 flex-1 items-center gap-2.5 px-4 py-2.5">
          <Search
            className="h-[17px] w-[17px] flex-none text-[var(--lt-text-3)]"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={filtros.texto}
            onChange={(e) => onChange({ ...filtros, texto: e.target.value })}
            placeholder="Buscar…"
            aria-label="Buscar"
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {filtros.texto ? (
            <button
              type="button"
              onClick={() => onChange({ ...filtros, texto: "" })}
              aria-label="Limpiar búsqueda"
              className="flex-none text-[var(--lt-text-3)] transition active:scale-90"
            >
              <X className="h-[17px] w-[17px]" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-label="Filtros"
          className="lite-icon-btn relative flex-none"
          style={
            abierto || activos > 0
              ? {
                  borderColor: "var(--lt-accent-line)",
                  color: "var(--lt-accent)",
                  background: "var(--lt-accent-soft)",
                }
              : undefined
          }
        >
          <SlidersHorizontal className="h-[17px] w-[17px]" strokeWidth={2} aria-hidden />
          {activos > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--lt-accent)] px-1 text-[10px] font-bold text-[var(--lt-accent-ink)]">
              {activos}
            </span>
          ) : null}
        </button>
      </div>

      {abierto ? (
        <div className="space-y-3.5 rounded-2xl border border-[var(--lt-line)] bg-[var(--lt-surface)] p-3.5">
          <FiltroGrupo titulo="Estado">
            {LITE_ESTADO_FILTROS.map((estado) => (
              <Chip
                key={estado}
                activo={filtros.estados.includes(estado)}
                onClick={() =>
                  onChange({
                    ...filtros,
                    estados: toggleFiltro(filtros.estados, estado),
                  })
                }
              >
                <span
                  className={`lite-chip-dot ${liteEstadoClass(
                    estado === "sin_estado" ? null : estado,
                  )}`}
                  style={{ background: "var(--lt-estado)" }}
                  aria-hidden
                />
                {liteEstadoFiltroLabel(estado)}
              </Chip>
            ))}
          </FiltroGrupo>

          <FiltroGrupo titulo="Material">
            {LITE_MEDIO_FILTROS.map((medio) => (
              <Chip
                key={medio}
                activo={filtros.medios.includes(medio)}
                onClick={() =>
                  onChange({
                    ...filtros,
                    medios: toggleFiltro(filtros.medios, medio),
                  })
                }
              >
                {liteMedioLabel(medio)}
              </Chip>
            ))}
          </FiltroGrupo>

          {mostrarTipo ? (
            <FiltroGrupo titulo="Tipo de estudio">
              {LITE_TIPO_FILTROS.map((tipo) => (
                <Chip
                  key={tipo}
                  activo={filtros.tipos.includes(tipo)}
                  onClick={() =>
                    onChange({ ...filtros, tipos: toggleFiltro(filtros.tipos, tipo) })
                  }
                >
                  {tipoEstudioLabel(tipo)}
                </Chip>
              ))}
            </FiltroGrupo>
          ) : null}

          <div className="flex items-center justify-between border-t border-[var(--lt-line)] pt-3">
            <span className="text-[12.5px] text-[var(--lt-text-3)]">
              {resultados} {resultados === 1 ? "resultado" : "resultados"}
            </span>
            {activos > 0 ? (
              <button
                type="button"
                onClick={() =>
                  onChange({ ...filtros, estados: [], tipos: [], medios: [] })
                }
                className="text-[12.5px] font-semibold text-[var(--lt-accent)] transition active:scale-95"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FiltroGrupo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="lite-eyebrow mb-2">{titulo}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
