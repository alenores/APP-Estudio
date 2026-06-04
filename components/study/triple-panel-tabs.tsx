"use client";

import { useState, type ReactNode } from "react";

type TriplePanelTabsProps = {
  panelA: { label: string; content: ReactNode };
  panelB: { label: string; content: ReactNode };
  panelC: { label: string; content: ReactNode };
};

export function TriplePanelTabs({
  panelA,
  panelB,
  panelC,
}: TriplePanelTabsProps) {
  const [active, setActive] = useState<"a" | "b" | "c">("a");

  const panels = [
    { key: "a" as const, ...panelA },
    { key: "b" as const, ...panelB },
    { key: "c" as const, ...panelC },
  ];

  return (
    <section className="space-y-4">
      <div
        className="flex rounded-xl border border-border bg-paper-elevated p-1"
        role="tablist"
      >
        {panels.map((panel) => (
          <button
            key={panel.key}
            type="button"
            role="tab"
            aria-selected={active === panel.key}
            onClick={() => setActive(panel.key)}
            className={`flex-1 rounded-lg px-1 py-2.5 text-xs font-semibold transition sm:text-sm ${
              active === panel.key
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {panel.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {panels.find((p) => p.key === active)?.content}
      </div>
    </section>
  );
}
