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
        className="flex rounded-xl bg-slate-900 p-1 ring-1 ring-slate-800"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={active === "a"}
          onClick={() => setActive("a")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
            active === "a"
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200"
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
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200"
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
