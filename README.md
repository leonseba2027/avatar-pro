# Avatar Pro

App web (PWA) para construir el **avatar de cliente ideal** de cada servicio que ofrecés. Funciona en celular y computadora y se puede instalar como app.

> **Estado:** Etapa 1 de 6 (login y servicios) ✅

---

## Qué necesitás (todo gratis para empezar)

| Cuenta | Para qué | Etapa |
|---|---|---|
| **Supabase** | Login y base de datos | 1 |
| **GitHub** | Guardar el código (Vercel lo toma de ahí) | 1 |
| **Vercel** | Publicar la app en internet | 1 |
| **Google Cloud** | Botón "Ingresar con Google" (opcional) | 1 |
| **Anthropic** | Inteligencia artificial que genera los avatares | 2 |

---

## Paso 1 — Crear el proyecto en Supabase

1. Entrá a <https://supabase.com> → **Start your project** → registrate (podés usar tu email de Google).
2. Tocá **New project**:
   - **Name:** `avatar-pro`
   - **Database Password:** tocá *Generate a password* y **guardala** en un lugar seguro.
   - **Region:** `South America (São Paulo)` (la más cercana a Argentina).
   - Tocá **Create new project** y esperá 1–2 minutos.
3. Crear las tablas: menú izquierdo → **SQL Editor** → **New query** → abrí el archivo `supabase/migrations/0001_inicial.sql`, copiá **todo** su contenido, pegalo y tocá **Run**. Tiene que decir *Success*.
4. Copiar las claves: menú izquierdo → **Project Settings** (engranaje) → **API**. Vas a necesitar:
   - **Project URL** → es tu `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ⚠️ La clave **service_role** es secreta: no la compartas nunca ni la pegues en el chat.

### 1.b — Emails de confirmación que funcionan en cualquier dispositivo

Así podés registrarte en la compu y confirmar desde el celular.

**Authentication → Emails** (o *Email Templates*):

- **Confirm signup**: reemplazá el enlace por
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
- **Reset password**: reemplazá el enlace por
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`

Ejemplo de cuerpo para *Confirm signup*:

```html
<h2>Confirmá tu cuenta de Avatar Pro</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirmar mi email</a></p>
```

### 1.c — Direcciones permitidas

**Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000` por ahora. Cuando publiques en Vercel, cambiala por tu dirección `https://….vercel.app`.
- **Redirect URLs:** agregá `http://localhost:3000/**` y, después, `https://TU-APP.vercel.app/**`.

---

## Paso 2 — Crear la cuenta de GitHub

1. Entrá a <https://github.com/signup>.
2. Escribí tu email, una contraseña y un nombre de usuario (por ejemplo `sebaleon`).
3. Resolvé la verificación y escribí el código que te llega por email.
4. Elegí el plan **Free**.
5. Creá un repositorio: botón **+** (arriba a la derecha) → **New repository**:
   - **Repository name:** `avatar-pro`
   - Marcá **Private**.
   - **No** marques "Add a README".
   - Tocá **Create repository**.
6. Pasame el nombre del repositorio (ej.: `sebaleon/avatar-pro`) y te indico cómo conectarlo para que yo suba el código.

---

## Paso 3 — Publicar en Vercel

1. Entrá a <https://vercel.com/signup> → **Continue with GitHub** (usa la cuenta del paso 2).
2. **Add New… → Project** → elegí `avatar-pro` → **Import**.
3. Abrí **Environment Variables** y cargá:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | tu Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu clave anon |
   | `NEXT_PUBLIC_SITE_URL` | `https://avatar-pro-XXXX.vercel.app` (la completás después del primer deploy) |

4. Tocá **Deploy**. Cuando termine, copiá la dirección, actualizá `NEXT_PUBLIC_SITE_URL` (Settings → Environment Variables) y hacé **Redeploy**.
5. Volvé a Supabase → *URL Configuration* y poné esa dirección (Paso 1.c).

Vercel ya da HTTPS automáticamente.

---

## Paso 4 (opcional) — Login con Google

1. Entrá a <https://console.cloud.google.com> → creá un proyecto `avatar-pro`.
2. **APIs y servicios → Pantalla de consentimiento de OAuth** → tipo *Externo* → completá el nombre de la app y tu email.
3. **Credenciales → Crear credenciales → ID de cliente de OAuth** → tipo *Aplicación web*.
   - **URI de redireccionamiento autorizados:** `https://TU-PROYECTO.supabase.co/auth/v1/callback`
4. Copiá el *ID de cliente* y el *Secreto*.
5. En Supabase: **Authentication → Sign In / Providers → Google** → activalo y pegá los dos datos.

---

## Probarlo en tu computadora (opcional)

Requiere **Node.js 20 o superior** (<https://nodejs.org>, versión LTS).

```bash
npm install
cp .env.example .env.local   # y completá los valores
npm run dev
```

Abrí <http://localhost:3000>.

---

## Estructura

```
app/(publico)/   login, recuperar, consentimiento, textos legales
app/(app)/       inicio, servicios, configuración (requiere sesión)
app/auth/        callback de Google/email, confirmación, cerrar sesión
components/      piezas visuales reutilizables
lib/             conexión a Supabase, auditoría, datos legales
supabase/        scripts SQL (tablas + seguridad RLS)
public/          ícono, manifest PWA, service worker
```

## Seguridad incluida en la Etapa 1

- **Row Level Security:** cada usuario solo ve sus propios datos.
- **Contraseñas:** Supabase las guarda con hash bcrypt; la app nunca las ve.
- **Registro de actividad** (tabla `registro_actividad`): inicio y cierre de sesión, consentimientos y cambios en servicios.
- **Encabezados de seguridad:** HSTS, anti-iframe y nosniff.
- **Consentimiento obligatorio** antes de usar la app, con fecha y versión del texto aceptado.
