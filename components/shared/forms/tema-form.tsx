"use client";

import type { Tema } from "@/app/types/estudio";
import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/ui";
import {
  deleteTema,
  getSessionUserId,
  insertTema,
  updateTema,
} from "@/lib/estudio-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import {
  isoToDateInputValue,
  numberFieldInitial,
} from "@/lib/iso-date-input";
import { temaFormSchema } from "@/lib/validations";
import { applyFormLienzoColocacion } from "@/lib/apply-form-lienzo-colocacion";
import {
  EMPTY_FORM_LIENZO_COLOCACION,
  type FormLienzoColocacionConfig,
  type FormLienzoColocacionState,
} from "@/lib/form-lienzo-colocacion-types";
import { FormLienzoColocacionSection } from "@/components/shared/forms/form-lienzo-colocacion-section";
import { useState } from "react";

type TemaFormProps = {
  tema?: Tema;
  /** Sección lienzo al crear (explorador / mapa). */
  lienzoConfig?: FormLienzoColocacionConfig | null;
  onSuccess: (temaId: number) => void;
  onDelete?: () => void;
};

export function TemaForm({ tema, lienzoConfig, onSuccess, onDelete }: TemaFormProps) {
  const isEdit = tema != null;
  const [nombre, setNombre] = useState(tema?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(tema?.descripcion ?? "");
  const [orden, setOrden] = useState(numberFieldInitial(tema?.orden));
  const [jerarquia, setJerarquia] = useState(numberFieldInitial(tema?.jerarquia));
  const [fechaInicio, setFechaInicio] = useState(
    isoToDateInputValue(tema?.fecha_estimada_inicio),
  );
  const [fechaFin, setFechaFin] = useState(
    isoToDateInputValue(tema?.fecha_estimada_fin),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lienzoColocacion, setLienzoColocacion] =
    useState<FormLienzoColocacionState>(EMPTY_FORM_LIENZO_COLOCACION);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = temaFormSchema.safeParse({
      nombre,
      descripcion,
      orden,
      jerarquia,
      fecha_estimada_inicio: fechaInicio,
      fecha_estimada_fin: fechaFin,
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    const userId = await getSessionUserId();
    if (!userId) {
      setError("Sesión expirada. Volvé a iniciar sesión.");
      setLoading(false);
      return;
    }

    const result = isEdit
      ? await updateTema(tema.id, parsed.data)
      : await insertTema(userId, parsed.data);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data && !isEdit && lienzoConfig) {
      const { error: lienzoErr } = await applyFormLienzoColocacion(
        userId,
        lienzoConfig,
        lienzoColocacion,
        { layer: "macro-tema", id: result.data.id },
      );
      if (lienzoErr) {
        setError(lienzoErr);
        return;
      }
    }

    if (result.data) {
      onSuccess(result.data.id);
    }
  }

  async function handleDelete() {
    if (!tema || !onDelete) return;
    const ok = window.confirm(
      `¿Eliminar el tema «${tema.nombre}»? Se borran también sus cursos, clases y registros relacionados.`,
    );
    if (!ok) return;
    setLoading(true);
    const { error: delError } = await deleteTema(tema.id);
    setLoading(false);
    if (delError) {
      setError(delError);
      return;
    }
    onDelete();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Nombre *" error={fieldErrors.nombre}>
        <FormInput
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </FormField>
      <FormField label="Descripción" error={fieldErrors.descripcion}>
        <FormTextarea
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </FormField>
      <FormField label="Orden" error={fieldErrors.orden}>
        <FormInput
          type="number"
          min={0}
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          placeholder={isEdit ? undefined : "Vacío = al final"}
        />
      </FormField>
      <FormField label="Jerarquía" error={fieldErrors.jerarquia}>
        <FormInput
          type="number"
          min={0}
          value={jerarquia}
          onChange={(e) => setJerarquia(e.target.value)}
        />
      </FormField>
      <FormField
        label="Fecha estimada inicio"
        error={fieldErrors.fecha_estimada_inicio}
      >
        <FormInput
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
      </FormField>
      <FormField label="Fecha estimada fin" error={fieldErrors.fecha_estimada_fin}>
        <FormInput
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
      </FormField>
      {!isEdit && lienzoConfig ? (
        <FormLienzoColocacionSection
          config={lienzoConfig}
          value={lienzoColocacion}
          onChange={setLienzoColocacion}
        />
      ) : null}
      <FormError message={error} />
      <FormSubmitButton
        loading={loading}
        label={isEdit ? "Guardar cambios" : "Crear tema"}
      />
      {isEdit && onDelete ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleDelete()}
          className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Eliminar tema
        </button>
      ) : null}
    </form>
  );
}
