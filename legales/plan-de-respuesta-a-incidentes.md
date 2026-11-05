# Plan de respuesta ante incidentes de seguridad

> Basado en las buenas prácticas IRAM-ISO/IEC 27001 y 27002 (control de gestión de incidentes) y en la Resolución AAIP 47/2018 (Medidas de Seguridad Recomendadas). Adaptalo a tu organización.

**Responsable de seguridad:** [COMPLETAR: nombre, email, teléfono]
**Suplente:** [COMPLETAR]

## Qué es un incidente

- Acceso no autorizado a la base de datos, a Vercel, a Supabase o a la cuenta de Anthropic.
- Filtración de una clave secreta (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `VAPID_PRIVATE_KEY`, contraseña de un panel).
- Pérdida o borrado accidental de datos.
- Un usuario reporta que ve datos que no son suyos.
- Uso abusivo (spam masivo en encuestas, gastos inusuales en la API de IA).

## Paso 1 — Contener (primera hora)

1. **Rotá la clave comprometida:**
   - Supabase: **Project Settings → API → Roll** las claves (o **JWT Keys → rotar**).
   - Anthropic: **console.anthropic.com → API Keys → Disable** la clave y creá una nueva.
   - VAPID: generá un par nuevo (los usuarios tendrán que reactivar los avisos).
2. Cargá las claves nuevas en **Vercel → Settings → Environment Variables** y hacé **Redeploy**.
3. Si hace falta, cerrá todas las sesiones: en Supabase, **SQL Editor** → `delete from auth.sessions;`. Todos los usuarios vuelven a ingresar.
4. Si el ataque sigue: en Vercel, **Settings → Deployment Protection**, o pausá el proyecto en Supabase.

## Paso 2 — Evaluar (primeras 24 horas)

- **Qué datos** se vieron afectados, **de cuántas personas** y **desde cuándo**.
- Revisá la tabla `registro_actividad` (acciones por usuario y fecha), los logs de Vercel (**Logs**) y los de Supabase (**Logs → API / Auth / Postgres**).
- Guardá las evidencias (capturas, exportes de logs) **antes** de borrar nada.

## Paso 3 — Notificar

- **A los usuarios afectados**, sin demoras indebidas: qué pasó, qué datos, qué hicimos y qué pueden hacer (por ejemplo, cambiar la contraseña).
- **A la AAIP:** aunque hoy la Ley 25.326 no fija un plazo obligatorio de notificación, se recomienda informar los incidentes relevantes. Verificalo con tu abogado según la normativa vigente.
- A los proveedores involucrados (Supabase, Vercel, Anthropic), si el origen está en su servicio.

## Paso 4 — Recuperar

- Restaurá desde la copia de seguridad, si hubo pérdida de datos: Supabase → **Database → Backups**.
- Corregí la causa (código, configuración, permisos) y verificá que las políticas de seguridad (RLS) sigan activas.

## Paso 5 — Aprender

Registrá el incidente:

| Fecha | Descripción | Datos afectados | Personas | Causa | Medidas | Notificado a |
|---|---|---|---|---|---|---|
| | | | | | | |

Revisá este plan una vez por año.

## Copias de seguridad

- **Supabase:** verificá que tu plan incluya backups diarios. El plan **Pro** los incluye; en el plan gratuito no están garantizados.
- **Recomendado:** una exportación semanal propia, guardada cifrada fuera de Supabase:

  ```bash
  pg_dump "CADENA_DE_CONEXION" > respaldo.sql
  ```

  La cadena de conexión está en Supabase → **Connect**.
- Probá restaurar una copia al menos una vez cada 6 meses.
