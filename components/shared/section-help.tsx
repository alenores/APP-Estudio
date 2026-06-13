"use client";

import { DesktopModal } from "@/components/desktop/desktop-modal";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import {
  getSectionHelp,
  type SectionHelpId,
} from "@/lib/section-help-content";
import { CircleHelp } from "lucide-react";
import { useState } from "react";

type SectionHelpSurface = "desktop" | "mobile";

type SectionHelpButtonProps = {
  sectionId: SectionHelpId;
  surface: SectionHelpSurface;
  size?: "sm" | "md";
  className?: string;
};

export function SectionHelpButton({
  sectionId,
  surface,
  size = "sm",
  className = "",
}: SectionHelpButtonProps) {
  const [open, setOpen] = useState(false);
  const { title, body } = getSectionHelp(sectionId);
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const btnClass =
    size === "sm"
      ? "h-6 w-6"
      : "h-7 w-7";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ayuda: ${title}`}
        title="Ayuda"
        className={`inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--td-line)] bg-white/80 text-[var(--td-ink-soft)] transition-all duration-150 hover:border-[var(--td-navy)]/35 hover:text-[var(--td-navy)] active:scale-90 dark:bg-stone-900/60 ${btnClass} ${className}`}
      >
        <CircleHelp className={iconClass} strokeWidth={2.25} aria-hidden />
      </button>

      {surface === "mobile" ? (
        <StudySheet open={open} onClose={() => setOpen(false)} title={title}>
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            {body}
          </p>
        </StudySheet>
      ) : (
        <DesktopModal open={open} onClose={() => setOpen(false)} title={title}>
          <p className="text-sm leading-relaxed text-[var(--td-ink-soft)]">
            {body}
          </p>
        </DesktopModal>
      )}
    </>
  );
}
