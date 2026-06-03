# APP Estudio

PWA personal para gestionar el estudio en [Platzi](https://platzi.com). Stack: **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, **Supabase**, **next-pwa**.

## Idea central

- **Personal y educativo:** un solo usuario, sin fin comercial; si la app falla, el estudio sigue (ver [ADR 000](docs/adr/000-como-trabajamos.md)).
- **Online-first:** los datos viven en Supabase (sin paquete offline de tablas).
- **Instalable** en el celular con ícono **APP Estudio** (ver ADR 004).
- **Fase actual:** PWA + schema documentado (ADR 002/005). Ejecutar SQL en Supabase, auth y pantallas tema/curso/clase → en curso.

## Documentación

| ADR | Tema |
|-----|------|
| [000](docs/adr/000-como-trabajamos.md) | Cómo trabajamos con IA |
| [001](docs/adr/001-online-first-sin-paquete-offline.md) | Online-first |
| [002](docs/adr/002-supabase-schema-contract.md) | Schema Supabase (borrador) |
| [003](docs/adr/003-frontend-layer-separation.md) | Capas frontend |
| [004](docs/adr/004-pwa-install-standalone.md) | Instalación PWA |
| [005](docs/adr/005-auth-rls.md) | Auth y RLS |

SQL inicial (Supabase): [`docs/sql/001-schema-estudio.sql`](docs/sql/001-schema-estudio.sql).

Agentes e IA: [`AGENTS.md`](AGENTS.md).

## Identidad visual

- Tema índigo (`#4f46e5`), fondo slate oscuro.
- Íconos: `npm run icons` (usa `design/app-icon-source.*` o genera uno por defecto).

## Desarrollo

```bash
npm install
cp .env.local.example .env.local   # si aún no existe
# Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run icons
npm run dev
```

- Tras el SQL inicial: entrá en `/login` con el usuario de Supabase (contraseña o magic link).
- Rutas de estudio: `/temas`, detalle `/temas/[id]`, alta seguimiento desde el botón **+**.

- Usa **webpack** (`--webpack`) por `next-pwa` en Next 16.
- PWA desactivada en dev.

## Probar PWA e instalación (producción local)

```bash
npm run build
npm start
```

Abrí `http://localhost:3000` en el celular (misma red) o en Chrome → Instalar app. En iPhone: Safari → Compartir → Agregar a inicio.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-id>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (Settings → API Keys) |

**No** commitear `.env.local`. **No** usar `service_role` en el cliente.

## Repositorio

https://github.com/alenores/APP-Estudio.git

## Seguridad (un solo usuario)

Sin login en v1. Si desplegás públicamente, activar RLS en Supabase y escribir vía Server Actions. Rotar keys si se filtraron.
