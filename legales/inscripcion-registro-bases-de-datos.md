# Datos para inscribir la base en el Registro Nacional de Bases de Datos (AAIP)

> La Ley 25.326 (art. 21) exige inscribir las bases de datos privadas que no sean de uso exclusivamente personal. El trámite se hace con **clave fiscal** en la AAIP / Trámites a Distancia (TAD). **Confirmá con tu abogado o contador el procedimiento vigente.**

## Paso a paso

1. Entrá a <https://www.argentina.gob.ar/aaip/datospersonales/responsables/registrar> y seguí el enlace al trámite, o buscá "Registro de Bases de Datos" en <https://tramitesadistancia.gob.ar>.
2. Ingresá con tu **CUIT y clave fiscal** (nivel 2 o superior).
3. Inscribí primero al **responsable** (vos o tu empresa) y después la **base de datos**, con la información de abajo.
4. Guardá el número de inscripción y cargalo en `legales/politica-de-privacidad.md` (sección 1).
5. Renová o actualizá la inscripción cuando cambie algo importante (finalidad, proveedores, tipos de datos).

## Información a declarar

### Responsable

- **Nombre o razón social:** [COMPLETAR]
- **CUIT:** [COMPLETAR]
- **Domicilio legal:** [COMPLETAR]
- **Email y teléfono de contacto:** [COMPLETAR]

### Base 1: "Usuarios de Avatar Pro"

| Campo | Valor sugerido |
|---|---|
| Finalidad | Prestación de un servicio de software (SaaS) para construir perfiles ficticios de cliente ideal; administración de cuentas y seguridad |
| Datos | Identificatorios: email, nombre (opcional). Técnicos: dispositivos, navegador, registro de actividad. Comerciales: plan contratado y trámites de arrepentimiento o baja |
| Datos sensibles | **No** |
| Origen | El propio titular |
| Forma de recolección | Formulario web con consentimiento expreso |
| Cesiones | No se ceden datos a terceros |
| Transferencias internacionales | Sí, a prestadores de servicios: Supabase Inc. (base de datos; servidores en Brasil, empresa en EE. UU.), Vercel Inc. (alojamiento, EE. UU.), Anthropic PBC (procesamiento de texto con IA, EE. UU.), Google LLC (inicio de sesión opcional, EE. UU.). Base legal: consentimiento expreso (art. 12) y cláusulas contractuales (Disp. 60/2016) |
| Plazo de conservación | Mientras la cuenta esté activa. Registros de seguridad: 24 meses |
| Medidas de seguridad | Nivel básico/medio según la Res. AAIP 47/2018: cifrado en tránsito y en reposo, control de acceso por usuario (RLS), hash de contraseñas, registro de actividad, copias de seguridad, plan de incidentes |
| Forma de ejercer los derechos | Desde la app (Configuración → Descargar mis datos / Eliminar mi cuenta) o por email a [COMPLETAR] |

### Base 2: "Información de clientes y respuestas de encuestas" (por cuenta de los usuarios)

| Campo | Valor sugerido |
|---|---|
| Rol de Avatar Pro | Prestador de servicios de tratamiento por cuenta de terceros (art. 25, Ley 25.326). Los responsables son los usuarios |
| Datos | Opiniones y respuestas anónimas; datos demográficos generales por rangos (edad, género, país, ocupación, nivel de ingresos, redes sociales). Se eliminan automáticamente identificadores y datos sensibles |
| Datos sensibles | **No** (se filtran y descartan) |
| Plazo de conservación | Respuestas de encuestas: 12 meses. Datos cargados: mientras el usuario los mantenga |
| Transferencias internacionales | Igual que la Base 1 |

> Consultá con tu abogado si la Base 2 debe inscribirse por separado o si alcanza con declarar tu rol de prestador.
