"use client";

import { FormError, FormSubmitButton } from "@/components/study/form-field";
import { SeguimientoFormFields } from "@/components/study/seguimiento-form-fields";
import { getSessionUserId, insertSeguimiento } from "@/lib/estudio-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { seguimientoFormSchema } from "@/lib/validations";
import { useState } from "react";

export type SeguimientoParent =
  | { temaId: number }
  | { cursoId: number }
  | { claseId: number };

type SeguimientoFormProps = {
  parent: SeguimientoParent;
  onSuccess: () => void;
};

export function SeguimientoForm({ parent, onSuccess }: SeguimientoFormProps) {
  const [etiqueta, setEtiqueta] = useState("");
  const [porcentaje, setPorcentaje] = useState("");
  const [comentario, setComentario] = useState("");
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

    const parsed = seguimientoFormSchema.safeParse({
      etiqueta_estado: etiqueta,
      porcentaje_avance: porcentaje,
      comentario,
      fecha_comienzo: fechaComienzo,
      fecha_alerta: fechaAlerta,
      tiempo_consumido: tiempoConsumido,
      tiempo_faltante_estimado: tiempoFaltante,
      nivel_entendimiento: nivelEntendimiento,
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

    const payload =
      "temaId" in parent
        ? { ...parsed.data, tema_id: parent.temaId }
        : "cursoId" in parent
          ? { ...parsed.data, curso_id: parent.cursoId }
          : { ...parsed.data, clase_id: parent.claseId };

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
        etiqueta={etiqueta}
        setEtiqueta={setEtiqueta}
        porcentaje={porcentaje}
        setPorcentaje={setPorcentaje}
        comentario={comentario}
        setComentario={setComentario}
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
