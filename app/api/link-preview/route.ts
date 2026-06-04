import { normalizeHttpUrl, resolveLinkPreview } from "@/lib/link-preview";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Miniatura de un link de curso (YouTube directo; otros vía og:image).
 * Solo detalle de curso en cliente; listado de temas sigue con favicon.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url");
  if (!raw?.trim()) {
    return NextResponse.json({ error: "Falta url" }, { status: 400 });
  }

  if (!normalizeHttpUrl(raw)) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const preview = await resolveLinkPreview(raw);
  return NextResponse.json(preview, {
    headers: {
      "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
