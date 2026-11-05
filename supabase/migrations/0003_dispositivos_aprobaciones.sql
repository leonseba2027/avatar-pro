-- =====================================================================
-- Avatar Pro — Etapa 4: dispositivos, aprobaciones y tiempo real
-- Ejecutar en Supabase → SQL Editor → New query → pegar → Run
-- =====================================================================

-- ---------- Preferencias de cuenta (cambiarlas requiere aprobación) ----------
alter table public.perfiles add column if not exists modelo_ia text not null default 'opus'
  check (modelo_ia in ('opus', 'sonnet'));
alter table public.perfiles add column if not exists reanalisis_cada int not null default 5
  check (reanalisis_cada between 1 and 50);

-- ---------- Dispositivos: 1 fila por sesión iniciada ----------
create table if not exists public.dispositivos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null unique,
  nombre text not null,
  tipo text not null check (tipo in ('movil', 'tablet', 'escritorio')),
  ultima_conexion timestamptz not null default now(),
  revocado boolean not null default false,
  creado_at timestamptz not null default now()
);
create index if not exists dispositivos_user_idx on public.dispositivos(user_id, ultima_conexion desc);

-- ---------- Solicitudes de aprobación ----------
create table if not exists public.aprobaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  accion text not null check (accion in ('eliminar_servicio','eliminar_avatar','regenerar_avatar','publicar_encuesta','cambiar_configuracion')),
  detalle jsonb not null default '{}'::jsonb,
  descripcion text not null,
  solicitado_por uuid references public.dispositivos(id) on delete set null,
  solicitado_session uuid not null,
  resuelto_por uuid references public.dispositivos(id) on delete set null,
  estado text not null default 'pendiente' check (estado in ('pendiente','aprobada','rechazada','vencida','ejecutada','fallida')),
  via text check (via in ('dispositivo','codigo_email')),
  resultado text,
  vence_at timestamptz not null default now() + interval '15 minutes',
  creado_at timestamptz not null default now(),
  resuelto_at timestamptz
);
create index if not exists aprobaciones_user_idx on public.aprobaciones(user_id, creado_at desc);

alter table public.dispositivos enable row level security;
alter table public.aprobaciones enable row level security;

drop policy if exists "dispositivos propios" on public.dispositivos;
create policy "dispositivos propios" on public.dispositivos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "aprobaciones propias: ver" on public.aprobaciones;
create policy "aprobaciones propias: ver" on public.aprobaciones
  for select using (auth.uid() = user_id);
drop policy if exists "aprobaciones propias: crear" on public.aprobaciones;
create policy "aprobaciones propias: crear" on public.aprobaciones
  for insert with check (auth.uid() = user_id and estado = 'pendiente');
drop policy if exists "aprobaciones propias: resolver" on public.aprobaciones;
create policy "aprobaciones propias: resolver" on public.aprobaciones
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Desconectar un dispositivo = borrar su sesión (invalida el refresh token) ----------
create or replace function public.desconectar_sesion(p_session uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not exists (select 1 from public.dispositivos where session_id = p_session and user_id = auth.uid()) then
    raise exception 'Dispositivo no encontrado';
  end if;
  update public.dispositivos set revocado = true where session_id = p_session and user_id = auth.uid();
  delete from auth.sessions where id = p_session and user_id = auth.uid();
end $$;
revoke all on function public.desconectar_sesion(uuid) from public, anon;
grant execute on function public.desconectar_sesion(uuid) to authenticated;

-- ---------- Tiempo real: estas tablas avisan cambios a los dispositivos ----------
do $$
declare t text;
begin
  foreach t in array array['servicios','avatares','fuentes_datos','aprobaciones','dispositivos'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------- Borra la sesión temporal creada al verificar un código por email ----------
create or replace function public.borrar_sesion_temporal(p_session uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if exists (select 1 from public.dispositivos where session_id = p_session) then
    raise exception 'No es una sesión temporal';
  end if;
  delete from auth.sessions where id = p_session and user_id = auth.uid();
end $$;
revoke all on function public.borrar_sesion_temporal(uuid) from public, anon;
grant execute on function public.borrar_sesion_temporal(uuid) to authenticated;

-- ---------- Solo cuentan los dispositivos cuya sesión sigue viva ----------
create or replace function public.mis_dispositivos_activos()
returns table (id uuid, session_id uuid, nombre text, tipo text, ultima_conexion timestamptz, creado_at timestamptz)
language plpgsql security definer set search_path = public, auth as $$
begin
  -- Marca como desconectados los que ya no tienen sesión (cerraron sesión o venció)
  update public.dispositivos d set revocado = true
   where d.user_id = auth.uid() and not d.revocado
     and not exists (select 1 from auth.sessions s where s.id = d.session_id and (s.not_after is null or s.not_after > now()));
  return query
    select d.id, d.session_id, d.nombre, d.tipo, d.ultima_conexion, d.creado_at
      from public.dispositivos d
     where d.user_id = auth.uid() and not d.revocado
     order by d.ultima_conexion desc;
end $$;
revoke all on function public.mis_dispositivos_activos() from public, anon;
grant execute on function public.mis_dispositivos_activos() to authenticated;
