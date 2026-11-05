-- =====================================================================
-- Avatar Pro — Ajustes de seguridad recomendados por el asesor de Supabase
-- =====================================================================
-- Funciones de trigger: no deben poder llamarse por la API
revoke execute on function public.nuevo_usuario() from public, anon, authenticated;
revoke execute on function public.validar_duenio_servicio() from public, anon, authenticated;
revoke execute on function public.tocar_actualizado() from public, anon, authenticated;
revoke execute on function public.proteger_publicacion() from public, anon, authenticated;
-- search_path fijo
alter function public.tocar_actualizado() set search_path = '';
alter function public.proteger_publicacion() set search_path = '';
