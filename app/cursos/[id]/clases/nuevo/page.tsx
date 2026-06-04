"use client";

import { AppShell } from "@/components/study/app-shell";
import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/study/form-field";
import { getSessionUserId, insertClase } from "@/lib/estudio-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { claseFormSchema } from "@/lib/validations";
import { useParams, useRouter } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { useState } from "react";

export default function NuevaClasePage() {
  const params = useParams();
  const cursoId = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [orden, setOrden] = useState("");
  const [jerarquia, setJerarquia] = useState("");
  const [dificultad, setDificultad] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cursoId == null) {
      setError("Falta el curso.");
      return;
    }

    setError(null);
    setFieldErrors({});

    const parsed = claseFormSchema.safeParse({
      nombre,
      descripcion,
      orden,
      jerarquia,
      dificultad,
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

    const result = await insertClase(userId, cursoId, parsed.data);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data) {
      router.replace(`/clases/${result.data.id}`);
      router.refresh();
    }
  }

  return (
    <AppShell title="Nueva clase" backHref={cursoId != null ? `/cursos/${cursoId}` : "/temas"}>
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
        <FormField label="Dificultad" error={fieldErrors.dificultad}>
          <FormInput
            value={dificultad}
            onChange={(e) => setDificultad(e.target.value)}
            placeholder="ej. baja, media, alta"
          />
        </FormField>
        <FormField label="Orden" error={fieldErrors.orden}>
          <FormInput
            type="number"
            min={0}
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            placeholder="Vacío = al final"
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
        <FormError message={error} />
        <FormSubmitButton loading={loading} label="Crear clase" />
      </form>
    </AppShell>
  );
}
