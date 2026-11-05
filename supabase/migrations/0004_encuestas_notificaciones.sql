-- =====================================================================
-- Avatar Pro — Etapa 5: encuesta pública y notificaciones push
-- Ejecutar en Supabase → SQL Editor → New query → pegar → Run
-- =====================================================================

-- ---------- Preferencias de avisos (cada tipo se activa o desactiva) ----------
alter table public.perfiles add column if not exists notif jsonb not null
  default '{"avatar": true, "encuesta": true, "aprobacion": true, "pocos_datos": true}'::jsonb;

-- ---------- Suscripciones Web Push (1 por dispositivo/navegador) ----------
create table if not exists public.push_suscripciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  creado_at timestamptz not null default now()
);
alter table public.push_suscripciones enable row level security;
drop policy if exists "suscripciones propias" on public.push_suscripciones;
create policy "suscripciones propias" on public.push_suscripciones
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Encuestas (1 por servicio) ----------
create table if not exists public.encuestas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  servicio_id uuid not null unique references public.servicios(id) on delete cascade,
  slug text not null unique default left(replace(gen_random_uuid()::text, '-', ''), 20),
  titulo text not null check (char_length(titulo) between 3 and 120),
  introduccion text check (char_length(introduccion) <= 600),
  preguntas jsonb not null default '[]'::jsonb,   -- preguntas abiertas: [{id, texto}]
  incluir_demografia boolean not null default true,
  publicada boolean not null default false,
  publicada_at timestamptz,
  respuestas_sin_analizar int not null default 0,
  creado_at timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);
alter table public.encuestas enable row level security;
drop policy if exists "encuestas propias" on public.encuestas;
create policy "encuestas propias" on public.encuestas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Publicar solo se hace desde el servidor tras una aprobación: el usuario no puede marcarla publicada directo
create or replace function public.proteger_publicacion() returns trigger
language plpgsql as $$
begin
  if current_user = 'authenticated' and new.publicada and (tg_op = 'INSERT' or not old.publicada) then
    raise exception 'Publicar la encuesta requiere aprobación';
  end if;
  return new;
end $$;
drop trigger if exists encuestas_publicacion on public.encuestas;
create trigger encuestas_publicacion before insert or update on public.encuestas
  for each row execute function public.proteger_publicacion();
drop trigger if exists encuestas_tocar on public.encuestas;
create trigger encuestas_tocar before update on public.encuestas
  for each row execute function public.tocar_actualizado();
drop trigger if exists encuestas_duenio on public.encuestas;
create trigger encuestas_duenio before insert or update on public.encuestas
  for each row execute function public.validar_duenio_servicio();

-- ---------- Respuestas (anónimas; las inserta solo el servidor) ----------
create table if not exists public.respuestas_encuesta (
  id uuid primary key default gen_random_uuid(),
  encuesta_id uuid not null references public.encuestas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  respuestas jsonb not null,
  fuente_id uuid references public.fuentes_datos(id) on delete cascade,
  huella text not null,          -- hash diario y con sal de la IP: solo para frenar spam, no identifica
  creado_at timestamptz not null default now()
);
create index if not exists respuestas_encuesta_idx on public.respuestas_encuesta(encuesta_id, creado_at desc);
create index if not exists respuestas_huella_idx on public.respuestas_encuesta(huella, creado_at desc);
alter table public.respuestas_encuesta enable row level security;
drop policy if exists "respuestas propias: ver" on public.respuestas_encuesta;
create policy "respuestas propias: ver" on public.respuestas_encuesta
  for select using (auth.uid() = user_id);
drop policy if exists "respuestas propias: borrar" on public.respuestas_encuesta;
create policy "respuestas propias: borrar" on public.respuestas_encuesta
  for delete using (auth.uid() = user_id);

-- Las respuestas viejas se borran a los 12 meses (minimización). Ver README: tarea programada.
create or replace function public.purgar_respuestas_viejas() returns int
language sql security definer set search_path = public as $$
  with b as (delete from public.respuestas_encuesta where creado_at < now() - interval '12 months' returning 1) select count(*)::int from b;
$$;
revoke all on function public.purgar_respuestas_viejas() from public, anon, authenticated;
grant execute on function public.purgar_respuestas_viejas() to service_role;

-- Contador atómico de respuestas sin analizar
create or replace function public.sumar_respuesta(p_encuesta uuid) returns int
language sql security definer set search_path = public as $$
  update public.encuestas set respuestas_sin_analizar = respuestas_sin_analizar + 1 where id = p_encuesta returning respuestas_sin_analizar;
$$;
revoke all on function public.sumar_respuesta(uuid) from public, anon, authenticated;
grant execute on function public.sumar_respuesta(uuid) to service_role;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'encuestas') then
    alter publication supabase_realtime add table public.encuestas;
  end if;
end $$;
