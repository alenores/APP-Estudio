"use client";

import type { Curso } from "@/app/types/estudio";
import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/study/form-field";
import {
  deleteCurso,
  getSessionUserId,
  insertCurso,
  updateCurso,
} from "@/lib/estudio-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import {
  isoToDateInputValue,
  numberFieldInitial,
} from "@/lib/iso-date-input";
import { cursoFormSchema } from "@/lib/validations";
import { useState } from "react";

type CursoFormProps = {
  temaId: number;
  curso?: Curso;
  onSuccess: (cursoId: number) => void;
  onDelete?: () => void;
};

export function CursoForm({
  temaId,
  curso,
  onSuccess,
  onDelete,
}: CursoFormProps) {
  const isEdit = curso != null;
  const [nombre, setNombre] = useState(curso?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(curso?.descripcion ?? "");
  const [orden, setOrden] = useState(numberFieldInitial(curso?.orden));
  const [jerarquia, setJerarquia] = useState(numberFieldInitial(curso?.jerarquia));
  const [fechaInicio, setFechaInicio] = useState(
    isoToDateInputValue(curso?.fecha_estimada_inicio),
  );
  const [fechaFin, setFechaFin] = useState(
    isoToDateInputValue(curso?.fecha_estimada_fin),
  );
  const [link, setLink] = useState(curso?.link ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = cursoFormSchema.safeParse({
      nombre,
      descripcion,
      orden,
      jerarquia,
      fecha_estimada_inicio: fechaInicio,
      fecha_estimada_fin: fechaFin,
      plataforma: curso?.plataforma ?? "",
      link,
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    const userId = await getSessionUserId();
    if (!userId) {
      setError("Sesión expirada.");
      setLoading(false);
      return;
    }

    const result = isEdit
      ? await updateCurso(curso.id, parsed.data)
      : await insertCurso(userId, temaId, parsed.data);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data) {
      onSuccess(result.data.id);
    }
  }

  async function handleDelete() {
    if (!curso || !onDelete) return;
    const ok = window.confirm(
      `¿Eliminar el curso «${curso.nombre}»? Se borran también sus clases y registros relacionados.`,
    );
    if (!ok) return;
    setLoading(true);
    const { error: delError } = await deleteCurso(curso.id);
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
      <FormField label="Link del curso" error={fieldErrors.link}>
        <FormInput
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://platzi.com/cursos/..."
        />
      </FormField>
      {!isEdit ? (
        <p className="text-xs text-ink-muted">
          El ícono de la plataforma se obtiene automáticamente del link.
        </p>
      ) : null}
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
      <FormField label="Fecha estimada inicio" error={fieldErrors.fecha_estimada_inicio}>
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
      <FormError message={error} />
      <FormSubmitButton
        loading={loading}
        label={isEdit ? "Guardar cambios" : "Crear curso"}
      />
      {isEdit && onDelete ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleDelete()}
          className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Eliminar curso
        </button>
      ) : null}
    </form>
  );
}
