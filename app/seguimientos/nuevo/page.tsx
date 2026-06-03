"use client";

import { getSessionUserId, insertSeguimientoTema } from "@/lib/estudio-queries";
import { AppShell } from "@/components/study/app-shell";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function NuevoSeguimientoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const temaId = searchParams.get("tema_id") ?? "";
  const cursoId = searchParams.get("curso_id") ?? "";
  const claseId = searchParams.get("clase_id") ?? "";

  const [etiqueta, setEtiqueta] = useState("");
  const [comentario, setComentario] = useState("");
  const [porcentaje, setPorcentaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setLoading(true);
    setError(null);
    const userId = await getSessionUserId();
    if (!userId) {
      setError("Sesión expirada. Volvé a iniciar sesión.");
      setLoading(false);
      return;
    }

    if (temaId) {
      const result = await insertSeguimientoTema(userId, {
        tema_id: temaId,
        etiqueta_estado: etiqueta || null,
        comentario: comentario || null,
        porcentaje_avance: porcentaje ? Number(porcentaje) : null,
      });
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
    } else {
      setError("Seguimiento para curso/clase: próxima iteración.");
      setLoading(false);
      return;
    }

    router.replace(backHref);
    router.refresh();
  }

  return (
    <AppShell title="Nuevo seguimiento" backHref={backHref}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Etiqueta de estado
          </span>
          <input
            value={etiqueta}
            onChange={(e) => setEtiqueta(e.target.value)}
            placeholder="ej. comenzado, en curso"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Porcentaje de avance
          </span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Comentario
          </span>
          <textarea
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </label>
        {error ? (
          <p className="text-sm text-rose-300" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Guardando…" : "Guardar seguimiento"}
        </button>
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
