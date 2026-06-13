"use client";

import { DesktopModal } from "@/components/desktop/desktop-modal";
import { DesarrollosSyncBanner } from "@/components/shared/sync/desarrollos-sync-banner";
import { TextLink } from "@/components/ui";
import { writeContentTypology } from "@/lib/content-typology";
import { Map } from "lucide-react";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";

type DesarrollosDetalleNavProps = {
  explorerHref: string;
};

type FormOverlayProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** Wrapper DesktopModal para formularios en fichas desarrollos PC. */
export function desarrollosDesktopFormOverlay({
  open,
  onClose,
  title,
  children,
}: FormOverlayProps) {
  return (
    <DesktopModal open={open} onClose={onClose} title={title}>
      {children}
    </DesktopModal>
  );
}

/** Enlaces superiores compartidos — ficha detalle desarrollos en PC (ADR 011). */
export function DesarrollosDetalleNav({ explorerHref }: DesarrollosDetalleNavProps) {
  useEffect(() => {
    writeContentTypology("desarrollos");
  }, []);

  return (
    <>
      <DesarrollosSyncBanner />
      <div className="flex flex-wrap items-center gap-3">
        <TextLink href={explorerHref}>← Volver al explorador</TextLink>
        <TextLink href="/">Cambiar tipología</TextLink>
        <Link
          href="/mapa"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#EA580C] transition-colors hover:text-[#c2410c]"
        >
          <Map className="h-3.5 w-3.5" aria-hidden />
          Mapa desarrollos
        </Link>
      </div>
    </>
  );
}
