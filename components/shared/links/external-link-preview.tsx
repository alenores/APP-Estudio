"use client";

import { PlatformLinkIcon } from "@/components/ui/platform-link-icon";
import type { LinkPreviewResult } from "@/lib/link-preview";
import { useEffect, useState } from "react";

type ExternalLinkPreviewProps = {
  link: string;
  /** `card` = panel expandido explorador PC; `detalle` = vista móvil. */
  variant?: "detalle" | "card";
};

/**
 * Detalle de curso/clase: miniatura del link si hay preview; si no, favicon.
 * Cards colapsadas del listado/explorador: PlatformLinkIcon sm.
 * Card expandida (explorador PC): variant `card`.
 */
export function ExternalLinkPreview({
  link,
  variant = "detalle",
}: ExternalLinkPreviewProps) {
  const card = variant === "card";
  const [preview, setPreview] = useState<LinkPreviewResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPreview(null);

    async function load() {
      try {
        const res = await fetch(
          `/api/link-preview?url=${encodeURIComponent(link.trim())}`,
        );
        if (!res.ok) {
          if (!cancelled) setPreview({ imageUrl: null, source: null });
          return;
        }
        const data = (await res.json()) as LinkPreviewResult;
        if (!cancelled) setPreview(data);
      } catch {
        if (!cancelled) setPreview({ imageUrl: null, source: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [link]);

  if (loading) {
    return (
      <div className={card ? "w-full" : "flex justify-center"}>
        <PlatformLinkIcon
          link={link}
          size={card ? "sm" : "lg"}
          className={card ? "w-full justify-center opacity-60" : "opacity-60"}
        />
      </div>
    );
  }

  if (!preview?.imageUrl) {
    return (
      <div className={card ? "w-full" : "flex justify-center"}>
        <PlatformLinkIcon
          link={link}
          size={card ? "sm" : "lg"}
          className={card ? "mx-auto" : undefined}
        />
      </div>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={
        card
          ? "block w-full overflow-hidden rounded-xl border border-[var(--td-line)] bg-[var(--td-card)] shadow-sm transition hover:border-[var(--td-navy)]/35 hover:shadow-md active:scale-[0.99]"
          : "mx-auto block w-full max-w-md overflow-hidden rounded-2xl border border-border bg-paper-elevated shadow-sm transition hover:border-accent/40 hover:shadow-md active:scale-[0.99]"
      }
      onClick={(e) => e.stopPropagation()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- URL externa variable (YouTube, OG) */}
      <img
        src={preview.imageUrl}
        alt=""
        className={
          card
            ? "aspect-video max-h-[7.5rem] w-full object-cover"
            : "aspect-video w-full object-cover"
        }
        loading="lazy"
        decoding="async"
        onError={() => setPreview({ imageUrl: null, source: null })}
      />
    </a>
  );
}
