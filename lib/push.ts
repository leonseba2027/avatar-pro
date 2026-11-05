import "server-only";
import webpush from "web-push";
import { adminClient } from "@/lib/supabase/admin";

export type TipoAviso = "avatar" | "encuesta" | "aprobacion" | "pocos_datos";
export const TIPOS_AVISO: { tipo: TipoAviso; nombre: string; detalle: string }[] = [
  { tipo: "aprobacion", nombre: "Permisos pendientes", detalle: "Cuando otro dispositivo pide aprobar una acción" },
  { tipo: "encuesta", nombre: "Respuestas de encuesta", detalle: "Cuando alguien responde tu encuesta pública" },
  { tipo: "avatar", nombre: "Avatar actualizado", detalle: "Cuando un avatar tiene una versión nueva" },
  { tipo: "pocos_datos", nombre: "Pocos datos", detalle: "Cuando un avatar tiene un nivel de confianza bajo" },
];

let configurado = false;
function configurar() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  if (!configurado) { webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:contacto@example.com", pub, priv); configurado = true; }
  return true;
}

// Envía un aviso a todos los dispositivos suscriptos del usuario (respetando sus preferencias)
export async function notificar(userId: string, tipo: TipoAviso, aviso: { titulo: string; cuerpo: string; url: string }, opciones: { excluirSession?: string } = {}) {
  try {
    if (!configurar() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
    const db = adminClient();
    const { data: perfil } = await db.from("perfiles").select("notif").eq("id", userId).single();
    if (perfil?.notif && perfil.notif[tipo] === false) return;
    let q = db.from("push_suscripciones").select("id, endpoint, p256dh, auth, session_id").eq("user_id", userId);
    if (opciones.excluirSession) q = q.neq("session_id", opciones.excluirSession);
    const { data: subs } = await q;
    const payload = JSON.stringify({ ...aviso, tipo, etiqueta: `${tipo}-${aviso.url}` });
    await Promise.all((subs ?? []).map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 86400, urgency: tipo === "aprobacion" ? "high" : "normal" });
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await db.from("push_suscripciones").delete().eq("id", s.id); // suscripción vencida
      }
    }));
  } catch (e) {
    console.error("notificar", e); // un aviso fallido nunca rompe la acción principal
  }
}
