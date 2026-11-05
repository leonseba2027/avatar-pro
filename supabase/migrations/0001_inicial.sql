-- =====================================================================
-- Avatar Pro — Etapa 1: perfiles, consentimientos, servicios y registro
-- Ejecutar en Supabase → SQL Editor → New query → pegar → Run
-- =====================================================================

-- ---------- Perfiles (1 por usuario de auth.users) ----------
create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  -- Consentimientos (Ley 25.326): fecha y versión del texto aceptado
  acepto_terminos_at timestamptz,
  acepto_transferencia_at timestamptz,
  acepto_comunicaciones_at timestamptz,   -- opcional, revocable
  version_textos_legales text,
  creado_at timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

-- ---------- Servicios ----------
create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 60),
  descripcion text check (char_length(descripcion) <= 300),
  color text not null default '#4338ca' check (color ~ '^#[0-9a-fA-F]{6}$'),
  icono text not null default 'sparkles',
  orden int not null default 0,
  creado_at timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);
create index if not exists servicios_user_idx on public.servicios(user_id, orden);

-- ---------- Registro de actividad (seguridad / auditoría) ----------
create table if not exists public.registro_actividad (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  accion text not null,
  detalle jsonb not null default '{}'::jsonb,
  dispositivo text,
  creado_at timestamptz not null default now()
);
create index if not exists registro_user_idx on public.registro_actividad(user_id, creado_at desc);

-- ---------- Row Level Security: cada usuario ve solo lo suyo ----------
alter table public.perfiles enable row level security;
alter table public.servicios enable row level security;
alter table public.registro_actividad enable row level security;

drop policy if exists "perfil propio: ver" on public.perfiles;
create policy "perfil propio: ver" on public.perfiles
  for select using (auth.uid() = id);
drop policy if exists "perfil propio: editar" on public.perfiles;
create policy "perfil propio: editar" on public.perfiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "servicios propios" on public.servicios;
create policy "servicios propios" on public.servicios
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- El registro solo se puede leer e insertar (nunca editar ni borrar desde la app)
drop policy if exists "registro propio: ver" on public.registro_actividad;
create policy "registro propio: ver" on public.registro_actividad
  for select using (auth.uid() = user_id);
drop policy if exists "registro propio: insertar" on public.registro_actividad;
create policy "registro propio: insertar" on public.registro_actividad
  for insert with check (auth.uid() = user_id);

-- ---------- Fecha de actualización automática ----------
create or replace function public.tocar_actualizado() returns trigger
language plpgsql as $$
begin new.actualizado_at = now(); return new; end $$;

drop trigger if exists perfiles_tocar on public.perfiles;
create trigger perfiles_tocar before update on public.perfiles
  for each row execute function public.tocar_actualizado();
drop trigger if exists servicios_tocar on public.servicios;
create trigger servicios_tocar before update on public.servicios
  for each row execute function public.tocar_actualizado();

-- ---------- Alta de usuario: crea perfil + 6 servicios iniciales ----------
create or replace function public.nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.perfiles (id, nombre, acepto_terminos_at, acepto_transferencia_at,
                               acepto_comunicaciones_at, version_textos_legales)
  values (
    new.id,
    coalesce(meta->>'nombre', meta->>'full_name'),
    case when (meta->>'acepto_terminos')::boolean then now() end,
    case when (meta->>'acepto_transferencia')::boolean then now() end,
    case when (meta->>'acepto_comunicaciones')::boolean then now() end,
    meta->>'version_textos_legales'
  );

  insert into public.servicios (user_id, nombre, color, icono, orden) values
    (new.id, 'Coaching',  '#7c3aed', 'sparkles',       1),
    (new.id, 'Mentoría',  '#0369a1', 'graduation-cap', 2),
    (new.id, 'Liderazgo', '#b45309', 'crown',          3),
    (new.id, 'Ventas',    '#047857', 'handshake',      4),
    (new.id, 'Marketing', '#be185d', 'megaphone',      5),
    (new.id, 'SEO',       '#4338ca', 'search',         6);
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.nuevo_usuario();
