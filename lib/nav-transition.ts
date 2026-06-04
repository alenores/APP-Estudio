/** Navegación hacia hijo (adelante): salida a la izquierda, entrada desde la derecha. */

export const NAV_FORWARD_SESSION_KEY = "app-estudio-nav-forward";

export const NAV_TRANSITION_MS = 240;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function markNavForward() {
  try {
    sessionStorage.setItem(NAV_FORWARD_SESSION_KEY, "1");
  } catch {
    /* privado / sin storage */
  }
}

export function consumeNavForward(): boolean {
  try {
    const v = sessionStorage.getItem(NAV_FORWARD_SESSION_KEY);
    if (v) sessionStorage.removeItem(NAV_FORWARD_SESSION_KEY);
    return v === "1";
  } catch {
    return false;
  }
}

export function findNavPanel(): HTMLElement | null {
  return document.querySelector("[data-nav-panel]");
}

/** Pantalla actual al elegir un hijo: se corre hacia la izquierda (el usuario “avanza” a la derecha). */
export function animateExitForward(panel: HTMLElement): Promise<void> {
  if (prefersReducedMotion()) return Promise.resolve();

  const w = window.innerWidth;
  const offset = Math.min(w * 0.32, 120);

  return new Promise((resolve) => {
    panel.style.transition = `transform ${NAV_TRANSITION_MS}ms ease-out, opacity ${NAV_TRANSITION_MS}ms ease-out`;
    panel.style.transform = `translateX(${-offset}px)`;
    panel.style.opacity = "0.9";
    window.setTimeout(() => resolve(), NAV_TRANSITION_MS);
  });
}

/** Pantalla hija al montar: entra desde la derecha. */
export function animateEnterForward(panel: HTMLElement): void {
  if (prefersReducedMotion()) return;

  const w = window.innerWidth;
  const offset = Math.min(w * 0.32, 120);

  panel.style.transition = "none";
  panel.style.transform = `translateX(${offset}px)`;
  panel.style.opacity = "0.92";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      panel.style.transition = `transform ${NAV_TRANSITION_MS}ms ease-out, opacity ${NAV_TRANSITION_MS}ms ease-out`;
      panel.style.transform = "";
      panel.style.opacity = "";
      window.setTimeout(() => {
        panel.style.transition = "";
        panel.style.boxShadow = "";
      }, NAV_TRANSITION_MS);
    });
  });
}
