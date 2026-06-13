-- link_chat: URL de conversación IA (ChatGPT, Claude, Gemini, etc.)
-- Tablas estudio + mapa + desarrollos (ADR 002).

alter table public.temas
  add column if not exists link_chat text;

alter table public.nodos_objetivos
  add column if not exists link_chat text;

alter table public.cursos
  add column if not exists link_chat text;

alter table public.clases
  add column if not exists link_chat text;

alter table public.definicion_general
  add column if not exists link_chat text;

alter table public.definicion_especifica
  add column if not exists link_chat text;

alter table public.acciones
  add column if not exists link_chat text;
