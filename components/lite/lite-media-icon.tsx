/**
 * Íconos de medio para la card lite (ADR 012).
 *
 * YouTube y Platzi se dibujan con su marca (reconocibles de un vistazo, sin
 * pedir favicons por red); documento y link genérico usan glifos de lucide.
 */

import { FileText, Link2 } from "lucide-react";
import type { LiteMedia, LiteMediaKind } from "@/lib/academico-lite-media";

const BOX = {
  sm: "h-8 w-8 rounded-[10px]",
  md: "h-10 w-10 rounded-xl",
} as const;

type LiteMediaIconProps = {
  media: LiteMedia;
  size?: keyof typeof BOX;
};

function YouTubeGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" aria-hidden>
      <path d="M8.5 7.8v8.4L16.4 12 8.5 7.8Z" fill="currentColor" />
    </svg>
  );
}

/** Marca Platzi: doble galón ascendente. */
function PlatziGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" aria-hidden>
      <path
        d="M7 15.5 12.2 10 7 4.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12.5 19.5 17.7 14"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const SKIN: Record<LiteMediaKind, string> = {
  youtube: "bg-[#ff0033]/12 border-[#ff0033]/28 text-[#ff5670]",
  platzi: "bg-[#98ca3f]/12 border-[#98ca3f]/28 text-[#a9d84f]",
  markdown: "bg-white/5 border-white/10 text-[var(--lt-text-2)]",
  link: "bg-white/5 border-white/10 text-[var(--lt-text-3)]",
};

export function LiteMediaIcon({ media, size = "sm" }: LiteMediaIconProps) {
  return (
    <span
      className={`inline-flex flex-none items-center justify-center border ${BOX[size]} ${SKIN[media.kind]}`}
      title={media.label}
      aria-label={media.label}
      role="img"
    >
      {media.kind === "youtube" ? (
        <YouTubeGlyph />
      ) : media.kind === "platzi" ? (
        <PlatziGlyph />
      ) : media.kind === "markdown" ? (
        <FileText className="h-[50%] w-[50%]" strokeWidth={1.9} aria-hidden />
      ) : (
        <Link2 className="h-[50%] w-[50%]" strokeWidth={1.9} aria-hidden />
      )}
    </span>
  );
}

/** Fila de medios de un ítem (máximo dos). */
export function LiteMediaRow({
  medios,
  size = "sm",
}: {
  medios: LiteMedia[];
  size?: keyof typeof BOX;
}) {
  if (medios.length === 0) return null;
  return (
    <span className="flex flex-none items-center gap-1.5">
      {medios.map((m) => (
        <LiteMediaIcon key={m.kind} media={m} size={size} />
      ))}
    </span>
  );
}
