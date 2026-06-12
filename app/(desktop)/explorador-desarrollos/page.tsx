import { DesktopShell } from "@/components/desktop/desktop-shell";
import { DesarrollosExploradorView } from "@/components/desktop/desarrollos-explorador-view";
import { Suspense } from "react";

export default function ExploradorDesarrollosPage() {
  return (
    <DesktopShell title="Explorador desarrollos">
      <Suspense fallback={null}>
        <DesarrollosExploradorView />
      </Suspense>
    </DesktopShell>
  );
}
