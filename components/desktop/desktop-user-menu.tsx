"use client";

import { clearEstudioOfflineCache } from "@/lib/estudio-offline-cache";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

function userDisplay(user: User) {
  const meta = user.user_metadata ?? {};
  const avatarUrl =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    null;
  const name =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    user.email?.split("@")[0] ||
    "Usuario";
  return { avatarUrl, name };
}

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function UserAvatar({
  avatarUrl,
  name,
}: {
  avatarUrl: string | null;
  name: string;
}) {
  const [imageError, setImageError] = useState(false);
  const showImage = avatarUrl && !imageError;

  if (showImage) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--td-navy)] text-xs font-bold text-white ring-2 ring-white"
    >
      {userInitials(name)}
    </span>
  );
}

function LogOutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

/** Chip usuario + FAB de cierre de sesión (shell escritorio). */
export function DesktopUserMenu() {
  const router = useRouter();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    void supabase.auth.getUser().then(({ data: { user: current } }) => {
      if (mounted) setUser(current);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    const supabase = createClient();
    clearEstudioOfflineCache();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (!user) return null;

  const { avatarUrl, name } = userDisplay(user);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className={`flex max-w-[min(100vw-2rem,14rem)] items-center gap-2 rounded-full border py-0.5 pl-0.5 pr-3 transition-colors sm:max-w-xs sm:pr-3.5 ${
          open
            ? "border-[var(--td-navy)] bg-[var(--td-line-soft)]"
            : "border-[var(--td-line)] hover:bg-[var(--td-line-soft)]"
        }`}
      >
        <UserAvatar avatarUrl={avatarUrl} name={name} />
        <span className="min-w-0 truncate text-sm font-semibold text-[var(--td-ink)]">
          {name}
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex flex-col items-end"
        >
          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            onClick={() => void signOut()}
            aria-label="Salir"
            title="Salir"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--td-red)] text-white shadow-lg shadow-[var(--td-red)]/30 transition-[transform,background-color] hover:brightness-110 active:scale-95 disabled:opacity-60"
          >
            <LogOutIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}
