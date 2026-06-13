import { platformFromLink } from "@/lib/platform-from-link";

type PlatformLinkIconProps = {
  link: string;
  /** sm = listado; lg = detalle de curso */
  size?: "sm" | "lg";
  className?: string;
  /** Etiqueta de accesibilidad según uso del link. */
  purpose?: "course" | "chat";
};

const SIZE_PX = { sm: 32, lg: 44 } as const;

/**
 * Ícono tocable que abre el link externo del curso (Platzi, YouTube, etc.).
 * Usa favicon del dominio; stopPropagation para no activar la card padre.
 */
export function PlatformLinkIcon({
  link,
  size = "sm",
  className = "",
  purpose = "course",
}: PlatformLinkIconProps) {
  const platform = platformFromLink(link);
  if (!platform) return null;

  const px = SIZE_PX[size];
  const pad = size === "lg" ? "p-2.5" : "p-1.5";
  const actionLabel =
    purpose === "chat"
      ? `Abrir chat en ${platform.label}`
      : `Abrir curso en ${platform.label}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={actionLabel}
      title={platform.label}
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border border-border bg-paper-elevated shadow-sm transition hover:border-accent/40 hover:shadow-md active:scale-95 ${pad} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- favicon externo por dominio */}
      <img
        src={platform.faviconUrl}
        alt=""
        width={px}
        height={px}
        className="rounded-md object-contain"
        loading="lazy"
        decoding="async"
      />
    </a>
  );
}
