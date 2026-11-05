import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { registrar } from "@/lib/auditoria";
import { generarAvatar, mensajeError } from "@/lib/avatar/claude";
import { calcularConfianza } from "@/lib/avatar/confianza";
import type { DatosAvatar } from "@/lib/avatar/esquema";

export const maxDuration = 300; // la IA puede tardar 1–3 minutos

const Cuerpo = z.object({ servicioId: z.string().uuid(), modo: z.enum(["actualizar", "regenerar"]) });
const LIMITE_DIA = Number(process.env.LIMITE_GENERACIONES_DIA || 20);
const MAX_TEXTO = 600_000; // caracteres enviados por análisis

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });

  const p = Cuerpo.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  const { servicioId, modo } = p.data;

  // Límite diario por usuario (controla costos)
  const desde = new Date(Date.now() - 864e5).toISOString();
  const { count } = await supabase.from("registro_actividad").select("*", { count: "exact", head: true })
    .eq("accion", "avatar.generado").gte("creado_at", desde);
  if ((count ?? 0) >= LIMITE_DIA) return NextResponse.json({ error: `Llegaste al límite de ${LIMITE_DIA} análisis por día.` }, { status: 429 });

  const { data: servicio } = await supabase.from("servicios").select("id, nombre, descripcion").eq("id", servicioId).single();
  if (!servicio) return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });

  const { data: avatar } = await supabase.from("avatares").select("id, datos, version_actual").eq("servicio_id", servicioId).maybeSingle();
  const { data: todas } = await supabase.from("fuentes_datos")
    .select("id, tipo, contenido, caracteres, creado_at, usada_en_version").eq("servicio_id", servicioId).order("creado_at", { ascending: false });
  const fuentes = todas ?? [];

  const desdeCero = !avatar || modo === "regenerar";
  let aEnviar = desdeCero ? fuentes : fuentes.filter((f) => f.usada_en_version === null);
  if (!desdeCero && aEnviar.length === 0) return NextResponse.json({ error: "No hay datos nuevos para analizar. Cargá información primero." }, { status: 400 });

  // Recorta por volumen (se priorizan los más recientes)
  let total = 0;
  aEnviar = aEnviar.filter((f) => (total += f.caracteres) <= MAX_TEXTO);

  try {
    const { avatar: nuevo, modelo } = await generarAvatar({
      servicio,
      actual: desdeCero ? null : (avatar!.datos as DatosAvatar),
      fuentes: aEnviar.map((f) => ({ tipo: f.tipo, contenido: f.contenido })),
    });
    const { cambios, ...datos } = nuevo;
    const confianza = calcularConfianza(fuentes);
    const version = (avatar?.version_actual ?? 0) + 1;

    let avatarId = avatar?.id;
    if (avatar) {
      await supabase.from("avatares").update({ datos, nombre_ficticio: datos.nombre_ficticio, version_actual: version, confianza, es_hipotesis: fuentes.length === 0 }).eq("id", avatar.id);
    } else {
      const { data: creado, error } = await supabase.from("avatares").insert({
        user_id: user.id, servicio_id: servicioId, nombre_ficticio: datos.nombre_ficticio, datos, confianza, es_hipotesis: fuentes.length === 0,
      }).select("id").single();
      if (error || !creado) throw error;
      avatarId = creado.id;
    }
    await supabase.from("avatar_versiones").insert({
      avatar_id: avatarId, user_id: user.id, version, datos, confianza, modelo,
      cambios: version === 1 ? ["Primera versión del avatar."] : cambios,
      fuentes_analizadas: aEnviar.length,
      motivo: !avatar ? "creacion" : modo === "regenerar" ? "regeneracion" : "actualizacion",
    });
    if (aEnviar.length) await supabase.from("fuentes_datos").update({ usada_en_version: version }).in("id", aEnviar.map((f) => f.id));
    await registrar(supabase, user.id, "avatar.generado", { servicioId, version, modo, fuentes: aEnviar.length, modelo });

    return NextResponse.json({ ok: true, version, cambios, confianza, recortado: aEnviar.length < (desdeCero ? fuentes.length : fuentes.filter((f) => f.usada_en_version === null).length) });
  } catch (e) {
    console.error("generar avatar", e);
    return NextResponse.json({ error: mensajeError(e) }, { status: 502 });
  }
}
