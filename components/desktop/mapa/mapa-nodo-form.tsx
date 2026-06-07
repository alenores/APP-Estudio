"use client";

import type { MapaNodo } from "@/app/types/mapa";
import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/ui";
import {
  deleteMapaNodo,
  getSessionUserId,
  updateMapaNodo,
} from "@/lib/mapa-queries";
import { nodoClasificacionLabel } from "@/lib/mapa-nodo-tipo";
import { zodFieldErrors } from "@/lib/form-errors";
import { numberFieldInitial } from "@/lib/iso-date-input";
import { mapaNodoFormSchema } from "@/lib/validations";
import { useState } from "react";

type MapaNodoFormProps = {
  nodo: MapaNodo;
  onSuccess: () => void;
  onDelete?: () => void;
};

/** Edición completa en /mapa (layout + objetivo). */
export function MapaNodoForm({ nodo, onSuccess, onDelete }: MapaNodoFormProps) {
  const [titulo, setTitulo] = useState(nodo.titulo);
  const [descripcion, setDescripcion] = useState(nodo.descripcion ?? "");
  const [tipo, setTipo] = useState(nodo.tipo);
  const [etapa, setEtapa] = useState(numberFieldInitial(nodo.etapa));
  const [carril, setCarril] = useState(numberFieldInitial(nodo.carril));
  const [orden, setOrden] = useState(numberFieldInitial(nodo.orden ?? nodo.etapa));
  const [objetivoId, setObjetivoId] = useState(String(nodo.objetivo_id ?? 1));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = mapaNodoFormSchema.safeParse({
      titulo,
      descripcion,
      tipo,
      etapa,
      carril,
      orden,
      objetivo_id: objetivoId,
      pos_x: String(nodo.pos_x),
      pos_y: String(nodo.pos_y),
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    const result = await updateMapaNodo(nodo.id, parsed.data);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!window.confirm(`¿Eliminar «${nodo.titulo}»?`)) return;
    setLoading(true);
    const { error: delErr } = await deleteMapaNodo(nodo.id);
    setLoading(false);
    if (delErr) {
      setError(delErr);
      return;
    }
    onDelete();
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <FormField label="Tipo" error={fieldErrors.tipo}>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as MapaNodo["tipo"])}
          className="w-full rounded-xl border border-[var(--td-line)] bg-white px-3 py-2.5 text-sm"
        >
          <option value="nodo">{nodoClasificacionLabel("nodo")}</option>
          <option value="logro">{nodoClasificacionLabel("logro")}</option>
        </select>
      </FormField>

      <FormField label="Nombre" error={fieldErrors.titulo}>
        <FormInput
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          autoFocus
          maxLength={200}
        />
      </FormField>

      <FormField label="Descripción" error={fieldErrors.descripcion}>
        <FormTextarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Objetivo *" error={fieldErrors.objetivo_id}>
          <select
            required
            value={objetivoId}
            onChange={(e) => setObjetivoId(e.target.value)}
            className="w-full rounded-xl border border-[var(--td-line)] bg-white px-3 py-2.5 text-sm"
          >
            <option value="1">1 — BaaS</option>
            <option value="2">2 — Infra propia</option>
            <option value="3">3 — SaaS</option>
          </select>
        </FormField>
        <FormField label="Orden (lista)" error={fieldErrors.orden}>
          <FormInput
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            inputMode="numeric"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Etapa (timeline)" error={fieldErrors.etapa}>
          <FormInput
            value={etapa}
            onChange={(e) => setEtapa(e.target.value)}
            inputMode="numeric"
          />
        </FormField>
        <FormField label="Carril (eje Y)" error={fieldErrors.carril}>
          <FormInput
            value={carril}
            onChange={(e) => setCarril(e.target.value)}
            inputMode="numeric"
          />
        </FormField>
      </div>

      <FormError message={error} />

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <FormSubmitButton loading={loading} label="Guardar" />
        {onDelete ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleDelete()}
            className="text-sm font-medium text-red-700 hover:text-red-800 disabled:opacity-50"
          >
            Eliminar
          </button>
        ) : null}
      </div>
    </form>
  );
}
