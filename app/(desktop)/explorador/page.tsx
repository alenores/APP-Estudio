import { DesktopShell } from "@/components/desktop/desktop-shell";
import { ExploradorView } from "@/components/desktop/explorador-view";
import { Suspense } from "react";

export default function ExploradorPage() {
  return (
    <DesktopShell title="Explorador de estudio">
      <Suspense fallback={null}>
        <ExploradorView />
      </Suspense>
    </DesktopShell>
  );
}
