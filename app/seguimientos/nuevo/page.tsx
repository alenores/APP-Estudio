"use client";

import { AppShell } from "@/components/study/app-shell";
import { FormError, FormSubmitButton } from "@/components/study/form-field";
import { SeguimientoFormFields } from "@/components/study/seguimiento-form-fields";
import { getSessionUserId, insertSeguimiento } from "@/lib/estudio-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { seguimientoFormSchema } from "@/lib/validations";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function NuevoSeguimientoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const temaId = searchParams.get("tema_id") ?? "";
  const cursoId = searchParams.get("curso_id") ?? "";
  const claseId = searchParams.get("clase_id") ?? "";

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

  const backHref = temaId
    ? `/temas/${temaId}`
    : cursoId
      ? `/cursos/${cursoId}`
      : claseId
        ? `/clases/${claseId}`
        : "/temas";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!temaId && !cursoId && !claseId) {
      setError("Falta tema_id, curso_id o clase_id en la URL.");
      return;
    }

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

    const result = await insertSeguimiento(userId, {
      ...parsed.data,
      tema_id: temaId || undefined,
      curso_id: cursoId || undefined,
      clase_id: claseId || undefined,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.replace(backHref);
    router.refresh();
  }

  return (
    <AppShell title="Nuevo seguimiento" backHref={backHref}>
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
    </AppShell>
  );
}

export default function NuevoSeguimientoPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-400">Cargando…</p>}>
      <NuevoSeguimientoForm />
    </Suspense>
  );
}
