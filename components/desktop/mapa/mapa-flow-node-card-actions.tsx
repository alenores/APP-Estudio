"use client";

type MapaFlowNodeCardActionsProps = {
  selected?: boolean;
  onEdit?: () => void;
  editLabel?: string;
  onAdd?: () => void;
  addTitle: string;
};

/** Acciones rápidas en cards del lienzo (Editar + agregar enlazado). */
export function MapaFlowNodeCardActions({
  selected = false,
  onEdit,
  editLabel = "Editar",
  onAdd,
  addTitle,
}: MapaFlowNodeCardActionsProps) {
  if (!onEdit && !onAdd) return null;

  const show = selected ? "opacity-100" : "opacity-0 group-hover:opacity-100";

  return (
    <div className={`flex shrink-0 items-center gap-1 transition-opacity ${show}`}>
      {onAdd ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="mapa-flow-node-add flex h-6 w-6 items-center justify-center rounded-md bg-[var(--td-navy)] text-sm font-bold leading-none text-white shadow-sm hover:bg-[var(--td-navy-2)]"
          title={addTitle}
          aria-label={addTitle}
        >
          +
        </button>
      ) : null}
      {onEdit ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="mapa-flow-node-edit rounded-md border px-2 py-0.5 text-[10px] font-semibold"
          title={editLabel}
        >
          {editLabel}
        </button>
      ) : null}
    </div>
  );
}
