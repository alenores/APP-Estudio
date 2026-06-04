# ADR 006: Feedback visual en móvil (Android / PWA)

## Estado

Aceptado — 2026-06-03

## Contexto

APP Estudio es **móvil-first** (PWA en Chrome Android). En desarrollo, las animaciones CSS y la emulación de dispositivo en **PC suelen verse bien**; en el **teléfono real** muchas no se ejecutan (el UI salta de estado inicial a final al instante). Se perdió tiempo probando keyframes, `transition`, doble `requestAnimationFrame`, Web Animations API y DOM “retenido” en el FAB y en `StudySheet` — con riesgo de **UI trabada** (capas con `pointer-events-none`, `transform` colgado, `overflow: hidden` en `body`).

Este ADR fija el **patrón que sí funciona** para futuras features con “animación” o sensación de respuesta al toque.

## Excepción: detalle de tema (`/temas/[id]`)

Animaciones de entrada en página (`rise`, timeline, velocímetro, `panelin` en pestañas) según `docs/mockups/detalle-tema.html`. Scope CSS `.tema-detalle-page` + `prefers-reduced-motion`. No extender a `StudySheet` ni FAB.

## Lo que no usar (salvo pedido explícito del dueño)

| Técnica | Problema en Android |
|--------|---------------------|
| Slide del panel (`translateY`) al **montar** desmontar | Transición no arranca; o bloqueo con estilos inline |
| `@keyframes` + clase al montar ítems (ej. menú FAB escalonado) | Mismo salto instantáneo |
| `transition` + `open` en el mismo frame que el montaje | Estado final en el primer pintado |
| WAAPI + `retained` + `pointer-events` acoplados a `open` | Cierre roto, sheet invisible pero app bloqueada |
| Confiar solo en emulación Chrome desktop | No reproduce el bug |

## Patrón recomendado (checklist)

1. **Feedback en el control que el usuario tocó**
   - `active:scale-95` (u otro estado `:active` simple).
   - `transition-[transform,colors] duration-150` en el **botón**, no en el panel que aparece después.

2. **Separar toque de la acción siguiente**
   - Delay corto y constante: `FAB_OPEN_DELAY_MS` (120 ms) en `lib/fab-open-delay.ts`.
   - Aplicar en `FabExpandMenu` / `FabActionButton` **antes** de cerrar menú y abrir sheet.
   - Misma idea para futuros flujos: “primero feedback del botón, después modal/sheet/navegación”.

3. **Capas modales (`StudySheet`)**
   - Panel: aparición **instantánea** (`if (!open) return null`).
   - Velo: solo **fade de opacidad** (`.sheet-backdrop-enter` en `globals.css`) — sin mover el panel al **abrir**.
   - Opcional: `navigator.vibrate(12)` al abrir (falla en silencio si no hay API).
   - Cerrar: tap fuera, Cerrar, Escape, **swipe hacia abajo** (manija + cabecera, o contenido con scroll arriba; umbral ~80 px). El panel sigue el dedo solo durante el gesto; al soltar se cierra sin animación de salida obligatoria.
   - **No** animar `translateY` al montar/desmontar el sheet (sigue prohibido); el drag es interacción del usuario, no keyframes de entrada.

4. **FAB expandible**
   - Sin escalonado entre ítems; menú simple abrir/cerrar + rotación del `+`.
   - Ver `components/study/fab-expand-menu.tsx`.

5. **Probar en dispositivo**
   - Confirmar con SHA del footer en el celular; la emulación PC **no alcanza** para animaciones.

6. **Long press en card hijo** (cursos bajo tema, clases bajo curso)
   - Mantener apretada la card ~480 ms (`LONG_PRESS_MS`): pulso leve al tocar (`hapticLightTap`) + patrón al abrir menú (`hapticContextMenu` en `lib/haptic.ts`; el timer puede perder user activation en algunos Android).
   - Barra contextual **encima de la card** (ancho adaptativo, 2 botones) con Seguimiento / Concepto del **hijo**.
   - Tap corto sigue abriendo el detalle; el ícono de link externo no dispara el menú.
   - Mismos sheets y forms que el FAB; título del sheet puede incluir el nombre del hijo.

7. **Entrar a un hijo (card con `forwardTransition`)**
   - **Tap** o **swipe ←** en la fila (`EntityCard` / `entity-card-with-quick-actions`): la hoja `data-nav-panel` se corre a la izquierda (~92 % ancho, **210 ms**), `sessionStorage`, luego `router.push`. Cards curso/clase: **pointer** en el Link (no `touch` en el wrapper). Panel con **ganancia** ~1.45× el dedo; commit ~52 px o ~32 % de la salida (dedo al centro de la pantalla). **Swipe →** sobre una card no bloquea volver: el gesto burbujea al `AppShell` (`use-nav-item-forward-swipe` abandona y no hace `stopPropagation`).
   - Long press en la misma card cancela el timer si arranca el swipe horizontal (`onForwardSwipeStart`).
   - Detalle hijo al montar: entrada desde la **derecha** (~92 % ancho, mismo orden que la salida), `scale` 0.992→1, doble `rAF` en Android (`lib/use-nav-detail-gestures.ts`). Salida adelante espera **210 ms** (transición CSS) antes de `push`; opcional `startViewTransition` si el navegador lo soporta.

8. **Volver atrás con swipe** (`AppShell` con `backHref`)
   - **NavStage:** fondo fijo (degradado `accent-subtle`) + hoja blanca `max-w-lg` redondeada con sombra; solo la hoja se transforma — al deslizar se ve el “costado” entre pantallas (efecto libro, paridad app hermana).
   - Swipe horizontal hacia la **derecha** en el escenario (pointer, `touchAction: pan-y`): la hoja sigue el dedo (cap **260 px**); commit **>70 px** y `|Δy| < 90` → salida **+92 % ancho**, **170 ms**, `router.replace(backHref)`.
   - Intención horizontal vs vertical con `swipeIntentRef` (no compite con scroll). Vibración al confirmar: `hapticSwipeCommit`. No compite con swipe abajo del `StudySheet`.

## Archivos de referencia

| Qué | Dónde |
|-----|--------|
| Delay FAB → sheet | `lib/fab-open-delay.ts`, `fab-expand-menu.tsx`, `fab-action-button.tsx` |
| Sheet simple | `components/study/study-sheet.tsx` |
| Navegación adelante (tap + swipe ←) | `lib/nav-motion.ts`, `lib/nav-panel-context.tsx`, `lib/use-nav-item-forward-swipe.ts`, `lib/navigate-forward.ts`, `entity-card.tsx` |
| Entrada detalle + swipe atrás | `lib/use-nav-detail-gestures.ts`, `lib/nav-transition.ts`, `components/study/app-shell.tsx` |
| Menú contextual card hijo | `entity-card-with-quick-actions.tsx`, `child-context-menu.tsx` |
| Preview link curso/clase | `components/study/external-link-preview.tsx`, `app/api/link-preview` |
| Fade velo | `app/globals.css` → `.sheet-backdrop-enter` |
| Alta de hijos sin rutas `/nuevo` | ADR 003 reglas 4–7 |

## Consecuencias

- Nuevas “animaciones” deben diseñarse con esta lista **antes** de implementar slide/keyframes.
- Si el dueño pide slide en móvil: avisar costo/riesgo y proponer primero delay + `active` + fade de velo.
- IA y humanos: leer este ADR al tocar FAB, sheets o modales.
