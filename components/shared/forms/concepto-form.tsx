"use client";

import { FormError, FormSubmitButton } from "@/components/ui";
import { ConceptoFormFields } from "@/components/shared/forms/concepto-form-fields";
import type { ConceptoParent } from "@/lib/form-parent-types";
import { getSessionUserId, insertConcepto } from "@/lib/estudio-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { conceptoFormSchema } from "@/lib/validations";
import { useState } from "react";

export type { ConceptoParent };

type ConceptoFormProps = {
  parent: ConceptoParent;
  onSuccess: () => void;
};

export function ConceptoForm({ parent, onSuccess }: ConceptoFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [jerarquia, setJerarquia] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = conceptoFormSchema.safeParse({
      titulo,
      descripcion,
      jerarquia,
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

    // Una sola FK activa, igual que en insertSeguimiento (CHECK en Supabase).
    const payload =
      "temaId" in parent
        ? { ...parsed.data, tema_id: parent.temaId }
        : "cursoId" in parent
          ? { ...parsed.data, curso_id: parent.cursoId }
          : { ...parsed.data, clase_id: parent.claseId };

    const result = await insertConcepto(userId, payload);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ConceptoFormFields
        titulo={titulo}
        setTitulo={setTitulo}
        descripcion={descripcion}
        setDescripcion={setDescripcion}
        jerarquia={jerarquia}
        setJerarquia={setJerarquia}
        fieldErrors={fieldErrors}
      />
      <FormError message={error} />
      <FormSubmitButton loading={loading} label="Guardar concepto" />
    </form>
  );
}
