import { PrimaryButtonLink, SecondaryButtonLink } from "@/components/ui";

/** Fallback del service worker cuando la ruta pedida no está en caché (ADR 013). */
export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-paper px-4 py-10 text-ink">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-border bg-paper-elevated p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Sin conexión
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Esta pantalla no está descargada</h1>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          Los temas, cursos, clases, seguimientos y conceptos del paquete local se
          consultan sin internet. Esta pantalla todavía no quedó guardada en el
          dispositivo, o necesita conexión (altas, edición, previews de links de
          Platzi y YouTube).
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <PrimaryButtonLink href="/temas">Ir a temas</PrimaryButtonLink>
          <SecondaryButtonLink href="/">Inicio</SecondaryButtonLink>
        </div>
      </section>
    </main>
  );
}
