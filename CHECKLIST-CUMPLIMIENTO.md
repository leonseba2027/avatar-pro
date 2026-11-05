# Checklist de cumplimiento — Avatar Pro

✅ = implementado en la app · 🟡 = preparado, falta un dato o una configuración tuya · 🔴 = lo tenés que hacer vos (no se resuelve con código)

> Esto no reemplaza el asesoramiento legal. **Antes de vender, hacé revisar todo por un abogado matriculado.**

---

## 1. Datos personales — Ley 25.326 y normas de la AAIP

| Requisito | Estado | Cómo está implementado / qué falta |
|---|---|---|
| Consentimiento expreso con casilla **no marcada** | ✅ | Registro, login con Google y encuesta. Se guardan la fecha y la versión del texto (`perfiles`) |
| Nueva aceptación si cambian los textos | ✅ | Cambiá `VERSION_TEXTOS_LEGALES` en `lib/legal.ts` y todos vuelven a aceptar |
| Política de privacidad clara | 🟡 | `legales/politica-de-privacidad.md` → completá `lib/legal.ts` (titular, CUIT, domicilio, email, fecha) |
| Leyenda obligatoria AAIP (Disp. 10/2008) | ✅ | Pie de todas las páginas, política de privacidad y consentimiento de la encuesta |
| Descargar mis datos (art. 14) | ✅ | Configuración → Descargar mis datos (JSON completo) |
| Eliminar mi cuenta (art. 16) | ✅ | Configuración → Eliminar mi cuenta (borra todo en cascada y deja una constancia de baja) |
| Revocar consentimientos | ✅ | Comunicaciones por email y avisos push, en Configuración |
| Minimización de datos | ✅ | Encuesta anónima, solo por rangos. Sin IP (huella diaria irreversible). Anonimización automática de lo que se carga |
| Sin datos sensibles | ✅ | Filtro automático (`lib/avatar/anonimizar.ts`) + instrucción a la IA + aviso en los formularios |
| Avatares ficticios y generales | ✅ | Nombre inventado, ilustración genérica, nunca fotos. Instrucción explícita a la IA |
| Transferencia internacional informada y consentida | ✅ | Casilla específica en el registro y en la encuesta. Detalle por proveedor en la política |
| Cláusulas contractuales con proveedores (Disp. 60/2016) | 🔴 | Revisá y aceptá los DPA (acuerdos de tratamiento de datos) de Supabase, Vercel y Anthropic desde sus paneles. Guardá una copia |
| Plazos de conservación | ✅ / 🟡 | Funciones de borrado listas (respuestas: 12 meses; registros: 24 meses). **Activá la tarea diaria** (ver README → Etapa 6) |
| Inscripción en el Registro Nacional de Bases de Datos | 🔴 | Con clave fiscal en la AAIP. Datos preparados en `legales/inscripcion-registro-bases-de-datos.md` |
| Rol de prestador por cuenta de terceros (art. 25) | ✅ / 🔴 | Explicado en la política y en los términos. Validá con tu abogado si hace falta un contrato aparte con los usuarios |

## 2. Defensa del consumidor — Ley 24.240, Res. SCI 424/2020 y 316/2018

| Requisito | Estado | Cómo está implementado / qué falta |
|---|---|---|
| Botón de arrepentimiento visible, sin login | ✅ | En el pie de todas las páginas → `/arrepentimiento`. Da un **código de trámite al instante** |
| Baja tan simple como el alta | ✅ | En la app (Configuración → Eliminar mi cuenta, sin pasos extra) y sin login (`/arrepentimiento?tipo=baja`) |
| Gestión de los trámites | ✅ / 🔴 | Panel `/admin/tramites` (configurá `ADMIN_EMAILS`). **Respondé cada trámite dentro de las 24 h hábiles** y devolvé el dinero por el mismo medio de pago |
| Precios finales en pesos, con impuestos | 🟡 | Página `/precios`: cargá tus planes en `lib/precios.ts` |
| IVA discriminado (Régimen de Transparencia Fiscal al Consumidor) | 🟡 | Se calcula el IVA contenido. **Confirmá con tu contador** la alícuota y si corresponde informar otros impuestos |
| Términos y condiciones con datos del titular | 🟡 | `legales/terminos-y-condiciones.md` → completá `lib/legal.ts` y la condición frente al IVA |
| Cobro de suscripciones | 🔴 | **La app todavía no cobra.** Para vender, falta integrar un medio de pago (por ejemplo Mercado Pago Suscripciones) y conectar el arrepentimiento y la baja con la cancelación del cobro. Es una etapa adicional |
| Facturación electrónica (ARCA) | 🔴 | Emití factura por cada cobro (de forma manual o integrada con el medio de pago) |

## 3. Comunicaciones — Ley 26.951 "No Llame"

| Requisito | Estado | Cómo está implementado / qué falta |
|---|---|---|
| Avisos solo con consentimiento | ✅ | Push: permiso del navegador + activación por dispositivo + interruptor por tipo. Email comercial: casilla opcional y revocable |
| Opción de baja | ✅ / 🔴 | En la app. Si enviás newsletters, **cada email debe incluir un enlace de baja** (lo da tu proveedor de email) |
| Registro "No Llame" | ✅ / 🔴 | La app no hace llamadas ni envía SMS. Si vos contactás por teléfono, consultá el registro antes (<https://nollame.aaip.gob.ar>) |
| Email transaccional con SMTP propio | 🔴 | Configurá Resend u otro proveedor en Supabase (ver README → 4.c) |

## 4. Accesibilidad — Ley 26.653 (WCAG 2.1 AA)

| Requisito | Estado | Cómo está implementado / qué falta |
|---|---|---|
| Contraste AA | ✅ | Colores verificados en modo claro y oscuro. **Auditoría automática axe-core: 0 problemas** en las páginas públicas, la encuesta y los gráficos |
| Textos alternativos | ✅ | Ilustraciones, QR, íconos decorativos ocultos y gráficos con descripción |
| Navegación por teclado | ✅ | Foco visible, "Saltar al contenido", diálogos accesibles |
| Lectores de pantalla | ✅ | Etiquetas, regiones, anuncios de estado. Cada gráfico tiene "Ver como tabla" |
| Gráficos que no dependen solo del color | ✅ | Valores escritos, leyendas, íconos y paleta apta para daltonismo |
| Declaración de accesibilidad | ✅ | `/accesibilidad` |
| Prueba con usuarios reales | 🔴 | Recomendado: probar con NVDA (Windows) o VoiceOver (iPhone/Mac) |

## 5. Seguridad — buenas prácticas IRAM-ISO/IEC 27001 y 27002

| Requisito | Estado | Cómo está implementado / qué falta |
|---|---|---|
| HTTPS | ✅ | Vercel + encabezado HSTS |
| Cifrado en reposo | ✅ | Supabase (AES-256) |
| Contraseñas con hash | ✅ | Supabase Auth (bcrypt) |
| Row Level Security | ✅ | En todas las tablas, probado con usuarios simulados |
| Claves de API solo en el servidor | ✅ | Anthropic, service_role, VAPID privada y Turnstile: solo variables del servidor |
| Logs de actividad | ✅ | Tabla `registro_actividad` (sesiones, consentimientos, cambios, aprobaciones, descargas) |
| Aprobación entre dispositivos | ✅ | Eliminar, regenerar, publicar la encuesta y cambiar la configuración |
| Desconexión remota de dispositivos | ✅ | Borra la sesión real |
| Anti-spam en la encuesta | ✅ / 🟡 | Campo trampa + límite por huella. CAPTCHA Turnstile opcional: **recomendado activarlo** |
| Copias de seguridad | 🔴 | Verificá el plan de Supabase (Pro: diarias) y hacé un respaldo propio semanal |
| Plan ante incidentes | ✅ / 🔴 | `legales/plan-de-respuesta-a-incidentes.md` → completá los responsables |
| Autenticación en dos pasos en tus paneles | 🔴 | Activá 2FA en GitHub, Vercel, Supabase, Anthropic y Google |
| Límite de gasto en IA | 🔴 | En console.anthropic.com → **Limits**, poné un tope mensual |

---

## Resumen de lo que tenés que hacer vos

1. **Completar** `lib/legal.ts` (titular, CUIT, domicilio, email, fecha) y `lib/precios.ts`.
2. **Revisión de un abogado** de los textos de `legales/`.
3. **Inscribir la base** en la AAIP (`legales/inscripcion-registro-bases-de-datos.md`).
4. **Aceptar los DPA** de Supabase, Vercel y Anthropic.
5. **Configurar:** `ADMIN_EMAILS`, SMTP propio, tarea diaria de mantenimiento, Turnstile, 2FA, límite de gasto, backups.
6. **Para cobrar:** integrar un medio de pago, configurar la facturación con tu contador y conectar el arrepentimiento y la baja con la cancelación del cobro.
7. **Responder los trámites** de `/admin/tramites` dentro de las 24 h hábiles.
