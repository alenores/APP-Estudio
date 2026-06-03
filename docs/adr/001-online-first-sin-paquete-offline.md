# ADR 001: Online-first (sin paquete offline de negocio)

## Estado

Aceptado — 2026-06-03

## Contexto

A diferencia de *Vías de Escalada Córdoba*, esta app **no** es un catálogo offline tipo PDF. Los datos viven en Supabase y requieren red para leer/escribir.

## Decisión

1. **Sin** snapshot local de tablas, IndexedDB de negocio, `downloadSnapshot`, ni sync MAX(id).
2. **Sin** ocultar UI de negocio según `navigator.onLine` (no hay paquete local de tablas).
3. **Supabase** es la fuente de verdad en línea; el cliente usa la API REST/JS con la publishable key.
4. **PWA / Service Worker:** solo shell de la app, assets estáticos y fallback de documento; **NetworkOnly** para `*.supabase.co` (ver `next.config.ts`).
5. **`/offline`:** página liviana cuando el SW no puede cargar el documento; **no** sustituye datos de negocio.

## Consecuencias

- Sin red: mensaje claro; no se simula CRUD offline.
- Caché del navegador/SW no reemplaza política de datos en Supabase.
