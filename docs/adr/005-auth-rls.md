# ADR 005: Supabase Auth y RLS

## Estado

Aceptado — 2026-06-03

## Contexto

La app se despliega en internet (Vercel) pero la usa **un solo usuario**. Se incorpora Auth desde v1 para practicar RLS real y no depender de políticas `anon` permisivas.

## Decisiones

1. **Supabase Auth** obligatorio para leer/escribir datos de negocio (`temas`, `cursos`, `clases`, `seguimientos`).
2. **Un usuario:** crear la cuenta en el dashboard de Supabase; deshabilitar registro público en *Authentication → Providers* si no se quiere que otros se registren.
3. **Login en la app:** pantalla mínima (magic link o email/contraseña); sesión con cliente Supabase en el navegador (`@supabase/ssr` cuando se implemente).
4. **`user_id`** en cada fila de negocio = `auth.uid()` al insertar; RLS: solo filas donde `user_id = auth.uid()`.
5. **Rol `anon`:** sin políticas de lectura/escritura sobre tablas de negocio (el ping de salud puede seguir usando endpoints que no expongan datos).
6. **`service_role`:** nunca en código cliente.

## Configuración en Supabase (manual)

1. *Authentication* → crear usuario (tu email).
2. Opcional: desactivar *Enable sign ups* para el proveedor elegido.
3. *SQL Editor* → ejecutar `docs/sql/001-schema-estudio.sql`.
4. Verificar en *Table Editor* que RLS está activo en las cuatro tablas.
5. *Authentication → URL Configuration*: añadir redirect `http://localhost:3000/auth/callback` y la URL de producción (`https://tu-dominio.vercel.app/auth/callback`).

## Vercel vs Supabase (seguridad)

| Capa | Qué protege | Uso en APP Estudio |
|------|-------------|-------------------|
| **Supabase RLS** | Filas de negocio por `auth.uid()` | Obligatorio; único muro de datos |
| **Middleware Next.js** | Rutas `/temas`, `/cursos`, etc. sin sesión | UX; redirige a login |
| **Vercel Authentication** | Ver el HTML del deploy sin ser miembro del equipo Vercel | **Desactivado en Production** — impide instalación PWA (401 en manifest/íconos/SW). Ver [ADR 004](004-pwa-install-standalone.md) y [checklist PWA](../pwa-arranque-checklist.md) |

La app puede ser **pública en Vercel** y **privada en datos** gracias a RLS. No confundir «ocultar el sitio con login Vercel» con «proteger la base».

## Consecuencias

- Toda query/mutación de negocio requiere sesión autenticada; la UI debe manejar “no logueado” (redirigir a login).
- Implementación de auth en Next.js → actualizar `lib/supabase.ts` y rutas en fase siguiente; hasta entonces la home puede seguir mostrando ping sin datos de tablas.
