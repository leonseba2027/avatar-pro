import type { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

// Registro de actividad para auditoría de seguridad
export async function registrar(supabase: SupabaseClient, userId: string, accion: string, detalle: Record<string, unknown> = {}) {
  let ua: string | null = null;
  try { ua = (await headers()).get("user-agent")?.slice(0, 200) ?? null; } catch { /* fuera de una solicitud (tarea en segundo plano) */ }
  await supabase.from("registro_actividad").insert({ user_id: userId, accion, detalle, dispositivo: ua });
}
