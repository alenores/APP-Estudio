# ADR 012: Académico lite

## Estado

Aceptado — 2026-08-02

## Contexto

La tipología **académico** (ADR 002) resuelve la gestión: seguimiento con
porcentajes, tiempos, niveles de entendimiento, fechas estimadas, métricas de
riesgo, mapa de conocimiento. Es la pantalla correcta para planificar, pero
demasiado densa para el momento en que el usuario **solo quiere estudiar**:
abrir un curso, ver sus clases, entrar al video o al documento y marcar el
estado.

Se suma entonces una tercera entrada en `/` — **académico lite** — que **no es
una tipología de datos nueva**: usa exactamente las mismas tablas de la serie
académico. Es una **vista alternativa**, más liviana, sobre el mismo snapshot.

Además, el diseño existente (papel claro, tonos por entidad, cards con franjas
y velocímetros) se consideró agotado para esta pantalla. Lite estrena un
lenguaje visual propio: oscuro, minimalista, tipografía apretada, acento único.

## Decisión

### 1. Tercera tipología en el selector, mismo stack de datos

`ContentTypology` pasa a ser `"academico" | "academico_lite" | "desarrollos"`
(`lib/content-typology.ts`). `academico_lite` **comparte** snapshot, provider y
tablas con `academico`:

| | Tablas | Snapshot | Provider |
|---|---|---|---|
| `academico` | ADR 002 | `app-estudio-offline-cache-v1` | `EstudioDataProvider` |
| `academico_lite` | **las mismas** | **el mismo** | **el mismo** |
| `desarrollos` | ADR 011 | `app-estudio-desarrollos-cache-v1` | `DesarrollosDataProvider` |

No hay tablas, columnas, migraciones ni digest nuevos. Cambiar de académico a
lite y volver no re-descarga nada.

### 2. Ruta única para los dos shells

`/lite` — **no** entra en `MOBILE_SHELL_PREFIXES` ni en los prefijos de
escritorio, así que el middleware de shell (ADR 008) no la redirige: se ve igual
en móvil y en PC, con el contenido centrado a 640 px. Sí está protegida por
auth (`PROTECTED_ACADEMICO_PREFIXES`).

### 3. Dos listados filtrables

Pestañas **Temas** y **Cursos**. Los cursos se listan **planos** (todos, con el
tema como breadcrumb), no anidados: el objetivo es encontrar material rápido.

Filtros combinables en AND, cada uno multiselección en OR
(`lib/academico-lite-filtros.ts`): texto (nombre + descripción + padre, sin
acentos), estado (los cuatro de `lib/estado-ui.ts` + *sin registro*), material
(YouTube / Platzi / documento / otro link) y tipo de estudio (solo en Cursos,
porque `temas` no tiene `tipo_estudio`).

### 4. Qué muestra una card — y qué no

Solo cuatro cosas: **nombre**, **ícono del material**, **etiqueta de estado** y
**tipo de estudio** (pantallazo, herramienta operativa, …). Más un riel de
progreso `hijos terminados / total` cuando el ítem tiene hijos.

**Prohibido en lite:** porcentaje de avance, tiempo consumido, tiempo faltante,
nivel de entendimiento, fechas estimadas, alertas, riesgo, comentarios de
seguimiento, gauges, donuts y timelines. Todo eso sigue viviendo en académico.

### 5. Detalle en la misma pantalla, con pila

Al tocar un ítem se abre un panel `fixed` sobre el listado — **sin cambio de
ruta**. Navegación en pila: tema → curso → clase; volver desanida un nivel,
cerrar vuelve al listado.

El detalle muestra descripción, y en pestañas: **hijos** (cursos o clases),
**contenido** (`clases.contenido_markdown`) y **conceptos**. **No** muestra el
historial ni el detalle de seguimientos.

### 6. Única escritura: el estado

Desde lite se puede crear **un solo** tipo de registro: un `seguimientos` con
`etiqueta_estado` y nada más (el resto de las columnas quedan `null`). Ninguna
otra alta ni edición — ni entidades, ni conceptos, ni el resto de los campos de
seguimiento.

Se usa `insertSeguimiento` de `lib/estudio-queries.ts` (regla de dimensión
única: exactamente uno de `tema_id` / `curso_id` / `clase_id`) y después
`refreshSnapshot()`, según ADR 003 regla 5.

### 7. Lenguaje visual propio, aislado

Todo el CSS vive bajo `.lite-root` en `app/globals.css`, con prefijo de
variables `--lt-*`. No redefine `--paper`, `--td-*` ni `--ds-*`: las pantallas
existentes no cambian de aspecto.

Tokens: fondo `#08090b`, superficie `#14181d`, hairlines en `rgba(255,255,255,
.07)`, texto `#f4f6f8` / `#a3adba` / `#6d7784`, acento único verde `#3ee08f`.
Colores de estado propios (gris / celeste / ámbar / verde). Radios 18–24 px,
tipografía Inter con `letter-spacing` negativo en títulos.

`app/page.tsx` adopta el mismo lenguaje — es la pantalla donde vive la entrada
nueva y quedaba incoherente mantener el estilo viejo al lado.

### 8. Animaciones — ADR 006 sigue mandando

El panel de detalle y el sheet de estado **aparecen instantáneos**: nada de
`translateY` animado al montar. El feedback vive en el control tocado
(`active:scale-*`) y el velo del sheet reusa `.sheet-backdrop-enter`. Las
únicas transiciones son de estado sobre elementos ya montados (pulgar del
control segmentado, hover de cards), con `prefers-reduced-motion` cubierto.

## Consecuencias

- Un cambio de schema en la serie académico impacta lite: revisar
  `lib/academico-lite-read.ts` junto con ADR 002.
- Lite es **de consumo**. Todo pedido de "agregar un dato de seguimiento" a esta
  pantalla contradice §6: se resuelve en académico, no acá.
- El lenguaje `--lt-*` es el candidato natural si en el futuro se rediseñan
  otras pantallas; hoy su alcance es `/` y `/lite`.

## Archivos clave

| Qué | Dónde |
|-----|--------|
| Tipología | `lib/content-typology.ts` |
| Proyección del snapshot | `lib/academico-lite-read.ts` |
| Medio (video / documento) | `lib/academico-lite-media.ts` |
| Filtros puros | `lib/academico-lite-filtros.ts` |
| Hook + alta de estado | `app/hooks/useAcademicoLite.ts` |
| Pantalla | `app/lite/page.tsx`, `components/lite/lite-view.tsx` |
| Detalle en pila | `components/lite/lite-detalle-panel.tsx` |
| Sheet de estado | `components/lite/lite-estado-sheet.tsx` |
| Sistema visual | `app/globals.css` → bloque `.lite-root` |
