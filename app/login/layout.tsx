import { Suspense, type ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<main className="p-8 text-slate-400">Cargando…</main>}>{children}</Suspense>;
}
