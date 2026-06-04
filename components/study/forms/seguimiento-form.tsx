"use client";

import { FormError, FormSubmitButton } from "@/components/study/form-field";
import { SeguimientoFormFields } from "@/components/study/seguimiento-form-fields";
import { getSessionUserId, insertSeguimiento } from "@/lib/estudio-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import {
  seguimientoFormScopeFromParent,
  seguimientoMuestraAvanceCurso,
  type SeguimientoParentRef,
} from "@/lib/seguimiento-form-scope";
import { seguimientoFormSchemaForScope } from "@/lib/validations";
import { useState } from "react";

export type SeguimientoParent = SeguimientoParentRef;

type SeguimientoFormProps = {
  parent: SeguimientoParent;
  onSuccess: () => void;
};

export function SeguimientoForm({ parent, onSuccess }: SeguimientoFormProps) {
  const scope = seguimientoFormScopeFromParent(parent);
  const muestraAvance = seguimientoMuestraAvanceCurso(scope);

  const [etiqueta, setEtiqueta] = useState("");
  const [porcentaje, setPorcentaje] = useState("");
  const [fechaComienzo, setFechaComienzo] = useState("");
  const [fechaAlerta, setFechaAlerta] = useState("");
  const [tiempoConsumido, setTiempoConsumido] = useState("");
  const [tiempoFaltante, setTiempoFaltante] = useState("");
  const [nivelEntendimiento, setNivelEntendimiento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const raw = {
      etiqueta_estado: etiqueta,
      fecha_comienzo: fechaComienzo,
      fecha_alerta: fechaAlerta,
      tiempo_consumido: tiempoConsumido,
      nivel_entendimiento: nivelEntendimiento,
      ...(muestraAvance
        ? {
            porcentaje_avance: porcentaje,
            tiempo_faltante_estimado: tiempoFaltante,
          }
        : {}),
    };

    const parsed = seguimientoFormSchemaForScope(scope).safeParse(raw);

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

    const payload =
      "temaId" in parent
        ? {
            ...parsed.data,
            tema_id: parent.temaId,
            comentario: undefined,
            porcentaje_avance: undefined,
            tiempo_faltante_estimado: undefined,
          }
        : "cursoId" in parent
          ? { ...parsed.data, curso_id: parent.cursoId, comentario: undefined }
          : { ...parsed.data, clase_id: parent.claseId, comentario: undefined };

    const result = await insertSeguimiento(userId, payload);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SeguimientoFormFields
        scope={scope}
        etiqueta={etiqueta}
        setEtiqueta={setEtiqueta}
        porcentaje={porcentaje}
        setPorcentaje={setPorcentaje}
        fechaComienzo={fechaComienzo}
        setFechaComienzo={setFechaComienzo}
        fechaAlerta={fechaAlerta}
        setFechaAlerta={setFechaAlerta}
        tiempoConsumido={tiempoConsumido}
        setTiempoConsumido={setTiempoConsumido}
        tiempoFaltante={tiempoFaltante}
        setTiempoFaltante={setTiempoFaltante}
        nivelEntendimiento={nivelEntendimiento}
        setNivelEntendimiento={setNivelEntendimiento}
        fieldErrors={fieldErrors}
      />
      <FormError message={error} />
      <FormSubmitButton loading={loading} label="Guardar seguimiento" />
    </form>
  );
}
