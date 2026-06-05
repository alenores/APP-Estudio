import { Suspense, type ReactNode } from "react";
import { LoadingText } from "@/components/ui";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main className="p-8"><LoadingText /></main>}>
      {children}
    </Suspense>
  );
}
