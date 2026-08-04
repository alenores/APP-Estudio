"use client";

import { ArrowLeft, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useEffect, useMemo, useState } from "react";
import { LiteCard } from "@/components/lite/lite-card";
import { LiteConceptosPlayer } from "@/components/lite/lite-conceptos-player";
import { LiteContenidoPlayer } from "@/components/lite/lite-contenido-player";
import { LiteEstadoBadge, LiteTipoBadge } from "@/components/lite/lite-badges";
import { LiteLinkPreview } from "@/components/lite/lite-link-preview";
import { liteMedios } from "@/lib/academico-lite-media";
import { liteHijosLabel, type LiteItem } from "@/lib/academico-lite-read";
import { liteTtsProgressKey } from "@/lib/lite-tts-progress";
import type { Concepto } from "@/app/types/estudio";

type LiteDetallePanelProps = {
  item: LiteItem;
  hijos: LiteItem[];
  conceptos: Concepto[];
  /** Migas de la pila de navegación, sin incluir el ítem actual. */
  ruta: string[];
  onAbrirHijo: (hijo: LiteItem) => void;
  onVolver: () => void;
  onCerrar: () => void;
  onEditarEstado: () => void;
  /** `false` mientras hay un sheet encima: Escape le corresponde a esa capa. */
  escapeActivo: boolean;
};

type TabId = "hijos" | "contenido" | "conceptos";

const KIND_LABEL: Record<LiteItem["kind"], string> = {
  tema: "Tema",
  curso: "Curso",
  clase: "Clase",
};

/**
 * Detalle en la misma pantalla (ADR 012): sin cambio de ruta y sin métricas de
 * seguimiento — solo hijos, conceptos y contenido.
 *
 * Scroll único: el hero sube con el contenido; barra volver/cerrar fija;
 * pestañas sticky bajo esa barra (ADR 006: sin slide al montar).
 */
export function LiteDetallePanel({
  item,
  hijos,
  conceptos,
  ruta,
  onAbrirHijo,
  onVolver,
  onCerrar,
  onEditarEstado,
  escapeActivo,
}: LiteDetallePanelProps) {
  const medios = liteMedios(item);
  const externo = medios.find((m) => m.href) ?? null;
  const contenido = item.contenido?.trim() ?? "";

  const tabs = useMemo(() => {
    const disponibles: { id: TabId; label: string; count: number | null }[] = [];
    if (hijos.length > 0) {
      disponibles.push({
        id: "hijos",
        label: liteHijosLabel(item.kind),
        count: hijos.length,
      });
    }
    if (contenido) {
      disponibles.push({ id: "contenido", label: "Contenido", count: null });
    }
    if (conceptos.length > 0) {
      disponibles.push({
        id: "conceptos",
        label: "Conceptos",
        count: conceptos.length,
      });
    }
    return disponibles;
  }, [hijos.length, contenido, conceptos.length, item.kind]);

  const [tabElegida, setTabElegida] = useState<TabId | null>(null);

  const tab =
    tabElegida && tabs.some((t) => t.id === tabElegida)
      ? tabElegida
      : (tabs[0]?.id ?? null);

  useEffect(() => {
    if (!escapeActivo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onVolver();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onVolver, escapeActivo]);

  const migas = [...ruta, KIND_LABEL[item.kind]].join(" · ");

  return (
    <div className="lite-root lite-no-halo lite-detalle">
      {/* Chrome fijo: volver / cerrar siempre a mano */}
      <div className="lite-detalle-toolbar">
        <div className="mx-auto flex w-full max-w-[640px] items-center gap-2 px-4 py-2.5 pt-[max(0.65rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onVolver}
            className="lite-icon-btn flex-none"
            aria-label="Volver"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </button>
          <p className="lite-eyebrow min-w-0 flex-1 truncate">{migas}</p>
          <button
            type="button"
            onClick={onCerrar}
            className="lite-icon-btn flex-none"
            aria-label="Cerrar detalle"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>

      {/* Un solo scroll: hero + pestañas + cuerpo */}
      <div className="lite-detalle-scroll">
        <div className="lite-detalle-hero">
          <div className="mx-auto w-full max-w-[640px] px-4 pb-5 pt-3">
            <p className="lite-eyebrow mb-2">{KIND_LABEL[item.kind]}</p>
            <h2 className="lite-display text-[24px]">{item.nombre}</h2>

            {item.descripcion?.trim() ? (
              <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--lt-text-2)]">
                {item.descripcion}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onEditarEstado}
                className="transition active:scale-95"
                aria-label="Cambiar estado"
              >
                <LiteEstadoBadge estado={item.estado} className="cursor-pointer" />
              </button>
              <LiteTipoBadge tipo={item.tipoEstudio} />
              {item.hijosTotal > 0 ? (
                <span className="text-[12.5px] font-medium text-[var(--lt-text-3)]">
                  {item.hijosTerminados}/{item.hijosTotal}{" "}
                  {liteHijosLabel(item.kind).toLowerCase()}
                </span>
              ) : null}
            </div>

            {externo?.href ? (
              <div className="mt-4">
                <LiteLinkPreview media={externo} variant="hero" />
              </div>
            ) : null}
          </div>
        </div>

        {tabs.length > 0 ? (
          <div className="lite-detalle-tabs">
            <div className="mx-auto w-full max-w-[640px] overflow-x-auto px-4">
              <div className="lite-tabs w-max">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="lite-tab"
                    data-active={tab === t.id}
                    onClick={() => setTabElegida(t.id)}
                  >
                    {t.label}
                    {t.count !== null ? (
                      <span className="ml-1.5 text-[var(--lt-text-3)]">{t.count}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-[640px] px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4">
          {tab === "hijos" ? (
            <ul className="space-y-2.5">
              {hijos.map((hijo) => (
                <li key={`${hijo.kind}-${hijo.id}`}>
                  <LiteCard item={hijo} onSelect={onAbrirHijo} />
                </li>
              ))}
            </ul>
          ) : null}

          {tab === "contenido" ? (
            <LiteContenidoPlayer
              contenido={contenido}
              progressKey={liteTtsProgressKey("contenido", item.kind, item.id)}
            />
          ) : null}

          {tab === "conceptos" ? (
            <LiteConceptosPlayer
              conceptos={conceptos}
              progressKey={liteTtsProgressKey("conceptos", item.kind, item.id)}
            />
          ) : null}

          {tabs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p className="lite-title">Sin material cargado</p>
              <p className="max-w-[280px] text-[13.5px] leading-relaxed text-[var(--lt-text-3)]">
                Este {KIND_LABEL[item.kind].toLowerCase()} todavía no tiene hijos,
                conceptos ni contenido.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
