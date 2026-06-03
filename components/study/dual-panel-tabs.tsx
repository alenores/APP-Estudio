"use client";

import { useState, type ReactNode } from "react";

type DualPanelTabsProps = {
  panelA: { label: string; content: ReactNode };
  panelB: { label: string; content: ReactNode };
};

export function DualPanelTabs({ panelA, panelB }: DualPanelTabsProps) {
  const [active, setActive] = useState<"a" | "b">("a");

  return (
    <section className="space-y-4">
      <div
        className="flex rounded-xl border border-border bg-paper-elevated p-1"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={active === "a"}
          onClick={() => setActive("a")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
            active === "a"
              ? "bg-accent text-white shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {panelA.label}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === "b"}
          onClick={() => setActive("b")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
            active === "b"
              ? "bg-accent text-white shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {panelB.label}
        </button>
      </div>
      <div role="tabpanel">
        {active === "a" ? panelA.content : panelB.content}
      </div>
    </section>
  );
}
