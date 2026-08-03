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

### 7. Portada del material externo

El link del ítem se presenta como **portada del video**, no como botón: tarjeta
16:9 en el detalle y miniatura de 64 px en la card del listado. Tocarla abre el
link en otra pestaña, igual que antes.

**YouTube se resuelve en el cliente.** `youtubeVideoIdFromUrl` y
`youtubeThumbnailUrl` (`lib/link-preview.ts`) son puras: la miniatura sale del
id del video sin pedirle nada a `/api/link-preview`. Solo Platzi y otros
dominios pagan el round-trip, que sigue siendo el mismo endpoint que usa
académico.

**Caché a nivel módulo** en `lib/academico-lite-preview.ts`, compartida entre
montajes, con dedup de pedidos en curso. Sin ella habría un pedido por card,
repetido al filtrar, cambiar de pestaña o cerrar el detalle; el preset `apis`
del service worker guarda solo 16 entradas y no alcanza. Los negativos de
origen HTTP se cachean; los fallos de red **no**, para poder reintentar.

**El fallback es el botón, no el favicon.** Sin conexión, sin `og:image` o con
la imagen rota (`onError`), vuelve el botón verde de siempre. La pantalla nunca
pierde el acceso al material — es la diferencia principal con
`ExternalLinkPreview`, que cae a un favicon.

El componente marca los links ya intentados: un fallo de red no escribe en la
caché, así que sin esa marca el skeleton quedaría girando para siempre.

**El ancho de la miniatura es una decisión medida.** Cada píxel se lo saca a la
columna de texto y parte títulos y badges en más líneas. Con 84 px el alto total
del listado subía fuerte y tres cards partían los badges en dos líneas; con
64 px el costo es **+3,4 %** de alto total y el mismo alto máximo de card que
antes. No agrandar sin volver a medir.

`ExternalLinkPreview` y el modo académico **no se tocan**: sus estilos son del
tema claro y su fallback es otro.

### 8. Lenguaje visual propio, aislado

Todo el CSS vive bajo `.lite-root` en `app/globals.css`, con prefijo de
variables `--lt-*`. No redefine `--paper`, `--td-*` ni `--ds-*`: las pantallas
existentes no cambian de aspecto.

Tokens: fondo `#08090b`, superficie `#14181d`, hairlines en `rgba(255,255,255,
.07)`, texto `#f4f6f8` / `#a3adba` / `#6d7784`, acento único verde `#3ee08f`.
Colores de estado propios (gris / celeste / ámbar / verde). Radios 18–24 px,
tipografía Inter con `letter-spacing` negativo en títulos.

`app/page.tsx` adopta el mismo lenguaje — es la pantalla donde vive la entrada
nueva y quedaba incoherente mantener el estilo viejo al lado.

### 9. Animaciones — ADR 006 sigue mandando

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
| Portada del material | `lib/academico-lite-preview.ts`, `components/lite/lite-link-preview.tsx` |
| Sistema visual | `app/globals.css` → bloque `.lite-root` |
