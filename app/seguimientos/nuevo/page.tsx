import { redirect } from "next/navigation";

/** Alta de seguimiento: sheet en detalle de tema/curso/clase (ADR 003). */
export default function NuevoSeguimientoRedirect() {
  redirect("/temas");
}
