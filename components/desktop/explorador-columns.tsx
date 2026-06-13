"use client";

import { ExploradorCardExpanded } from "@/components/desktop/explorador-card-expanded";
import { EstudioProgressCard } from "@/components/shared/cards/estudio-progress-card";
import type { SeguimientoDerivados } from "@/app/types/estudio";
import { parseObjetivoId } from "@/lib/objetivo-ui";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";
import { explorerColumnHeaderClass } from "@/lib/estudio-shell-tone";
import type { ReactNode, WheelEvent } from "react";

export type ExploradorColumnAction = {
  label: string;
  title?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "create" | "edit" | "search" | "text";
};

type ExploradorColumnCardProps = {
  kind: "tema" | "curso" | "clase" | "nodo" | "logro";
  explorerId: number;
  nombre: string;
  derivados: SeguimientoDerivados;
  selected: boolean;
  /** Panel expandido (solo la columna con foco activo). */
  expanded?: boolean;
  onSelect: () => void;
  onDoubleClick?: () => void;
  descripcion?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  fechaParen?: string | null;
  hijosStats?: HijosProgressStats;
  hijosLabel?: "cursos" | "clases" | "logros" | "hijos";
  link?: string | null;
  linkChat?: string | null;
  dificultad?: string | null;
  orden?: number;
  seguimientosCount?: number;
  conceptosCount?: number;
  onOpenSeguimientos?: () => void;
  onOpenConceptos?: () => void;
  highlightQuery?: string;
  searchContextLine?: string | null;
  searchShowDescripcion?: boolean;
  objetivoId?: number | null;
  nodoClasificacion?: import("@/lib/mapa-nodo-tipo").NodoObjetivoClasificacion;
  expandedLayout?: "compact" | "comfortable";
};

export function ExploradorColumnCard({
  kind,
  explorerId,
  nombre,
  derivados,
  selected,
  expanded = selected,
  onSelect,
  onDoubleClick,
  descripcion,
  fechaInicio = null,
  fechaFin = null,
  fechaParen,
  hijosStats,
  hijosLabel,
  link,
  linkChat,
  dificultad,
  orden,
  seguimientosCount = 0,
  conceptosCount = 0,
  onOpenSeguimientos,
  onOpenConceptos,
  highlightQuery,
  searchContextLine,
  searchShowDescripcion,
  objetivoId: objetivoIdRaw,
  nodoClasificacion,
  expandedLayout = "compact",
}: ExploradorColumnCardProps) {
  const objetivoId = parseObjetivoId(objetivoIdRaw);
  const expandedSlot =
    expanded && (kind === "nodo" || kind === "logro") ? (
      <ExploradorCardExpanded
        kind={kind}
        descripcion={descripcion ?? null}
        fechaInicio={null}
        fechaFin={null}
        seguimientosCount={0}
        conceptosCount={0}
        derivados={derivados}
        onOpenSeguimientos={() => {}}
        onOpenConceptos={() => {}}
        layout={expandedLayout}
      />
    ) : expanded && onOpenSeguimientos && onOpenConceptos ? (
      <ExploradorCardExpanded
        kind={kind}
        descripcion={descripcion ?? null}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        seguimientosCount={seguimientosCount}
        conceptosCount={conceptosCount}
        derivados={derivados}
        onOpenSeguimientos={onOpenSeguimientos}
        onOpenConceptos={onOpenConceptos}
        layout={expandedLayout}
      />
    ) : null;

  return (
    <EstudioProgressCard
      kind={kind}
      nombre={nombre}
      derivados={derivados}
      selected={selected}
      explorerId={explorerId}
      onSelect={onSelect}
      onDoubleClick={onDoubleClick}
      descripcion={descripcion}
      fechaParen={fechaParen}
      hijosStats={hijosStats}
      hijosLabel={hijosLabel}
      link={link}
      linkChat={linkChat}
      dificultad={dificultad}
      orden={orden}
      expandedSlot={expandedSlot}
      highlightQuery={highlightQuery}
      searchContextLine={searchContextLine}
      searchShowDescripcion={searchShowDescripcion}
      objetivoId={objetivoId}
      nodoClasificacion={nodoClasificacion}
    />
  );
}

type ExploradorRootSwitch = {
  value: "temas" | "nodos";
  onChange: (value: "temas" | "nodos") => void;
};

type ExploradorColumnProps = {
  columnKind: "tema" | "curso" | "clase";
  label: string;
  count: number;
  emptyMessage: string;
  actions: ExploradorColumnAction[];
  rootSwitch?: ExploradorRootSwitch;
  children: ReactNode;
};

export function ExploradorColumn({
  columnKind,
  label,
  count,
  emptyMessage,
  actions,
  rootSwitch,
  children,
}: ExploradorColumnProps) {
  return (
    <section className="explorer-column-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--td-line)] bg-[var(--td-zone)] shadow-[0_8px_32px_-8px_rgba(30,41,59,0.20),0_2px_8px_-4px_rgba(30,41,59,0.1)]">
      <header
        className={`${explorerColumnHeaderClass(columnKind)} shrink-0 border-b border-[var(--td-line)]/70 px-3 py-2.5`}
      >
        <div className="flex flex-col gap-2">
          {rootSwitch ? (
            <ExploradorRootSwitchControl {...rootSwitch} />
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-ink-soft)]">
              {label}{" "}
              <span className="font-semibold text-[var(--td-faint)]">{count}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {actions.map((action) => (
                <ColumnHeaderButton key={action.label} {...action} />
              ))}
            </div>
          </div>
        </div>
      </header>
      <div
        className="explorer-column-body min-h-0 flex-1 overflow-y-auto px-2"
        onWheel={onColumnBodyWheel}
      >
        {count === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--td-line)] px-4 py-10 text-center">
            <EmptyStateIcon />
            <p className="text-sm text-[var(--td-faint)]">{emptyMessage}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">{children}</div>
        )}
      </div>
    </section>
  );
}

function ExploradorRootSwitchControl({
  value,
  onChange,
}: ExploradorRootSwitch) {
  return (
    <div
      className="flex rounded-lg border border-[var(--td-line)] bg-[var(--td-line-soft)]/60 p-0.5 shadow-inner"
      role="group"
      aria-label="Vista de la primera columna"
    >
      {(
        [
          { id: "temas" as const, label: "Temas" },
          { id: "nodos" as const, label: "Nodos" },
        ] as const
      ).map((opt) => (
        <button
          key={opt.id}
          type="button"
          aria-pressed={value === opt.id}
          onClick={() => onChange(opt.id)}
          className={`min-w-0 flex-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-all duration-150 active:scale-95 ${
            value === opt.id
              ? "bg-[var(--td-navy)] text-white shadow-sm shadow-[var(--td-navy)]/30"
              : "text-[var(--td-filter-text-muted)] hover:text-[var(--td-navy)]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Evita que la rueda desplace la página mientras la columna aún puede scrollear. */
function onColumnBodyWheel(e: WheelEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  if (el.scrollHeight <= el.clientHeight + 1) return;

  const { scrollTop, clientHeight, scrollHeight } = el;
  const dy = e.deltaY;
  const atTop = scrollTop <= 0;
  const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

  if ((dy < 0 && !atTop) || (dy > 0 && !atBottom)) {
    e.stopPropagation();
  }
}

function ColumnHeaderButton({
  label,
  title,
  onClick,
  disabled = false,
  variant = "text",
}: ExploradorColumnAction) {
  const aria = title ?? label;

  if (variant === "create" || variant === "edit" || variant === "search") {
    return (
      <button
        type="button"
        title={aria}
        aria-label={aria}
        disabled={disabled}
        onClick={onClick}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 ${
          variant === "create"
            ? "bg-[var(--td-navy)] text-white shadow-sm hover:bg-[var(--accent)] hover:shadow-[0_4px_14px_-2px_rgba(37,99,235,0.45)]"
            : "border border-[var(--td-line)] bg-white text-[var(--td-navy)] shadow-sm hover:border-[var(--td-navy)]/40 hover:bg-[var(--td-line-soft)] hover:shadow-md"
        }`}
      >
        {variant === "create" ? (
          <IconPlus />
        ) : variant === "edit" ? (
          <IconPencil />
        ) : (
          <IconSearch />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      title={aria}
      aria-label={aria}
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border border-[var(--td-line)] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--td-filter-text-muted)] transition-all duration-150 hover:border-[var(--td-navy)]/40 hover:text-[var(--td-navy)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 3.25v9.5M3.25 8h9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M11.3 2.7a1.1 1.1 0 0 1 1.55 1.55L5.4 11.6 3 12l.4-2.4 7.9-7.9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
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

function EmptyStateIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      className="opacity-30"
    >
      <rect x="6" y="10" width="28" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-[var(--td-ink-soft)]" />
      <path d="M12 18h16M12 24h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--td-faint)]" />
      <circle cx="32" cy="10" r="5" fill="var(--td-line)" stroke="var(--td-line-soft)" strokeWidth="1" />
      <path d="M30 10h4M32 8v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-[var(--td-ink-soft)]" />
    </svg>
  );
}
