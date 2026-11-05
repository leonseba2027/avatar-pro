"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient as clienteTemporal } from "@supabase/supabase-js";
import { sesionActual, describirDispositivo } from "@/lib/dispositivos";
import { ACCIONES, describir, ejecutar, esAccion } from "@/lib/aprobaciones/acciones";
import { registrar } from "@/lib/auditoria";
import { notificar } from "@/lib/push";

const ACTIVO_DIAS = 30;

export type RespuestaSolicitud =
  | { ok: true; id: string; modo: "dispositivo"; otros: string[] }
  | { ok: true; id: string; modo: "codigo"; email: string }
  | { ok: false; error: string };

export type RespuestaResolucion = { ok: boolean; mensaje: string; regenerar?: { servicioId: string; aprobacionId: string } };

// ---------- Registro / latido del dispositivo ----------
export async function registrarDispositivo(): Promise<{ revocado: boolean }> {
  const { supabase, userId, sessionId } = await sesionActual();
  const { data: existente } = await supabase.from("dispositivos").select("id, revocado, ultima_conexion").eq("session_id", sessionId).maybeSingle();
  if (existente?.revocado) return { revocado: true };
  if (existente) {
    if (Date.now() - new Date(existente.ultima_conexion).getTime() > 5 * 60_000)
      await supabase.from("dispositivos").update({ ultima_conexion: new Date().toISOString() }).eq("id", existente.id);
    return { revocado: false };
  }
  const { nombre, tipo } = describirDispositivo((await headers()).get("user-agent") ?? "");
  await supabase.from("dispositivos").insert({ user_id: userId, session_id: sessionId, nombre, tipo });
  await registrar(supabase, userId, "dispositivo.nuevo", { nombre });
  return { revocado: false };
}

// ---------- Pedir aprobación ----------
export async function solicitarAprobacion(accion: string, detalle: unknown): Promise<RespuestaSolicitud> {
  if (!esAccion(accion)) return { ok: false, error: "Acción desconocida." };
  const p = ACCIONES[accion].safeParse(detalle);
  if (!p.success) return { ok: false, error: "Datos inválidos." };
  const { supabase, userId, sessionId, email } = await sesionActual();
  await registrarDispositivo();

  const { data: yo } = await supabase.from("dispositivos").select("id").eq("session_id", sessionId).single();
  const desde = new Date(Date.now() - ACTIVO_DIAS * 864e5).toISOString();
  const { data: activos } = await supabase.rpc("mis_dispositivos_activos");
  const otros = ((activos ?? []) as { session_id: string; nombre: string; ultima_conexion: string }[])
    .filter((d) => d.session_id !== sessionId && d.ultima_conexion >= desde);

  const descripcion = await describir(supabase, accion, p.data);
  const { data: ap, error } = await supabase.from("aprobaciones").insert({
    user_id: userId, accion, detalle: p.data, descripcion, solicitado_por: yo?.id, solicitado_session: sessionId,
  }).select("id").single();
  if (error || !ap) return { ok: false, error: "No se pudo crear la solicitud." };
  await registrar(supabase, userId, "aprobacion.solicitada", { id: ap.id, accion });

  if (otros && otros.length > 0) {
    await notificar(userId, "aprobacion", { titulo: "Permiso pendiente", cuerpo: `${descripcion}. Tocá para aprobar o rechazar.`, url: "/inicio" }, { excluirSession: sessionId });
    return { ok: true, id: ap.id, modo: "dispositivo", otros: otros.map((o) => o.nombre) };
  }

  // Sin otro dispositivo: se confirma con un código enviado por email
  if (!email) return { ok: false, error: "Tu cuenta no tiene email para enviar el código." };
  const r = await enviarCodigo(email);
  if (!r) return { ok: false, error: "No pudimos enviar el código por email. Esperá un minuto e intentá de nuevo." };
  return { ok: true, id: ap.id, modo: "codigo", email };
}

function temporal() {
  return clienteTemporal(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
}
async function enviarCodigo(email: string) {
  const { error } = await temporal().auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  return !error;
}

export async function reenviarCodigo(): Promise<boolean> {
  const { email } = await sesionActual();
  return email ? enviarCodigo(email) : false;
}

async function cargarPendiente(supabase: Awaited<ReturnType<typeof sesionActual>>["supabase"], id: string) {
  const { data: ap } = await supabase.from("aprobaciones").select("*").eq("id", id).single();
  if (!ap) return { error: "La solicitud no existe." } as const;
  if (ap.estado !== "pendiente") return { error: "Esta solicitud ya fue resuelta." } as const;
  if (new Date(ap.vence_at).getTime() < Date.now()) {
    await supabase.from("aprobaciones").update({ estado: "vencida", resuelto_at: new Date().toISOString() }).eq("id", id).eq("estado", "pendiente");
    return { error: "La solicitud venció (15 minutos). Pedila de nuevo." } as const;
  }
  return { ap } as const;
}

// Marca aprobada y ejecuta (salvo regenerar, que corre en /api/avatar/generar)
async function aprobarYEjecutar(ctx: Awaited<ReturnType<typeof sesionActual>>, ap: { id: string; accion: string; detalle: Record<string, unknown> }, via: "dispositivo" | "codigo_email", resueltoPor: string | null): Promise<RespuestaResolucion> {
  const { supabase, userId } = ctx;
  const { data: ok } = await supabase.from("aprobaciones").update({ estado: "aprobada", via, resuelto_por: resueltoPor, resuelto_at: new Date().toISOString() })
    .eq("id", ap.id).eq("estado", "pendiente").select("id").maybeSingle();
  if (!ok) return { ok: false, mensaje: "La solicitud ya fue resuelta." };
  await registrar(supabase, userId, "aprobacion.aprobada", { id: ap.id, accion: ap.accion, via });

  if (!esAccion(ap.accion)) return { ok: false, mensaje: "Acción desconocida." };
  if (ap.accion === "regenerar_avatar") return { ok: true, mensaje: "Aprobado. Regenerando el avatar…", regenerar: { servicioId: ap.detalle.servicioId as string, aprobacionId: ap.id } };

  // Reclamo atómico para no ejecutar dos veces
  const { data: reclamo } = await supabase.from("aprobaciones").update({ estado: "ejecutada" }).eq("id", ap.id).eq("estado", "aprobada").select("id").maybeSingle();
  if (!reclamo) return { ok: true, mensaje: "Aprobado." };
  try {
    const resultado = await ejecutar(supabase, userId, ap.accion, ap.detalle);
    await supabase.from("aprobaciones").update({ resultado }).eq("id", ap.id);
    await registrar(supabase, userId, `accion.${ap.accion}`, ap.detalle);
    revalidatePath("/", "layout");
    return { ok: true, mensaje: resultado };
  } catch {
    await supabase.from("aprobaciones").update({ estado: "fallida", resultado: "Error al ejecutar la acción." }).eq("id", ap.id);
    return { ok: false, mensaje: "Se aprobó, pero falló al ejecutarse." };
  }
}

// ---------- Resolver desde OTRO dispositivo ----------
export async function resolverAprobacion(id: string, decision: "aprobar" | "rechazar"): Promise<RespuestaResolucion> {
  const ctx = await sesionActual();
  const { supabase, userId, sessionId } = ctx;
  const r = await cargarPendiente(supabase, id);
  if ("error" in r) return { ok: false, mensaje: r.error! };
  if (r.ap.solicitado_session === sessionId) return { ok: false, mensaje: "Tenés que aprobarla desde otro dispositivo." };
  const { data: yo } = await supabase.from("dispositivos").select("id, revocado").eq("session_id", sessionId).maybeSingle();
  if (!yo || yo.revocado) return { ok: false, mensaje: "Este dispositivo no está autorizado." };

  if (decision === "rechazar") {
    await supabase.from("aprobaciones").update({ estado: "rechazada", via: "dispositivo", resuelto_por: yo.id, resuelto_at: new Date().toISOString() }).eq("id", id).eq("estado", "pendiente");
    await registrar(supabase, userId, "aprobacion.rechazada", { id, accion: r.ap.accion });
    return { ok: true, mensaje: "Solicitud rechazada." };
  }
  return aprobarYEjecutar(ctx, r.ap, "dispositivo", yo.id);
}

// ---------- Confirmar con código por email (un solo dispositivo) ----------
export async function verificarCodigo(id: string, codigo: string): Promise<RespuestaResolucion> {
  const ctx = await sesionActual();
  const { supabase, userId, sessionId, email } = ctx;
  if (!/^\d{6,10}$/.test(codigo.trim())) return { ok: false, mensaje: "Escribí el código numérico del email." };
  const r = await cargarPendiente(supabase, id);
  if ("error" in r) return { ok: false, mensaje: r.error! };
  if (r.ap.solicitado_session !== sessionId) return { ok: false, mensaje: "El código se usa en el mismo dispositivo que pidió la acción." };

  const { data, error } = await temporal().auth.verifyOtp({ email: email!, token: codigo.trim(), type: "email" });
  if (error || data.user?.id !== userId || !data.session) {
    await registrar(supabase, userId, "aprobacion.codigo_incorrecto", { id });
    return { ok: false, mensaje: "Código incorrecto o vencido." };
  }
  // La verificación crea una sesión temporal: la borramos enseguida
  const temporalSession = JSON.parse(Buffer.from(data.session.access_token.split(".")[1], "base64url").toString()).session_id;
  await supabase.rpc("borrar_sesion_temporal", { p_session: temporalSession });

  const { data: yo } = await supabase.from("dispositivos").select("id").eq("session_id", sessionId).maybeSingle();
  return aprobarYEjecutar(ctx, r.ap, "codigo_email", yo?.id ?? null);
}

export async function cancelarSolicitud(id: string) {
  const { supabase, userId, sessionId } = await sesionActual();
  await supabase.from("aprobaciones").update({ estado: "rechazada", resultado: "Cancelada por quien la pidió", resuelto_at: new Date().toISOString() })
    .eq("id", id).eq("estado", "pendiente").eq("solicitado_session", sessionId);
  await registrar(supabase, userId, "aprobacion.cancelada", { id });
}

export async function estadoAprobacion(id: string) {
  const { supabase } = await sesionActual();
  const { data } = await supabase.from("aprobaciones").select("estado, resultado").eq("id", id).single();
  return data;
}

// ---------- Dispositivos ----------
export async function desconectarDispositivo(sessionObjetivo: string): Promise<{ ok: boolean; mismo: boolean }> {
  const { supabase, userId, sessionId } = await sesionActual();
  const { error } = await supabase.rpc("desconectar_sesion", { p_session: sessionObjetivo });
  if (error) return { ok: false, mismo: false };
  await registrar(supabase, userId, "dispositivo.desconectado", { session: sessionObjetivo });
  revalidatePath("/dispositivos");
  return { ok: true, mismo: sessionObjetivo === sessionId };
}
