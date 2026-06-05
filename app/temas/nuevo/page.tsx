"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { AppShell } from "@/components/study/app-shell";
import { TemaForm } from "@/components/study/forms/tema-form";
import { useRouter } from "next/navigation";

export default function NuevoTemaPage() {
  const router = useRouter();
  const { refreshSnapshot } = useEstudioData();

  async function onSuccess(temaId: number) {
    await refreshSnapshot();
    router.replace(`/temas/${temaId}`);
  }

  return (
    <AppShell title="Nuevo tema" backHref="/temas">
      <TemaForm onSuccess={(id) => void onSuccess(id)} />
    </AppShell>
  );
}
