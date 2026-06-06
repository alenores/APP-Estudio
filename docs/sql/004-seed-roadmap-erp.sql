-- APP Estudio — seed roadmap ERP en mapa_nodos / mapa_enlaces
-- Ejecutar en Supabase SQL Editor (sesión autenticada o service role).
--
-- ⚠️ BORRA todos los nodos y enlaces del mapa (CASCADE en enlaces).
-- Requiere al menos un user_id en `temas` (usuario con datos de estudio).
--
-- Posiciones alineadas con lib/mapa-layout.ts:
--   pos_x = 48 + etapa * 280
--   pos_y = 48 + carril * 120
--
-- Objetivos visuales (etapa → objetivo_id): ver lib/mapa-objetivo.ts
--   0–8 → 1 | 9 → 2 | 10 → 3

-- ---------------------------------------------------------------------------
-- Limpieza
-- ---------------------------------------------------------------------------

delete from public.mapa_enlaces;
delete from public.mapa_nodos;

-- ---------------------------------------------------------------------------
-- Nodos
-- ---------------------------------------------------------------------------

do $$
declare
  v_user_id uuid;
begin
  select user_id into v_user_id from public.temas limit 1;
  if v_user_id is null then
    raise exception 'No hay user_id en temas. Creá al menos un tema antes del seed.';
  end if;

  create temp table _mapa_seed (
    titulo text primary key,
    descripcion text,
    etapa integer not null,
    carril integer not null
  ) on commit drop;

  insert into _mapa_seed (titulo, descripcion, etapa, carril) values
    ('Visión Global', 'Ver el ciclo completo antes de aprender los detalles', 0, 2),
    ('HTML y CSS', 'Estructura visual y estilos de la interfaz del ERP', 1, 1),
    ('JavaScript Esencial', 'El lenguaje base que corre en navegador y servidor', 1, 3),
    ('Git y Control de Versiones', 'Nunca perder trabajo. Versionar el ERP desde el día uno', 1, 2),
    ('React', 'La base de la interfaz: componentes, estado, hooks', 2, 2),
    ('Next.js', 'El framework del ERP: routing, SSR, Server Components', 3, 2),
    ('Supabase y Autenticación', 'Base de datos real, CRUD, RLS, login y roles de usuarios', 4, 2),
    ('Compras y Ventas', 'Módulos transaccionales: el corazón operativo del ERP', 5, 2),
    ('Finanzas', 'Registro y control del flujo financiero del ERP', 6, 2),
    ('Reportes y Dashboard', 'Extraer valor de los datos. Queries, gráficos, exportación', 7, 2),
    ('Producción y Primer Cliente', 'Deploy en Vercel, multi-tenancy, seguridad, monitoreo', 8, 2),
    ('Backend con Node.js', 'Servidor propio, Express, APIs REST, PostgreSQL directo', 9, 1),
    ('Testing y Arquitectura', 'Pruebas formales, clean architecture, patrones de diseño', 9, 3),
    ('Seguridad Avanzada', 'OWASP, criptografía, auditorías de seguridad', 9, 2),
    ('Infraestructura y CI/CD', 'Docker, GitHub Actions, deploy en cloud, escala', 10, 2);

  insert into public.mapa_nodos (
    user_id, titulo, descripcion, etapa, carril, pos_x, pos_y
  )
  select
    v_user_id,
    s.titulo,
    s.descripcion,
    s.etapa,
    s.carril,
    48 + s.etapa * 280,
    48 + s.carril * 120
  from _mapa_seed s;

  -- ---------------------------------------------------------------------------
  -- Enlaces (prerequisito)
  -- ---------------------------------------------------------------------------

  insert into public.mapa_enlaces (user_id, origen_id, destino_id, tipo)
  select v_user_id, o.id, d.id, 'prerequisito'
  from (values
    ('Visión Global', 'HTML y CSS'),
    ('Visión Global', 'JavaScript Esencial'),
    ('Visión Global', 'Git y Control de Versiones'),
    ('HTML y CSS', 'React'),
    ('JavaScript Esencial', 'React'),
    ('Git y Control de Versiones', 'React'),
    ('React', 'Next.js'),
    ('Next.js', 'Supabase y Autenticación'),
    ('Supabase y Autenticación', 'Compras y Ventas'),
    ('Compras y Ventas', 'Finanzas'),
    ('Finanzas', 'Reportes y Dashboard'),
    ('Reportes y Dashboard', 'Producción y Primer Cliente'),
    ('Producción y Primer Cliente', 'Backend con Node.js'),
    ('Producción y Primer Cliente', 'Testing y Arquitectura'),
    ('Producción y Primer Cliente', 'Seguridad Avanzada'),
    ('Backend con Node.js', 'Infraestructura y CI/CD'),
    ('Testing y Arquitectura', 'Infraestructura y CI/CD'),
    ('Seguridad Avanzada', 'Infraestructura y CI/CD')
  ) as e(origen_titulo, destino_titulo)
  join public.mapa_nodos o on o.titulo = e.origen_titulo and o.user_id = v_user_id
  join public.mapa_nodos d on d.titulo = e.destino_titulo and d.user_id = v_user_id;

end $$;
