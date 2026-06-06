import {
  formatFormParentSubtitle,
  formParentKindLabel,
  type FormParentKind,
} from "@/lib/form-parent-context";

type FormParentBannerProps = {
  parentKind: FormParentKind;
  parentName: string;
  className?: string;
};

/** Indica en el sheet/modal bajo qué padre se carga el registro hijo. */
export function FormParentBanner({
  parentKind,
  parentName,
  className = "",
}: FormParentBannerProps) {
  const subtitle = formatFormParentSubtitle(parentKind, parentName);

  return (
    <div
      className={`form-parent-banner rounded-xl border border-[var(--td-line)] bg-[var(--td-line-soft)]/45 px-3.5 py-2.5 ${className}`}
      aria-label={subtitle}
    >
      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--td-faint)]">
        Se carga en
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-[var(--td-ink)]">
        {formParentKindLabel(parentKind)}{" "}
        <span className="font-bold text-[var(--td-navy)]">{parentName.trim() || "—"}</span>
      </p>
    </div>
  );
}
