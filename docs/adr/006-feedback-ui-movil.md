# ADR 006: Feedback visual en móvil (Android / PWA)

## Estado

Aceptado — 2026-06-03

## Contexto

APP Estudio es **móvil-first** (PWA en Chrome Android). En desarrollo, las animaciones CSS y la emulación de dispositivo en **PC suelen verse bien**; en el **teléfono real** muchas no se ejecutan (el UI salta de estado inicial a final al instante). Se perdió tiempo probando keyframes, `transition`, doble `requestAnimationFrame`, Web Animations API y DOM “retenido” en el FAB y en `StudySheet` — con riesgo de **UI trabada** (capas con `pointer-events-none`, `transform` colgado, `overflow: hidden` en `body`).

Este ADR fija el **patrón que sí funciona** para futuras features con “animación” o sensación de respuesta al toque.

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

## Archivos de referencia

| Qué | Dónde |
|-----|--------|
| Delay FAB → sheet | `lib/fab-open-delay.ts`, `fab-expand-menu.tsx`, `fab-action-button.tsx` |
| Sheet simple | `components/study/study-sheet.tsx` |
| Fade velo | `app/globals.css` → `.sheet-backdrop-enter` |
| Alta de hijos sin rutas `/nuevo` | ADR 003 reglas 4–7 |

## Consecuencias

- Nuevas “animaciones” deben diseñarse con esta lista **antes** de implementar slide/keyframes.
- Si el dueño pide slide en móvil: avisar costo/riesgo y proponer primero delay + `active` + fade de velo.
- IA y humanos: leer este ADR al tocar FAB, sheets o modales.
