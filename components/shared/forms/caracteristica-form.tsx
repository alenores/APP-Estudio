"use client";

import {
  FormError,
  FormField,
  FormInput,
  FormSelect,
  FormSubmitButton,
  FormTextarea,
} from "@/components/ui";
import {
  CARACTERISTICA_TIPO_LABELS,
  CARACTERISTICA_TIPOS,
} from "@/lib/caracteristica-tipo";
import {
  getSessionUserId,
  insertCaracteristica,
  type CaracteristicaParent,
} from "@/lib/desarrollos-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";
import { caracteristicaFormSchema } from "@/lib/validations";
import { useState } from "react";

type CaracteristicaFormProps = {
  parent: CaracteristicaParent;
  onSuccess: () => void;
};

export function CaracteristicaForm({ parent, onSuccess }: CaracteristicaFormProps) {
  const { refreshSnapshot } = useDesarrollosData();
  const [tipo, setTipo] = useState<"nota" | "implicancia_tecnica" | "prompt_cursor">("nota");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = caracteristicaFormSchema.safeParse({ tipo, titulo, descripcion });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    const userId = await getSessionUserId();
    if (!userId) {
      setError("Sesión no disponible.");
      setLoading(false);
      return;
    }

    const result = await insertCaracteristica(userId, parent, parsed.data);
    if (result.error || !result.data) {
      setError(result.error ?? "No se pudo guardar.");
      setLoading(false);
      return;
    }

    await refreshSnapshot();
    setLoading(false);
    onSuccess();
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <FormField label="Tipo" error={fieldErrors.tipo}>
        <FormSelect value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)}>
          {CARACTERISTICA_TIPOS.map((t) => (
            <option key={t} value={t}>
              {CARACTERISTICA_TIPO_LABELS[t]}
            </option>
          ))}
        </FormSelect>
      </FormField>
      <FormField
        label={tipo === "prompt_cursor" ? "Prompt" : "Título (opcional)"}
        error={fieldErrors.titulo}
      >
        {tipo === "prompt_cursor" ? (
          <FormTextarea value={titulo} onChange={(e) => setTitulo(e.target.value)} rows={5} />
        ) : (
          <FormInput value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        )}
      </FormField>
      <FormField label="Descripción (opcional)" error={fieldErrors.descripcion}>
        <FormTextarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
        />
      </FormField>
      {error ? <FormError message={error} /> : null}
      <FormSubmitButton loading={loading} label="Crear característica" />
    </form>
  );
}
