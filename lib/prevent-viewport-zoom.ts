export const PINCH_ZOOM_IMAGE_ATTR = "data-pinch-zoom-image";
export const STANDALONE_ZOOM_LOCK_CLASS = "pwa-standalone-zoom-lock";

const DOUBLE_TAP_MS = 300;

function isInsidePinchZoomImage(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return target.closest(`[${PINCH_ZOOM_IMAGE_ATTR}]`) !== null;
}

function isMultiTouchOnPinchZoomImage(event: TouchEvent): boolean {
  for (let i = 0; i < event.touches.length; i++) {
    const { clientX, clientY } = event.touches[i];
    const el = document.elementFromPoint(clientX, clientY);
    if (isInsidePinchZoomImage(el)) return true;
  }
  return false;
}

function shouldBlockViewportPinch(event: TouchEvent): boolean {
  return event.touches.length >= 2 && !isMultiTouchOnPinchZoomImage(event);
}

export function isIosTouchDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipod|ipad/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

type GestureLikeEvent = Event & { scale?: number };

const CAPTURE_PASSIVE_FALSE = { capture: true, passive: false } as const;

export function mountViewportZoomPrevention(): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }

  const root = document.documentElement;
  root.classList.add(STANDALONE_ZOOM_LOCK_CLASS);

  const cleanups: Array<() => void> = [
    () => root.classList.remove(STANDALONE_ZOOM_LOCK_CLASS),
  ];

  const add = (
    target: Document,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
  ) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const blockGesture = (event: GestureLikeEvent) => {
    event.preventDefault();
  };

  if (isIosTouchDevice()) {
    for (const type of ["gesturestart", "gesturechange", "gestureend"] as const) {
      add(document, type, blockGesture as EventListener, { passive: false });
    }
  }

  const blockMultiTouch = (event: TouchEvent) => {
    if (!shouldBlockViewportPinch(event)) return;
    event.preventDefault();
  };

  add(document, "touchstart", blockMultiTouch as EventListener, CAPTURE_PASSIVE_FALSE);
  add(document, "touchmove", blockMultiTouch as EventListener, CAPTURE_PASSIVE_FALSE);

  let lastTouchEnd = 0;

  const blockDoubleTap = (event: TouchEvent) => {
    if (isInsidePinchZoomImage(event.target)) return;
    const now = Date.now();
    if (now - lastTouchEnd <= DOUBLE_TAP_MS) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  };

  add(document, "touchend", blockDoubleTap as EventListener, CAPTURE_PASSIVE_FALSE);

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
