# ADR 000: Cómo trabajamos

## Estado

Aceptado — 2026-06-03

## Contexto

Proyecto personal para gestionar el estudio en Platzi. Un solo desarrollador/usuario, desarrollo asistido por IA (Cursor), y documentación que evite decisiones implícitas o código “adivinatorio”.

## Decisiones

1. **Qué vs cómo:** el dueño describe funcionalidad, tablas, validaciones y límites; la IA implementa salvo que viole un ADR o documentación oficial (Next, React, Supabase).
2. **Desacuerdo:** si un pedido contradice ADR o buenas prácticas (aliases de columnas, `service_role` en cliente, CSS obsoleto), la IA debe **avisar** y proponer alternativa alineada.
3. **Comentarios:** solo en lógica no obvia; si el usuario pide **modo aprendizaje**, comentarios didácticos en código nuevo.
4. **Auth:** sin Supabase Auth en v1 (un solo usuario). La `publishable`/`anon` key en cliente es aceptable para uso personal; al publicar en internet, revisar RLS y Server Actions (ver ADR 002).
5. **Referencia:** patrones PWA tomados de *Vías de Escalada Córdoba*; **no** copiar el módulo offline de negocio de ese proyecto.

## Consecuencias

- Toda feature nueva debe poder justificarse contra ADR 001–004.
- Cambios de reglas de negocio → actualizar el ADR correspondiente en el mismo cambio.
