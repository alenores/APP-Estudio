# ADR 000: Cómo trabajamos

## Estado

Aceptado — 2026-06-03

## Contexto

Proyecto personal para gestionar el estudio en Platzi. **Un solo usuario** (el dueño): sin fin comercial, uso educativo y funcional para el día a día. No es un ERP ni producción multiusuario; si la app falla o queda desactualizada, el estudio en Platzi sigue igual — el riesgo material es bajo. El entregable que importa es **entender** lo que se construye, no solo que compile.

Desarrollo asistido por IA (Cursor) y documentación que evite decisiones implícitas o código “adivinatorio”.

## Decisiones

1. **Qué vs cómo:** el dueño describe funcionalidad, tablas, validaciones y límites; la IA implementa salvo que viole un ADR o documentación oficial (Next, React, Supabase).
2. **Desacuerdo:** si un pedido contradice ADR o buenas prácticas (aliases de columnas, `service_role` en cliente, CSS obsoleto), la IA debe **avisar** y proponer alternativa alineada.
3. **Comentarios:** solo en lógica no obvia; si el usuario pide **modo aprendizaje**, comentarios didácticos en código nuevo.
4. **Auth:** Supabase Auth desde v1 (un solo usuario en la práctica). Login simple; RLS por `user_id = auth.uid()` en tablas de negocio (ver [ADR 005](005-auth-rls.md) y [ADR 002](002-supabase-schema-contract.md)). Sin `service_role` en cliente.
5. **Referencia:** patrones PWA tomados de *Vías de Escalada Córdoba*; **no** copiar el módulo offline de negocio de ese proyecto. Nuevo deploy → [`docs/pwa-arranque-checklist.md`](../pwa-arranque-checklist.md).
6. **Reutilizar antes de crear:** antes de un archivo nuevo en `lib/`, `app/hooks/` o `components/`, revisar si ya existe hook, helper o componente reutilizable; extender en lugar de duplicar.
7. **Alcance mínimo (IA):** implementar **solo** lo pedido. Sin refactors, UX “mejorada” ni archivos tocados fuera del pedido. Si un bug apunta a otra capa (ej. íconos PWA vs botón install), **diagnosticar y proponer**; no cambiar `InstallPwaButton`, `lib/pwa-*` ni flujo ADR 004 sin pedido explícito del dueño (misma arquitectura que otras apps del repo).

## Consecuencias

- Toda feature nueva debe poder justificarse contra ADR 001–005.
- Cambios de reglas de negocio → actualizar el ADR correspondiente en el mismo cambio.
