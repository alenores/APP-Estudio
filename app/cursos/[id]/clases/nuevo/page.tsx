import { redirect } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";

type Props = { params: Promise<{ id: string }> };

/** Alta de clase: sheet en detalle de curso (ADR 003). */
export default async function NuevaClaseRedirect({ params }: Props) {
  const { id } = await params;
  const cursoId = parseEntityId(id);
  redirect(cursoId != null ? `/cursos/${cursoId}` : "/temas");
}
