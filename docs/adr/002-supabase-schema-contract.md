# ADR 002: Contrato de schema Supabase

## Estado

Aceptado — 2026-06-03 (fase 2 — tablas definidas; ids numéricos 2026-06-03)

## Contexto

La app consume una base Supabase controlada por el dueño del proyecto. No se admiten heurísticas de nombres (`id_curso` vs `curso_id`, tablas alternativas, etc.).

Script de creación: [`docs/sql/001-schema-estudio.sql`](../sql/001-schema-estudio.sql). Auth y RLS: [ADR 005](005-auth-rls.md).

## Decisión

Usar **nombres exactos** de tablas y columnas documentados abajo. Sin aliases, sin fallbacks legacy.

### Tablas

| Entidad | Tabla Supabase | Padre |
|---------|----------------|-------|
| Tema | `temas` | — |
| Curso | `cursos` | `tema_id` → `temas.id` |
| Clase | `clases` | `curso_id` → `cursos.id` |
| Seguimiento | `seguimientos` | exactamente uno: `tema_id` \| `curso_id` \| `clase_id` |
| Concepto | `conceptos` | exactamente uno: `tema_id` \| `curso_id` \| `clase_id` |
| Enlace entre temas | `enlaces_temas` | `origen_id` / `destino_id` → `temas.id` (lienzo PC futuro) |

Todas incluyen `id` (`bigint` PK autoincremental), `user_id` (`uuid` FK `auth.users`), `created_at`.

En el frontend: `id` y FKs de negocio (`tema_id`, `curso_id`, `clase_id`) son `number` en TypeScript; los segmentos de URL se parsean con `lib/parse-entity-id.ts`. `user_id` sigue siendo `string` (uuid).

`ON DELETE CASCADE`: borrar tema elimina cursos, clases, seguimientos y conceptos en cadena; borrar curso elimina clases y sus seguimientos/conceptos.

### Columnas por tabla

#### `temas` (solo almacenadas)

| Columna | Tipo | Notas |
|---------|------|-------|
| `nombre` | text | not null |
| `descripcion` | text | |
| `orden` | integer | not null, default 0 — orden de aparición en UI |
| `jerarquia` | integer | not null, default 0 — desempate / agrupación visual |
| `fecha_estimada_inicio` | date | |
| `fecha_estimada_fin` | date | |

#### `enlaces_temas` (grafo entre temas — lienzo PC futuro)

Script: `docs/sql/006-schema-enlaces-temas.sql`. Misma semántica de `tipo` que `enlaces_nodos`.

| Columna | Tipo | Notas |
|---------|------|-------|
| `origen_id` | bigint | not null, FK → `temas.id` ON DELETE CASCADE |
| `destino_id` | bigint | not null, FK → `temas.id` ON DELETE CASCADE |
| `tipo` | text | nullable; `prerequisito` \| `continuacion` \| `refuerzo` \| `paralelo` |

Constraints: `origen_id <> destino_id`; `unique (origen_id, destino_id)`. RLS own-row (`user_id = auth.uid()`).

**Nota:** posición en lienzo (`pos_x` / `pos_y` o `etapa` / `carril`) para temas no está en esta tabla; se añadirá en la fase de visualización (ADR 009 fase 9).

#### `cursos` (solo almacenadas)

| Columna | Tipo | Notas |
|---------|------|-------|
| `tema_id` | bigint | not null, FK |
| `nombre` | text | not null |
| `descripcion` | text | |
| `orden` | integer | not null, default 0 |
| `jerarquia` | integer | not null, default 0 |
| `fecha_estimada_inicio` | date | |
| `fecha_estimada_fin` | date | |
| `plataforma` | text | libre (ej. Platzi) |
| `link` | text | URL del curso |
| `nodo_id` | bigint | not null, FK → `nodos_objetivos.id` (roadmap; ver ADR 009 fase 8) |

No hay columna `estado` en `cursos`: ver campos derivados.

#### `nodos_objetivos` (grafo mapa PC + padre de cursos)

Tabla `nodos_objetivos` (antes `mapa_nodos`). Script: `docs/sql/005-schema-nodos-objetivos.sql`.

| Columna | Tipo | Notas |
|---------|------|-------|
| `titulo` | text | not null |
| `descripcion` | text | |
| `pos_x`, `pos_y` | float | lienzo React Flow |
| `carril`, `etapa` | integer | layout timeline |
| `orden` | integer | orden en explorador PC |
| `tipo` | text | ej. `dominio` |
| `objetivo_id` | bigint | FK → `objetivos.id` |
| `user_id` | uuid | RLS |

#### `enlaces_nodos` (antes `mapa_enlaces`)

FK `origen_id` / `destino_id` → `nodos_objetivos.id`.

#### `objetivos` (catálogo roadmap — mapa PC)

| Columna | Tipo | Notas |
|---------|------|-------|
| `nombre` | text | not null |
| `descripcion` | text | |
| `orden` | integer | not null, default 0 |

Sin `user_id` (referencia global). Script: `docs/sql/003-schema-objetivos.sql`. Color en mapa y dot en cursos vía `nodos_objetivos.objetivo_id`.

#### `clases` (catálogo — sin progreso persistido)

| Columna | Tipo | Notas |
|---------|------|-------|
| `curso_id` | bigint | not null, FK |
| `nombre` | text | not null |
| `descripcion` | text | |
| `orden` | integer | not null, default 0 |
| `jerarquia` | integer | not null, default 0 |
| `dificultad` | text | dato fijo al crear/importar |
| `link` | text | URL de la clase (video, lección); miniatura en detalle vía `ExternalLinkPreview` |

Progreso (`porcentaje_avance`, `estado`, tiempos, `nivel_entendimiento`, `fecha_comienzo` efectiva, etc.) **no** se guarda en `clases`; sale de `seguimientos`.

#### `seguimientos` (misma tabla para tema, curso y clase)

| Columna | Tipo | Notas |
|---------|------|-------|
| `tema_id` | bigint | nullable; uno de tres con CHECK |
| `curso_id` | bigint | nullable |
| `clase_id` | bigint | nullable |
| `fecha_registro` | timestamptz | not null, default now() |
| `etiqueta_estado` | text | `sin empezar`, `en curso`, `pausado`, `terminado` (exactos, con espacio) |
| `porcentaje_avance` | numeric(5,2) | |
| `tiempo_consumido` | integer | minutos (convención UI) |
| `tiempo_faltante_estimado` | integer | minutos |
| `comentario` | text | |
| `fecha_alerta` | date | |
| `fecha_comienzo` | date | puede alimentar “fecha de comienzo” derivada del padre |
| `nivel_entendimiento` | text | escala **1–10** (string `"1"`…`"10"` en UI) |

Al insertar: rellenar `user_id = auth.uid()` y **solo** la FK de la dimensión activa.

**Formulario de alta (UI):** según la dimensión del padre, solo se ofrecen estos campos (el resto va `null` en insert):

| Dimensión | Campos en formulario |
|-----------|----------------------|
| Tema | `etiqueta_estado`, `tiempo_consumido`, `tiempo_faltante_estimado`, `fecha_alerta`, `fecha_comienzo`, `nivel_entendimiento` |
| Curso / clase | los de tema + `porcentaje_avance`, `tiempo_faltante_estimado` |

Implementación: `lib/seguimiento-form-scope.ts`, `seguimientoFormSchemaForScope` en `lib/validations.ts`.

#### `conceptos` (misma dimensión que seguimientos; sin progreso)

| Columna | Tipo | Notas |
|---------|------|-------|
| `tema_id` | bigint | nullable; uno de tres con CHECK |
| `curso_id` | bigint | nullable |
| `clase_id` | bigint | nullable |
| `fecha_registro` | timestamptz | not null, default now() |
| `titulo` | text | not null en UI (Zod) |
| `descripcion` | text | not null en UI (Zod) |
| `jerarquia` | integer | not null, default 0 — desempate / agrupación visual |

Al insertar: `user_id = auth.uid()` y **solo** la FK activa. No alimenta campos derivados del padre (eso sigue siendo solo `seguimientos`).

### Campos derivados (solo lectura en UI / `lib/`)

No se hace `UPDATE` al padre al guardar un seguimiento. La pantalla de detalle combina fila del padre + agregación sobre `seguimientos` del mismo `tema_id` / `curso_id` / `clase_id`.

| Mostrar en UI como | Regla (misma para tema, curso o clase según FK) |
|--------------------|--------------------------------------------------|
| Estado (etiqueta) | `etiqueta_estado` del seguimiento **más reciente** (`fecha_registro` DESC) que tenga valor en ese campo |
| Porcentaje de avance | **Suma** de `porcentaje_avance` en todos los seguimientos de la dimensión |
| Tiempo consumido | `tiempo_consumido` del seguimiento más reciente que tenga valor |
| Tiempo faltante estimado | `tiempo_faltante_estimado` del seguimiento más reciente que tenga valor |
| Nivel de entendimiento | `nivel_entendimiento` del seguimiento más reciente que tenga valor |
| Fecha de comienzo (efectiva) | **menor** `fecha_comienzo` no nula, ordenada por `fecha_registro` ascendente (primera vez que se registró comienzo) |

Cada campo escalar se resuelve **por separado**: no hace falta que el mismo registro aporte todos los valores ni que sea el de ID máximo.

Si no hay seguimientos, esos campos se muestran vacíos o con placeholder en UI.

Implementación prevista: funciones en `lib/` (ej. `lib/seguimiento-derivados.ts`), no columnas extra en tablas padre.

### Listados

- Temas: `ORDER BY orden ASC, jerarquia ASC, nombre ASC`
- Cursos de un tema: `WHERE tema_id = ?` + mismo orden
- Clases de un curso: `WHERE curso_id = ?` + mismo orden
- Seguimientos de una dimensión: `ORDER BY fecha_registro DESC`
- Conceptos de una dimensión: `ORDER BY fecha_registro DESC`

### Mapeo al frontend

Tipos TypeScript en `app/types/` cuando existan; nombres iguales a columnas. Validación Zod en `lib/validations.ts` al implementar formularios.

### Errores y respuestas vacías

Toda query o mutación a Supabase **puede fallar** (red, RLS, fila inexistente, validación). En `lib/` y `app/hooks/`:

- No asumir que siempre hay datos; manejar `error` de Supabase y estados vacíos de forma explícita.
- Exponer al UI estados claros (cargando, error, sin datos) en lugar de fallar en silencio.
- Si no se conoce el nombre exacto de tabla o columna, **preguntar o actualizar este ADR** antes de escribir la query (no inventar variantes).

### Fuera de alcance en este ADR

- Importador masivo de clases (cuando columnas y UX estén cerrados al 100 %).

## Consecuencias

- Toda query/mutación debe alinearse con este documento antes de merge.
- Cambios en Supabase → actualizar este ADR y, si aplica, el SQL en `docs/sql/` el mismo día.
