import { redirect } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";

type Props = { params: Promise<{ id: string }> };

/** Alta de curso: sheet en detalle de tema (ADR 003). */
export default async function NuevoCursoRedirect({ params }: Props) {
  const { id } = await params;
  const temaId = parseEntityId(id);
  redirect(temaId != null ? `/temas/${temaId}` : "/temas");
}
