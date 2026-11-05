"use server";
import { randomInt } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { registrar } from "@/lib/auditoria";
import { revalidatePath } from "next/cache";

// Revocar o dar consentimiento para comunicaciones por email (siempre libre y sin aprobación)
export async function cambiarComunicaciones(acepta: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("perfiles").update({ acepto_comunicaciones_at: acepta ? new Date().toISOString() : null }).eq("id", user.id);
  await registrar(supabase, user.id, acepta ? "consentimiento.comunicaciones_aceptado" : "consentimiento.comunicaciones_revocado");
  revalidatePath("/configuracion");
}

// Baja tan simple como el alta: sin aprobación de otro dispositivo, solo confirmación escrita.
export async function eliminarCuenta(confirmacion: string): Promise<{ ok: boolean; mensaje: string; codigo?: string }> {
  if (confirmacion.trim().toUpperCase() !== "ELIMINAR") return { ok: false, mensaje: "Escribí ELIMINAR para confirmar." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, mensaje: "Sesión vencida." };
  const admin = adminClient();

  // Constancia de baja (Res. 316/2018 y 424/2020): queda el código y el email, sin el resto de los datos
  const codigo = `BAJ-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomInt(100000, 999999)}`;
  await admin.from("tramites_consumidor").insert({ codigo, tipo: "baja", email: user.email ?? "sin-email", huella: "cuenta-eliminada", user_id: user.id, detalle: "Eliminación de cuenta desde la app", estado: "resuelto", resuelto_at: new Date().toISOString() });

  // Borra el usuario: todas las tablas se eliminan en cascada (perfil, servicios, avatares, datos, encuestas, dispositivos, registros)
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, mensaje: "No pudimos eliminar la cuenta. Escribinos y lo hacemos a mano." };
  await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  return { ok: true, mensaje: "Cuenta eliminada.", codigo };
}
