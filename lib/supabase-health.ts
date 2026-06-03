/**
 * Ping liviano a Supabase (auth health). No requiere tablas de negocio.
 */
export async function pingSupabase(): Promise<{
  ok: boolean;
  message: string;
  detail?: string;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return {
      ok: false,
      message: "Faltan variables de entorno",
      detail: "Configurá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local",
    };
  }

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        ok: false,
        message: "Supabase respondió con error",
        detail: `HTTP ${res.status}`,
      };
    }

    const body = (await res.json()) as { version?: string };
    return {
      ok: true,
      message: "Conectado",
      detail: body.version ? `Auth API v${body.version}` : undefined,
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Error de red";
    return { ok: false, message: "Sin conexión a Supabase", detail };
  }
}
