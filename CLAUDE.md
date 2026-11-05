# Avatar Pro — contexto para Claude

PWA en español (Next.js 15 + TypeScript + Tailwind 4, Supabase, API de Claude, Web Push, Recharts) para construir el avatar de cliente ideal de cada servicio. Las 6 etapas del plan están construidas (ver README.md y CHECKLIST-CUMPLIMIENTO.md).

## Estado (noviembre 2026)
- Código completo en `main`. Compila (`npx next build`) y la auditoría axe (WCAG 2.1 AA) da 0 problemas.
- Migraciones probadas en un Postgres que imita Supabase (`supabase/migrations/0001`…`0005`, son idempotentes).
- Supabase: proyecto `avatar-pro` (ref `panfqrcbkmlawatudnwc`, región sa-east-1) creado con las migraciones 0001 a 0007 aplicadas.
- Plantillas de email de Supabase: cargadas por el usuario.
- Vercel: proyecto `avatar-pro` (prj_Q3PYDl5TCJeyKMEqEocYhQZtHIje, team_EaEmUJD6SCrhOenVUQKu77mA), producción en https://avatar-pro-ten.vercel.app. **No está conectado a GitHub**: se publica desde la sesión con `npx vercel@48 deploy --prod --yes --token proxyinjected` (el token real lo inyecta el proxy del entorno Default para api.vercel.com).
- Variables cargadas: SUPABASE_URL/ANON_KEY, SITE_URL, VAPID (pública, privada y subject), ADMIN_EMAILS.
- Pendiente del usuario: SUPABASE_SERVICE_ROLE_KEY y ANTHROPIC_API_KEY en Vercel; URL Configuration en Supabase; revisar la Deployment Protection de Vercel.

## Próximos pasos (publicación)
1. Supabase: crear el proyecto (región São Paulo) → correr las migraciones 0001 a 0005 en orden → plantillas de email (Confirm signup, Reset password, Magic Link con `{{ .Token }}`; ver README) → URL Configuration.
2. Vercel: importar el repositorio `leonseba2027/avatar-pro` → cargar las variables de `.env.example` → deploy → actualizar `NEXT_PUBLIC_SITE_URL` y redeploy → poner la URL en Supabase.
3. Probar cada etapa según el README.
4. Después: integración de pagos (Mercado Pago Suscripciones), que no está hecha.

## Reglas
- Hablar con el usuario en español rioplatense, con pasos simples (tiene conocimientos técnicos básicos).
- **Nunca** pedir que pegue claves en el chat: las claves se cargan solo en Vercel o en los paneles.
- Los datos del titular quedan como `[COMPLETAR]` en `lib/legal.ts` hasta que el usuario los dé.
- Las acciones importantes de la app requieren aprobación entre dispositivos (ver `lib/aprobaciones/`).
