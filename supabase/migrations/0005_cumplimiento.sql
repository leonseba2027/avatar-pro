-- =====================================================================
-- Avatar Pro — Etapa 6: cumplimiento legal
-- Ejecutar en Supabase → SQL Editor → New query → pegar → Run
-- =====================================================================

-- ---------- Trámites de consumidor: arrepentimiento y baja (Res. SCI 424/2020) ----------
-- No requieren cuenta: los crea solo el servidor. Los ve el titular desde /admin/tramites.
create table if not exists public.tramites_consumidor (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  tipo text not null check (tipo in ('arrepentimiento', 'baja')),
  email text not null check (char_length(email) <= 200),
  fecha_contratacion date,
  detalle text check (char_length(detalle) <= 1000),
  user_id uuid references auth.users(id) on delete set null,
  estado text not null default 'recibido' check (estado in ('recibido', 'en_proceso', 'resuelto')),
  huella text not null,
  creado_at timestamptz not null default now(),
  resuelto_at timestamptz
);
alter table public.tramites_consumidor enable row level security;
-- Sin políticas: ningún usuario puede leer ni escribir directo (solo el servidor con service_role)

-- ---------- Minimización: borrar registros de actividad de más de 24 meses ----------
create or replace function public.purgar_registros_viejos() returns int
language sql security definer set search_path = public as $$
  with b as (delete from public.registro_actividad where creado_at < now() - interval '24 months' returning 1) select count(*)::int from b;
$$;
revoke all on function public.purgar_registros_viejos() from public, anon, authenticated;
grant execute on function public.purgar_registros_viejos() to service_role;

-- ---------- Vencer solicitudes de aprobación viejas ----------
create or replace function public.vencer_aprobaciones() returns int
language sql security definer set search_path = public as $$
  with b as (update public.aprobaciones set estado = 'vencida', resuelto_at = now()
             where estado = 'pendiente' and vence_at < now() returning 1) select count(*)::int from b;
$$;
revoke all on function public.vencer_aprobaciones() from public, anon, authenticated;
grant execute on function public.vencer_aprobaciones() to service_role;

-- ---------- Mantenimiento diario (respuestas viejas + registros + aprobaciones) ----------
create or replace function public.mantenimiento_diario() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  return jsonb_build_object(
    'respuestas_borradas', public.purgar_respuestas_viejas(),
    'registros_borrados', public.purgar_registros_viejos(),
    'aprobaciones_vencidas', public.vencer_aprobaciones());
end $$;
revoke all on function public.mantenimiento_diario() from public, anon, authenticated;
grant execute on function public.mantenimiento_diario() to service_role;
