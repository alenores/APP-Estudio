/**
 * Vibración táctil (Android PWA). En iOS no hay API; falla en silencio.
 * Tras setTimeout el gesto puede perder "user activation": usamos patrón más largo
 * y un pulso leve al inicio del press cuando aplica.
 */

export function hapticLightTap() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(8);
    }
  } catch {
    /* sin permiso */
  }
}

/** Sheet abierto, acción confirmada. */
export function hapticOpen() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(12);
    }
  } catch {
    /* sin permiso */
  }
}

/** Menú contextual tras long press (más perceptible que un solo pulso). */
export function hapticContextMenu() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([14, 42, 18]);
    }
  } catch {
    /* sin permiso */
  }
}

/** Umbral de swipe atrás alcanzado. */
export function hapticSwipeCommit() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  } catch {
    /* sin permiso */
  }
}
