"use client";

import { AppShell } from "@/components/study/app-shell";
import Link from "next/link";

/** Placeholder hasta implementar detalle de curso (fase siguiente). */
export default function CursoDetallePlaceholder() {
  return (
    <AppShell title="Curso" backHref="/temas">
      <p className="text-sm text-slate-400">
        Detalle de curso en construcción. Volvé al tema o seguí desde la lista de
        temas.
      </p>
      <Link href="/temas" className="text-sm text-indigo-400 hover:underline">
        Ir a temas
      </Link>
    </AppShell>
  );
}
