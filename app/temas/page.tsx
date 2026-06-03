"use client";

import { useTemasList } from "@/app/hooks/useTemasList";
import { AppShell } from "@/components/study/app-shell";
import { EntityCard } from "@/components/study/entity-card";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TemasPage() {
  const router = useRouter();
  const { temas, loading, error } = useTemasList();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <AppShell
      title="Temas"
      backHref="/"
      actions={
        <button
          type="button"
          onClick={() => void signOut()}
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          Salir
        </button>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-400">Cargando temas…</p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && temas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-500">
          No hay temas. Creá filas en Supabase o agregá el primero desde Table Editor.
        </p>
      ) : null}
      <ul className="space-y-3">
        {temas.map((t) => (
          <li key={t.id}>
            <EntityCard
              href={`/temas/${t.id}`}
              nombre={t.nombre}
              subtitulo={t.descripcion}
              derivados={t.derivados}
              badge={`#${t.orden}`}
            />
          </li>
        ))}
      </ul>
      <p className="text-center text-xs text-slate-600">
        <Link href="/" className="text-indigo-400 hover:underline">
          Inicio
        </Link>
      </p>
    </AppShell>
  );
}
