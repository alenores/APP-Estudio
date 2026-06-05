"use client";

import type { TemaConDerivados } from "@/app/types/estudio";
import { EstudioProgressCard } from "@/components/shared/cards/estudio-progress-card";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";
import { fechaParentesisTema } from "@/lib/tema-card-fecha";
import { useNavItemForwardSwipe } from "@/lib/use-nav-item-forward-swipe";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TemaListCardProps = {
  tema: TemaConDerivados;
  cursosStats: HijosProgressStats;
};

export function TemaListCard({ tema, cursosStats }: TemaListCardProps) {
  const router = useRouter();
  const href = `/temas/${tema.id}`;

  const nav = useNavItemForwardSwipe({
    router,
    href,
    itemKey: href,
    enabled: true,
    blockNavigation: false,
  });

  return (
    <EstudioProgressCard
      kind="tema"
      nombre={tema.nombre}
      derivados={tema.derivados}
      fechaParen={fechaParentesisTema(tema)}
      hijosStats={cursosStats}
      hijosLabel="cursos"
      bodyWrapper={(content) => (
        <Link
          href={href}
          prefetch={false}
          className="block min-w-0"
          onClick={nav.onClick}
          onPointerDown={nav.onPointerDown}
          onPointerMove={nav.onPointerMove}
          onPointerUp={nav.onPointerUp}
          onPointerCancel={nav.onPointerCancel}
          style={{ touchAction: "pan-y" }}
        >
          {content}
        </Link>
      )}
    />
  );
}
