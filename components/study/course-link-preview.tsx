"use client";

import { PlatformLinkIcon } from "@/components/study/platform-link-icon";
import type { LinkPreviewResult } from "@/lib/link-preview";
import { useEffect, useState } from "react";

type CourseLinkPreviewProps = {
  link: string;
};

/**
 * Detalle de curso: miniatura del link si hay preview; si no, favicon como antes.
 * Listado de cursos bajo tema no usa este componente (sigue PlatformLinkIcon sm).
 */
export function CourseLinkPreview({ link }: CourseLinkPreviewProps) {
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
      <div className="flex justify-center">
        <PlatformLinkIcon link={link} size="lg" className="opacity-60" />
      </div>
    );
  }

  if (!preview?.imageUrl) {
    return (
      <div className="flex justify-center">
        <PlatformLinkIcon link={link} size="lg" />
      </div>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-auto block w-full max-w-md overflow-hidden rounded-2xl border border-border bg-paper-elevated shadow-sm transition hover:border-accent/40 hover:shadow-md active:scale-[0.99]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- URL externa variable (YouTube, OG) */}
      <img
        src={preview.imageUrl}
        alt=""
        className="aspect-video w-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setPreview({ imageUrl: null, source: null })}
      />
    </a>
  );
}
