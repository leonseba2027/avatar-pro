"use server";
import { z } from "zod";
import { sesionActual } from "@/lib/dispositivos";
import { registrar } from "@/lib/auditoria";
import { notificar } from "@/lib/push";

const Sub = z.object({ endpoint: z.string().url().max(1000), keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(100) }) });
const Prefs = z.object({ avatar: z.boolean(), encuesta: z.boolean(), aprobacion: z.boolean(), pocos_datos: z.boolean() });

export async function guardarSuscripcion(sub: unknown) {
  const p = Sub.safeParse(sub);
  if (!p.success) return false;
  const { supabase, userId, sessionId } = await sesionActual();
  await supabase.from("push_suscripciones").delete().eq("endpoint", p.data.endpoint);
  const { error } = await supabase.from("push_suscripciones").insert({ user_id: userId, session_id: sessionId, endpoint: p.data.endpoint, p256dh: p.data.keys.p256dh, auth: p.data.keys.auth });
  await registrar(supabase, userId, "avisos.activados", {});
  return !error;
}

export async function quitarSuscripcion(endpoint: string) {
  const { supabase, userId } = await sesionActual();
  await supabase.from("push_suscripciones").delete().eq("endpoint", endpoint);
  await registrar(supabase, userId, "avisos.desactivados", {});
}

export async function guardarPreferencias(prefs: unknown) {
  const p = Prefs.safeParse(prefs);
  if (!p.success) return false;
  const { supabase, userId } = await sesionActual();
  await supabase.from("perfiles").update({ notif: p.data }).eq("id", userId);
  await registrar(supabase, userId, "avisos.preferencias", p.data);
  return true;
}

export async function probarAviso() {
  const { userId } = await sesionActual();
  await notificar(userId, "avatar", { titulo: "¡Avisos activados!", cuerpo: "Así vas a ver las novedades de Avatar Pro.", url: "/configuracion" });
}
