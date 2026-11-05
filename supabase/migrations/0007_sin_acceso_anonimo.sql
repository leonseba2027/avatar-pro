-- =====================================================================
-- Avatar Pro — Defensa en profundidad
-- El rol anónimo nunca accede a las tablas (la encuesta pública pasa por el servidor)
-- =====================================================================
revoke all on all tables in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
-- Los trámites de consumidor solo los maneja el servidor
revoke all on public.tramites_consumidor from authenticated;
