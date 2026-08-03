"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, Wrench, Zap } from "lucide-react";
import { InstallPwaButton } from "@/app/install-pwa-button";
import { usePwaOnDeviceInBrowser } from "@/app/hooks/usePwaOnDeviceInBrowser";
import { AndroidOpenFromHomeHelp } from "@/components/mobile/pwa/android-open-from-home-help";
import { IosPwaInstallHelp } from "@/components/mobile/pwa/ios-pwa-install-help";
import { DeployShaFooter } from "@/components/deploy-sha-footer";
import { createClient } from "@/lib/supabase/client";
import { isMobileShellClient } from "@/lib/shell-detect";
import {
  readContentTypology,
  typologyEntryPath,
  writeContentTypology,
  type ContentTypology,
} from "@/lib/content-typology";
import {
  getPwaInstalledServerSnapshot,
  getPwaInstalledSnapshot,
  isIphoneForPwaInstall,
  isStandaloneMode,
  subscribePwaInstalled,
} from "@/lib/pwa-platform";

type Entrada = {
  typology: ContentTypology;
  titulo: string;
  descripcion: string;
  icono: typeof GraduationCap;
  /** Color de acento propio de la entrada. */
  tono: string;
};

const ENTRADAS: Entrada[] = [
  {
    typology: "academico_lite",
    titulo: "Académico lite",
    descripcion: "Temas y cursos para estudiar, sin gestión.",
    icono: Zap,
    tono: "#3ee08f",
  },
  {
    typology: "academico",
    titulo: "Académico",
    descripcion: "Temas, cursos, clases y seguimiento completo.",
    icono: GraduationCap,
    tono: "#4cb2f8",
  },
  {
    typology: "desarrollos",
    titulo: "Desarrollos",
    descripcion: "Definición general, específica y acciones.",
    icono: Wrench,
    tono: "#f2914a",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [isIphone, setIsIphone] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [typology, setTypology] = useState<ContentTypology>("academico");

  const isInstalledMode = useSyncExternalStore(
    subscribePwaInstalled,
    () => isStandaloneMode() || getPwaInstalledSnapshot(),
    getPwaInstalledServerSnapshot,
  );

  const pwaOnDeviceInBrowser = usePwaOnDeviceInBrowser(isInstalledMode);

  useEffect(() => {
    setIsIphone(isIphoneForPwaInstall());
    setTypology(readContentTypology());
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionEmail(user?.email ?? null);
    });
  }, []);

  function enterTypology(next: ContentTypology) {
    writeContentTypology(next);
    setTypology(next);
    const shell = isMobileShellClient() ? "mobile" : "desktop";
    router.push(typologyEntryPath(next, shell));
  }

  const showInstallBlock = !isInstalledMode && pwaOnDeviceInBrowser !== true;

  return (
    <div className="lite-root flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-[640px] flex-1 px-5 pb-10 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))]">
        <header>
          <div className="flex items-center gap-2">
            <p className="lite-eyebrow">APP Estudio</p>
            {isInstalledMode ? (
              <span className="rounded-full border border-[var(--lt-accent-line)] bg-[var(--lt-accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--lt-accent)]">
                Modo app
              </span>
            ) : null}
          </div>
          <h1 className="lite-display mt-2.5">
            ¿Qué estudiás
            <br />
            hoy?
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--lt-text-2)]">
            Elegí por dónde entrar.
          </p>
        </header>

        <nav className="mt-8 space-y-3" aria-label="Tipologías">
          {ENTRADAS.map((entrada) => (
            <EntradaCard
              key={entrada.typology}
              entrada={entrada}
              activa={typology === entrada.typology}
              onClick={() => enterTypology(entrada.typology)}
            />
          ))}
        </nav>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--lt-line)] pt-5">
          {sessionEmail ? (
            <p className="min-w-0 truncate text-[13px] text-[var(--lt-text-3)]">
              {sessionEmail}
            </p>
          ) : (
            <Link href="/login" className="lite-cta">
              Iniciar sesión
            </Link>
          )}
        </div>

        {pwaOnDeviceInBrowser === true ? (
          <section className="mt-6">
            <AndroidOpenFromHomeHelp />
          </section>
        ) : null}

        {showInstallBlock ? (
          <section className="lite-panel mt-6 p-5">
            <p className="lite-eyebrow">Instalar</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--lt-text-2)]">
              Agregá la app al inicio para abrirla como{" "}
              <strong className="font-semibold text-[var(--lt-text)]">
                APP Estudio
              </strong>
              .
            </p>
            <div className="mt-4 space-y-3">
              <InstallPwaButton fullWidth tone="lite" />
              {isIphone ? <IosPwaInstallHelp /> : null}
              {!isIphone ? (
                <p className="text-[12px] leading-relaxed text-[var(--lt-text-3)]">
                  En Chrome Android aparece el botón cuando el navegador ofrece
                  instalar. Si no aparece, probá desde el menú ⋮ → Instalar
                  aplicación.
                </p>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>
      <DeployShaFooter />
    </div>
  );
}

function EntradaCard({
  entrada,
  activa,
  onClick,
}: {
  entrada: Entrada;
  activa: boolean;
  onClick: () => void;
}) {
  const Icono = entrada.icono;

  return (
    <button
      type="button"
      onClick={onClick}
      className="lite-card p-4"
      style={
        activa
          ? {
              borderColor: `color-mix(in srgb, ${entrada.tono} 34%, transparent)`,
              background: `color-mix(in srgb, ${entrada.tono} 7%, var(--lt-surface))`,
            }
          : undefined
      }
    >
      <span className="flex items-center gap-4">
        <span
          className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-2xl border"
          style={{
            borderColor: `color-mix(in srgb, ${entrada.tono} 28%, transparent)`,
            background: `color-mix(in srgb, ${entrada.tono} 12%, transparent)`,
            color: entrada.tono,
          }}
          aria-hidden
        >
          <Icono className="h-[21px] w-[21px]" strokeWidth={1.9} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="lite-title block">{entrada.titulo}</span>
          <span className="mt-1 block text-[13.5px] leading-snug text-[var(--lt-text-3)]">
            {entrada.descripcion}
          </span>
        </span>

        <ArrowRight
          className="h-[18px] w-[18px] flex-none"
          strokeWidth={2}
          style={{ color: activa ? entrada.tono : "var(--lt-text-3)" }}
          aria-hidden
        />
      </span>
    </button>
  );
}
