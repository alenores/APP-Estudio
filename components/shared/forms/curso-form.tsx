"use client";

import type { Curso } from "@/app/types/estudio";
import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/ui";
import {
  deleteCurso,
  getSessionUserId,
  insertCurso,
  listTemas,
  updateCurso,
} from "@/lib/estudio-queries";
import { listMapaNodosParaCursos } from "@/lib/mapa-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import {
  isoToDateInputValue,
  numberFieldInitial,
} from "@/lib/iso-date-input";
import { cursoFormSchema } from "@/lib/validations";
import { applyFormLienzoColocacion } from "@/lib/apply-form-lienzo-colocacion";
import {
  EMPTY_FORM_LIENZO_COLOCACION,
  type FormLienzoColocacionConfig,
  type FormLienzoColocacionState,
} from "@/lib/form-lienzo-colocacion-types";
import { FormLienzoColocacionSection } from "@/components/shared/forms/form-lienzo-colocacion-section";
import { useEffect, useState } from "react";

export type CursoFormSuccessMeta = {
  temaId: number;
  nodoId: number;
};

type CursoFormProps = {
  /** Tema padre fijo (vista Temas del explorador). Si falta, se elige en el formulario. */
  temaId?: number;
  curso?: Curso;
  defaultNodoId?: number | null;
  /** Nodo fijado (vista Nodos del explorador). Oculta el selector de nodo. */
  lockNodoId?: boolean;
  lienzoConfig?: FormLienzoColocacionConfig | null;
  onSuccess: (cursoId: number, meta: CursoFormSuccessMeta) => void;
  onDelete?: () => void;
};

export function CursoForm({
  temaId: temaIdFixed,
  curso,
  defaultNodoId = null,
  lockNodoId = false,
  lienzoConfig,
  onSuccess,
  onDelete,
}: CursoFormProps) {
  const isEdit = curso != null;
  const [nombre, setNombre] = useState(curso?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(curso?.descripcion ?? "");
  const [temaId, setTemaId] = useState(
    String(temaIdFixed ?? curso?.tema_id ?? ""),
  );
  const [nodoId, setNodoId] = useState(
    String(curso?.nodo_id ?? defaultNodoId ?? ""),
  );
  const [temasOptions, setTemasOptions] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [nodosOptions, setNodosOptions] = useState<
    { id: number; titulo: string }[]
  >([]);
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
  const [lienzoColocacion, setLienzoColocacion] =
    useState<FormLienzoColocacionState>(EMPTY_FORM_LIENZO_COLOCACION);

  const showTemaSelect = temaIdFixed == null && !isEdit;

  useEffect(() => {
    if (!showTemaSelect) return;
    void listTemas().then(({ data }) => {
      if (data) {
        setTemasOptions(data.map((t) => ({ id: t.id, nombre: t.nombre })));
      }
    });
  }, [showTemaSelect]);

  useEffect(() => {
    if (lockNodoId && defaultNodoId != null) return;
    void listMapaNodosParaCursos().then(({ data }) => {
      if (data) {
        setNodosOptions(data.map((n) => ({ id: n.id, titulo: n.titulo })));
      }
    });
  }, [lockNodoId, defaultNodoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const resolvedTemaId = temaIdFixed ?? Number(temaId);
    if (!Number.isFinite(resolvedTemaId) || resolvedTemaId <= 0) {
      setFieldErrors({ tema_id: "Elegí un tema" });
      return;
    }

    const parsed = cursoFormSchema.safeParse({
      nombre,
      descripcion,
      nodo_id: nodoId,
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
      : await insertCurso(userId, resolvedTemaId, parsed.data);
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
        { layer: "detalle", kind: "curso", id: result.data.id },
      );
      if (lienzoErr) {
        setError(lienzoErr);
        return;
      }
    }

    if (result.data) {
      onSuccess(result.data.id, {
        temaId: result.data.tema_id,
        nodoId: result.data.nodo_id,
      });
    }
  }

  async function handleDelete() {
    if (!curso || !onDelete) return;
    const ok = window.confirm(
      `¿Eliminar el curso «${curso.nombre}»? Se borran también sus clases y registros relacionados.`,
    );
    if (!ok) return;
    setLoading(true);
    const { error: delErr } = await deleteCurso(curso.id);
    setLoading(false);
    if (delErr) {
      setError(delErr);
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

      {showTemaSelect ? (
        <FormField label="Tema *" error={fieldErrors.tema_id}>
          <select
            required
            value={temaId}
            onChange={(e) => setTemaId(e.target.value)}
            className="w-full rounded-xl border border-[var(--td-line)] bg-white px-3 py-2.5 text-sm text-[var(--td-ink)] outline-none focus:border-[var(--td-navy)]/50"
          >
            <option value="">Elegí un tema…</option>
            {temasOptions.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.nombre}
              </option>
            ))}
          </select>
        </FormField>
      ) : null}

      {!lockNodoId ? (
        <FormField label="Nodo objetivo *" error={fieldErrors.nodo_id}>
          <select
            required
            value={nodoId}
            onChange={(e) => setNodoId(e.target.value)}
            className="w-full rounded-xl border border-[var(--td-line)] bg-white px-3 py-2.5 text-sm text-[var(--td-ink)] outline-none focus:border-[var(--td-navy)]/50"
          >
            <option value="">Elegí un nodo…</option>
            {nodosOptions.map((n) => (
              <option key={n.id} value={String(n.id)}>
                {n.titulo}
              </option>
            ))}
          </select>
        </FormField>
      ) : null}

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
