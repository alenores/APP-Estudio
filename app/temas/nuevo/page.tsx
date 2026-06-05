"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { TemaForm } from "@/components/shared/forms/tema-form";
import { useRouter } from "next/navigation";

export default function NuevoTemaPage() {
  const router = useRouter();
  const { refreshSnapshot } = useEstudioData();

  async function onSuccess(temaId: number) {
    await refreshSnapshot();
    router.replace(`/temas/${temaId}`);
  }

  return (
    <AppShell title="Nuevo tema" backHref="/temas" shellTone="tema">
      <TemaForm onSuccess={(id) => void onSuccess(id)} />
    </AppShell>
  );
}
