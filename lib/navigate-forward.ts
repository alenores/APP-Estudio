import {
  animateExitForward,
  findNavPanel,
  markNavForward,
  prefersReducedMotion,
} from "@/lib/nav-transition";

type AppRouterPush = { push: (href: string) => void };

/** Tap en card hijo: animación de salida y luego `router.push`. */
export async function navigateForward(
  router: AppRouterPush,
  href: string,
): Promise<void> {
  if (prefersReducedMotion()) {
    router.push(href);
    return;
  }

  const panel = findNavPanel();
  if (panel) {
    await animateExitForward(panel);
    panel.style.transform = "";
    panel.style.transition = "";
    panel.style.opacity = "";
  }

  markNavForward();
  router.push(href);
}
