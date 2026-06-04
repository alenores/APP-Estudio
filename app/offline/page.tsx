export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-paper px-4 py-10 text-ink">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-border bg-paper-elevated p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Sin conexión
        </p>
        <h1 className="mt-2 text-2xl font-semibold">No hay internet</h1>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          Esta app funciona con datos en línea desde Supabase. Cuando vuelva la señal,
          recargá la página. El ícono instalado sigue siendo la forma recomendada de
          abrirla.
        </p>
      </section>
    </main>
  );
}
