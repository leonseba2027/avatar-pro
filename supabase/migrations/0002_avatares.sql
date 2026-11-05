-- =====================================================================
-- Avatar Pro — Etapa 2: avatares, versiones y fuentes de datos
-- Ejecutar en Supabase → SQL Editor → New query → pegar → Run
-- =====================================================================

-- ---------- Fuentes de datos (ya anonimizadas antes de guardarse) ----------
create table if not exists public.fuentes_datos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  servicio_id uuid not null references public.servicios(id) on delete cascade,
  tipo text not null check (tipo in ('comentario','mensaje','encuesta','nota_venta','testimonio','otro')),
  origen text not null check (origen in ('pegado','archivo','encuesta_publica')),
  nombre_archivo text,
  contenido text not null check (char_length(contenido) <= 200000),
  caracteres int not null,
  usada_en_version int,          -- null = todavía no analizada
  creado_at timestamptz not null default now()
);
create index if not exists fuentes_servicio_idx on public.fuentes_datos(servicio_id, creado_at desc);

-- ---------- Avatar actual (1 por servicio) ----------
create table if not exists public.avatares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  servicio_id uuid not null unique references public.servicios(id) on delete cascade,
  nombre_ficticio text not null,
  semilla_ilustracion int not null default floor(random() * 100000),
  version_actual int not null default 1,
  datos jsonb not null,
  confianza int not null default 0 check (confianza between 0 and 100),
  es_hipotesis boolean not null default true,
  creado_at timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

-- ---------- Historial de versiones ----------
create table if not exists public.avatar_versiones (
  id uuid primary key default gen_random_uuid(),
  avatar_id uuid not null references public.avatares(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version int not null,
  datos jsonb not null,
  cambios jsonb not null default '[]'::jsonb,
  confianza int not null,
  fuentes_analizadas int not null default 0,
  motivo text not null check (motivo in ('creacion','actualizacion','regeneracion','restauracion')),
  modelo text,
  creado_at timestamptz not null default now(),
  unique (avatar_id, version)
);

-- ---------- RLS ----------
alter table public.fuentes_datos enable row level security;
alter table public.avatares enable row level security;
alter table public.avatar_versiones enable row level security;

drop policy if exists "fuentes propias" on public.fuentes_datos;
create policy "fuentes propias" on public.fuentes_datos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "avatares propios" on public.avatares;
create policy "avatares propios" on public.avatares
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Las versiones son un historial: se leen e insertan, no se editan
drop policy if exists "versiones propias: ver" on public.avatar_versiones;
create policy "versiones propias: ver" on public.avatar_versiones
  for select using (auth.uid() = user_id);
drop policy if exists "versiones propias: insertar" on public.avatar_versiones;
create policy "versiones propias: insertar" on public.avatar_versiones
  for insert with check (auth.uid() = user_id);

drop trigger if exists avatares_tocar on public.avatares;
create trigger avatares_tocar before update on public.avatares
  for each row execute function public.tocar_actualizado();

-- Un servicio debe pertenecer al mismo usuario que la fuente / avatar
create or replace function public.validar_duenio_servicio() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.servicios s where s.id = new.servicio_id and s.user_id = new.user_id) then
    raise exception 'El servicio no pertenece al usuario';
  end if;
  return new;
end $$;

drop trigger if exists fuentes_duenio on public.fuentes_datos;
create trigger fuentes_duenio before insert or update on public.fuentes_datos
  for each row execute function public.validar_duenio_servicio();
drop trigger if exists avatares_duenio on public.avatares;
create trigger avatares_duenio before insert or update on public.avatares
  for each row execute function public.validar_duenio_servicio();
