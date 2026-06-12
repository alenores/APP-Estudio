"use client";

import type { Pendiente } from "@/app/types/desarrollos";
import {
  FormError,
  FormField,
  FormInput,
  FormSelect,
  FormSubmitButton,
  FormTextarea,
} from "@/components/ui";
import {
  PENDIENTE_ESTADO_LABELS,
  PENDIENTE_ESTADOS,
  PENDIENTE_PRIORIDAD_LABELS,
  PENDIENTE_PRIORIDADES,
} from "@/lib/pendiente-ui";
import {
  deletePendiente,
  getSessionUserId,
  insertPendiente,
  updatePendiente,
  type PendienteParent,
} from "@/lib/desarrollos-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";
import { pendienteFormSchema } from "@/lib/validations";
import { useState } from "react";

type PendienteFormProps = {
  parent: PendienteParent;
  pendiente?: Pendiente;
  onSuccess: () => void;
  onDelete?: () => void;
};

export function PendienteForm({
  parent,
  pendiente,
  onSuccess,
  onDelete,
}: PendienteFormProps) {
  const { refreshSnapshot } = useDesarrollosData();
  const isEdit = pendiente != null;
  const [titulo, setTitulo] = useState(pendiente?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(pendiente?.descripcion ?? "");
  const [estado, setEstado] = useState(pendiente?.estado ?? "abierto");
  const [prioridad, setPrioridad] = useState(pendiente?.prioridad ?? "media");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = pendienteFormSchema.safeParse({
      titulo,
      descripcion,
      estado,
      prioridad,
    });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    const userId = await getSessionUserId();
    if (!userId && !isEdit) {
      setError("Sesión no disponible.");
      setLoading(false);
      return;
    }

    const result = isEdit
      ? await updatePendiente(pendiente.id, parsed.data)
      : await insertPendiente(userId!, parent, parsed.data);

    if (result.error || !result.data) {
      setError(result.error ?? "No se pudo guardar.");
      setLoading(false);
      return;
    }

    await refreshSnapshot();
    setLoading(false);
    onSuccess();
  }

  async function handleDelete() {
    if (!pendiente || !onDelete) return;
    setLoading(true);
    const { error: delErr } = await deletePendiente(pendiente.id);
    if (delErr) {
      setError(delErr);
      setLoading(false);
      return;
    }
    await refreshSnapshot();
    setLoading(false);
    onDelete();
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <FormField label="Título" error={fieldErrors.titulo}>
        <FormInput value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </FormField>
      <FormField label="Descripción" error={fieldErrors.descripcion}>
        <FormTextarea
          value={descripcion ?? ""}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
        />
      </FormField>
      <FormField label="Estado" error={fieldErrors.estado}>
        <FormSelect value={estado} onChange={(e) => setEstado(e.target.value as typeof estado)}>
          {PENDIENTE_ESTADOS.map((e) => (
            <option key={e} value={e}>
              {PENDIENTE_ESTADO_LABELS[e]}
            </option>
          ))}
        </FormSelect>
      </FormField>
      <FormField label="Prioridad" error={fieldErrors.prioridad}>
        <FormSelect
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value as typeof prioridad)}
        >
          {PENDIENTE_PRIORIDADES.map((p) => (
            <option key={p} value={p}>
              {PENDIENTE_PRIORIDAD_LABELS[p]}
            </option>
          ))}
        </FormSelect>
      </FormField>
      {error ? <FormError message={error} /> : null}
      <FormSubmitButton loading={loading} label={isEdit ? "Guardar" : "Crear pendiente"} />
      {isEdit && onDelete ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleDelete()}
          className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700"
        >
          Eliminar
        </button>
      ) : null}
    </form>
  );
}
